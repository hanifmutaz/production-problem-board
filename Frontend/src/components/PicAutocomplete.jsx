import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getPics } from "../api/problems";

// Input PIC bebas ketik (bukan dropdown tetap). Nama-nama yang pernah disubmit
// sebelumnya muncul sebagai rekomendasi/saran, tapi nama baru tetap bisa diketik & disimpan.
export default function PicAutocomplete({ value, onChange, venue, required, compact }) {
  const [allPics, setAllPics] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(-1);
  const wrapRef = useRef(null);

  // ambil daftar nama PIC yang pernah dipakai di venue ini, tiap kali venue berubah
  useEffect(() => {
    let alive = true;
    getPics(venue)
      .then((list) => { if (alive) setAllPics(list); })
      .catch(() => { if (alive) setAllPics([]); });
    return () => { alive = false; };
  }, [venue]);

  // tutup dropdown kalau klik di luar
  useEffect(() => {
    function onClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const query = (value || "").trim().toLowerCase();
  const suggestions = query
    ? allPics.filter((p) => p.toLowerCase().includes(query) && p.toLowerCase() !== query)
    : allPics;

  const pick = (name) => {
    onChange(name);
    setOpen(false);
    setHighlight(-1);
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => (h + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => (h - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && highlight >= 0) {
      e.preventDefault();
      pick(suggestions[highlight]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search size={compact ? 12 : 14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          required={required}
          value={value}
          onChange={(e) => { onChange(e.target.value); setOpen(true); setHighlight(-1); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={compact ? "Nama PIC" : "Ketik nama PIC (baru atau yang sudah ada)"}
          className={compact ? "w-full rounded-md border border-slate-300 py-1 pl-6 pr-1.5 text-xs focus:border-blue-500 focus:outline-none" : "input pl-8"}
          autoComplete="off"
        />
      </div>

      <AnimatePresence>
        {open && suggestions.length > 0 && (
          <motion.ul
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute z-10 mt-1 max-h-44 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
          >
            {suggestions.map((name, i) => (
              <li
                key={name}
                onMouseDown={(e) => { e.preventDefault(); pick(name); }}
                onMouseEnter={() => setHighlight(i)}
                className={`cursor-pointer px-3 py-1.5 text-sm ${
                  highlight === i ? "bg-blue-50 text-blue-700" : "text-slate-700"
                }`}
              >
                {name}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
