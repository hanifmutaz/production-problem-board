import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, ImageOff, Pencil, Plus, Trash2, X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createProblem, resolvePhotoUrl, updateProblem } from "../api/problems";
import { buildGroupedItems, formatDate } from "../utils/dateGroups";
import PicAutocomplete from "./PicAutocomplete";
import { TableRowsSkeleton } from "./Skeletons";

// Delay per baris dicap biar list panjang (ratusan row) gak bikin baris terakhir
// nunggu berabad-abad buat muncul - stagger cuma kerasa di ~10 baris pertama.
const ROW_STAGGER_STEP = 0.03;
const ROW_STAGGER_CAP = 10;
const rowDelay = (visualIndex) => Math.min(visualIndex, ROW_STAGGER_CAP) * ROW_STAGGER_STEP;

const TODAY = new Date().toISOString().slice(0, 10);
const isOverdue = (p) => p.status === "Open" && p.due_date && p.due_date < TODAY;
const COL_COUNT = 12; // No, Date, Problem, Gambar, Qty, Root Cause, Countermeasure, Classification, PIC, Due Date, Status, aksi

const CLASS_OPTIONS = ["Quality", "Production", "Machine", "Material"];
const emptyForm = { date: TODAY, problem: "", qty: "", root_cause: "", countermeasure: "", classification: "", pic: "", due_date: "", status: "Open" };
const inputCls = "w-full rounded-md border border-slate-300 p-1.5 text-xs focus:border-blue-500 focus:outline-none";

function Badge({ status }) {
  const cls = status === "Open" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}
    >
      {status}
    </motion.span>
  );
}

// Satu baris input langsung di tabel - dipakai buat nambah data baru (mode="add")
// maupun edit data yang udah ada (mode="edit"), biar gak perlu modal popup lagi.
function EditableRow({ mode, venue, initial, no, onCancel, onSaved }) {
  const [form, setForm] = useState(() =>
    initial
      ? {
          date: initial.date || "", problem: initial.problem || "", qty: initial.qty ?? "",
          root_cause: initial.root_cause || "", countermeasure: initial.countermeasure || "",
          classification: initial.classification || "", pic: initial.pic || "",
          due_date: initial.due_date || "", status: initial.status || "Open",
        }
      : emptyForm
  );
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(initial?.photo ? resolvePhotoUrl(initial.photo) : null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const field = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!form.date || !form.problem.trim() || !form.pic.trim()) {
      setError("Date, Problem, & PIC wajib diisi");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("venue", venue);
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (photoFile) fd.append("photo", photoFile);
      if (mode === "edit") await updateProblem(initial.id, fd);
      else await createProblem(fd);
      onSaved();
    } catch (err) {
      setError(err.message || "Gagal simpan");
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") onCancel();
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      onKeyDown={handleKeyDown}
      className="border-t border-blue-200 bg-blue-50/70"
    >
      <td data-label="No" className="cell-plain border border-slate-100 p-2 text-center text-slate-400">
        {mode === "edit" ? no : <Plus size={14} className="mx-auto" />}
      </td>
      <td data-label="Tanggal" className="border border-slate-100 p-1.5">
        <input type="date" value={form.date} onChange={field("date")} className={inputCls} />
      </td>
      <td data-label="Problem" className="cell-stack border border-slate-100 p-1.5">
        <textarea rows={2} value={form.problem} onChange={field("problem")} placeholder="Deskripsi problem..." className={`${inputCls} resize-y`} />
      </td>
      <td data-label="Foto" className="cell-stack border border-slate-100 p-1.5 text-center">
        <input type="file" accept="image/*" id={`photo-${mode}-${initial?.id || "new"}`} className="hidden" onChange={handlePhoto} aria-label="Upload foto problem" />
        <label
          htmlFor={`photo-${mode}-${initial?.id || "new"}`}
          className="flex h-10 w-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-slate-300 text-slate-400 hover:border-blue-400 hover:text-blue-500 focus-within:ring-2 focus-within:ring-blue-500"
          title="Upload foto"
        >
          {photoPreview ? <img src={photoPreview} alt="Preview foto problem" className="h-full w-full object-cover" /> : <Camera size={14} />}
        </label>
      </td>
      <td data-label="Qty" className="border border-slate-100 p-1.5">
        <input type="number" min="0" value={form.qty} onChange={field("qty")} className={inputCls} />
      </td>
      <td data-label="Root Cause" className="cell-stack border border-slate-100 p-1.5">
        <textarea rows={2} value={form.root_cause} onChange={field("root_cause")} placeholder="Mechanism..." className={`${inputCls} resize-y`} />
      </td>
      <td data-label="Countermeasure" className="cell-stack border border-slate-100 p-1.5">
        <textarea rows={2} value={form.countermeasure} onChange={field("countermeasure")} placeholder="Countermeasure..." className={`${inputCls} resize-y`} />
      </td>
      <td data-label="Classification" className="border border-slate-100 p-1.5">
        <select value={form.classification} onChange={field("classification")} className={inputCls}>
          <option value="">-</option>
          {CLASS_OPTIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
      </td>
      <td data-label="PIC" className="cell-stack border border-slate-100 p-1.5">
        <PicAutocomplete value={form.pic} onChange={(v) => setForm((f) => ({ ...f, pic: v }))} venue={venue} required compact />
      </td>
      <td data-label="Due Date" className="border border-slate-100 p-1.5">
        <input type="date" value={form.due_date} onChange={field("due_date")} className={inputCls} />
      </td>
      <td data-label="Status" className="border border-slate-100 p-1.5">
        <select value={form.status} onChange={field("status")} className={inputCls}>
          <option>Open</option>
          <option>Close</option>
        </select>
      </td>
      <td className="cell-plain border border-slate-100 p-1.5 no-print">
        <div className="flex gap-1">
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={submitting}
            onClick={handleSave}
            title="Simpan"
            aria-label="Simpan problem"
            className="rounded-lg p-1.5 text-green-600 hover:bg-green-100 disabled:opacity-50"
          >
            <Check size={16} />
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.9 }}
            disabled={submitting}
            onClick={onCancel}
            title="Batal"
            aria-label="Batal"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
          >
            <X size={16} />
          </motion.button>
        </div>
        {error && <div className="mt-1 w-28 text-[10px] leading-tight text-red-600">{error}</div>}
      </td>
    </motion.tr>
  );
}

export default function ProblemTable({ rows, venue, onDelete, onPhotoClick, isAdding, onCancelAdd, onSaved, isLoading }) {
  const [editingId, setEditingId] = useState(null);
  const items = buildGroupedItems(rows);
  // Nunjukin gradient fade di kiri/kanan tabel kalau masih ada konten yang ke-scroll,
  // biar user (khususnya di HP/iPad) sadar tabelnya bisa digeser, bukan cuma "kepotong".
  const [scrollState, setScrollState] = useState({ left: false, right: false });
  const scrollWrapRef = useRef(null);

  const updateScrollState = (el) => {
    if (!el) return;
    setScrollState({
      left: el.scrollLeft > 4,
      right: el.scrollLeft + el.clientWidth < el.scrollWidth - 4,
    });
  };

  const handleScroll = (e) => updateScrollState(e.currentTarget);

  // Ref biasa (bukan callback inline) + cek ulang tiap data/loading state berubah,
  // soalnya lebar konten tabel bisa berubah pas data dateng / ganti mode skeleton.
  useEffect(() => {
    updateScrollState(scrollWrapRef.current);
  }, [rows, isAdding, isLoading]);

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        ref={scrollWrapRef}
        onScroll={handleScroll}
        className="overflow-x-auto rounded-xl"
      >
      <table className="responsive-table w-full border-collapse text-sm table-fixed">
        <colgroup>
          <col style={{ width: "3%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "4%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "8%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "6%" }} />
        </colgroup>
        <thead className="bg-sky-100">
          <tr>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">No</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Date</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Problem</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Gambar</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Qty</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Root Cause<br /><span className="font-normal text-slate-500">(Mechanism)</span></th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Action<br />Countermeasure</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Classification</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">PIC</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Due Date</th>
            <th className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Status</th>
            <th className="border border-sky-200 p-3 no-print"></th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {isAdding && (
              <EditableRow
                key="__add"
                mode="add"
                venue={venue}
                onCancel={onCancelAdd}
                onSaved={() => { onCancelAdd(); onSaved(); }}
              />
            )}

            {isLoading ? (
              <TableRowsSkeleton cols={COL_COUNT} rows={6} />
            ) : items.length === 0 && !isAdding ? (
              <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <td colSpan={COL_COUNT} className="cell-plain p-6 text-center text-slate-400">Belum ada data</td>
              </motion.tr>
            ) : (
              items.map((item, idx) => {
                const delay = rowDelay(idx);

                if (item.type === "month") {
                  return (
                    <motion.tr key={item.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.25 }}>
                      <td colSpan={COL_COUNT} className="cell-plain border border-slate-200 bg-navy px-4 py-2 text-left text-[13px] font-bold text-white">
                        {item.label}
                      </td>
                    </motion.tr>
                  );
                }
                if (item.type === "week") {
                  return (
                    <motion.tr key={item.key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay, duration: 0.25 }}>
                      <td colSpan={COL_COUNT} className="cell-plain border border-slate-200 bg-slate-100 px-4 py-1.5 text-left text-xs font-semibold text-slate-500">
                        {item.label}
                      </td>
                    </motion.tr>
                  );
                }

                const p = item.data;

                if (editingId === p.id) {
                  return (
                    <EditableRow
                      key={p.id}
                      mode="edit"
                      venue={venue}
                      initial={p}
                      no={item.no}
                      onCancel={() => setEditingId(null)}
                      onSaved={() => { setEditingId(null); onSaved(); }}
                    />
                  );
                }

                return (
                  <motion.tr
                    key={p.id}
                    layout
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: 40, backgroundColor: "#fee2e2" }}
                    transition={{ duration: 0.28, delay }}
                    whileHover={{ backgroundColor: isOverdue(p) ? "#fecaca" : "#f1f5f9" }}
                    className={`border-t border-slate-100 ${isOverdue(p) ? "bg-red-50 animate-pulse-slow" : ""}`}
                  >
                    <td data-label="No" className="border border-slate-100 p-3">{item.no}</td>
                    <td data-label="Tanggal" className="border border-slate-100 p-3 whitespace-nowrap">{formatDate(p.date)}</td>
                    <td data-label="Problem" className="cell-stack border border-slate-100 p-3 whitespace-pre-wrap break-words">{p.problem}</td>
                    <td data-label="Foto" className="cell-stack border border-slate-100 p-3">
                      {p.photo ? (
                        <motion.div
                          whileHover="hover"
                          onClick={() => onPhotoClick(resolvePhotoUrl(p.photo))}
                          role="button"
                          tabIndex={0}
                          aria-label={`Perbesar foto problem: ${p.problem}`}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPhotoClick(resolvePhotoUrl(p.photo)); } }}
                          title="Klik untuk perbesar"
                          className="group relative h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-slate-300 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <motion.img variants={{ hover: { scale: 1.15 } }} src={resolvePhotoUrl(p.photo)} alt={`Foto problem: ${p.problem}`} className="h-full w-full object-cover" />
                          <motion.div variants={{ hover: { opacity: 1 } }} initial={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center bg-black/30">
                            <ZoomIn size={16} className="text-white" />
                          </motion.div>
                        </motion.div>
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-300" aria-label="Tidak ada foto">
                          <ImageOff size={16} />
                        </div>
                      )}
                    </td>
                    <td data-label="Qty" className="border border-slate-100 p-3">{p.qty}</td>
                    <td data-label="Root Cause" className="cell-stack border border-slate-100 p-3 whitespace-pre-wrap break-words">{p.root_cause || "-"}</td>
                    <td data-label="Countermeasure" className="cell-stack border border-slate-100 p-3 whitespace-pre-wrap break-words">{p.countermeasure || "-"}</td>
                    <td data-label="Classification" className="border border-slate-100 p-3">{p.classification || "-"}</td>
                    <td data-label="PIC" className="border border-slate-100 p-3 whitespace-nowrap">{p.pic}</td>
                    <td data-label="Due Date" className="border border-slate-100 p-3 whitespace-nowrap">{p.due_date ? formatDate(p.due_date) : "-"}</td>
                    <td data-label="Status" className="border border-slate-100 p-3"><Badge status={p.status} /></td>
                    <td className="cell-plain border border-slate-100 p-3 no-print">
                      <div className="flex justify-end gap-1.5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setEditingId(p.id)}
                          title="Edit"
                          aria-label={`Edit problem: ${p.problem}`}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={16} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onDelete(p.id)}
                          title="Hapus"
                          aria-label={`Hapus problem: ${p.problem}`}
                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </AnimatePresence>
        </tbody>
      </table>
      </div>

      {/* Gradient fade kiri/kanan - cuma nongol kalau ada konten tersembunyi ke arah itu.
          no-print biar gak ikut ke-print. pointer-events-none biar gak nghalangin klik/scroll. */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 left-0 w-8 rounded-l-xl bg-gradient-to-r from-white to-transparent no-print transition-opacity duration-150 ${
          scrollState.left ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-y-0 right-0 w-8 rounded-r-xl bg-gradient-to-l from-white to-transparent no-print transition-opacity duration-150 ${
          scrollState.right ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
