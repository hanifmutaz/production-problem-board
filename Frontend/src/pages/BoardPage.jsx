import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, RotateCw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../components/Header";
import VenueTabs from "../components/VenueTabs";
import KpiCards from "../components/KpiCards";
import BarChartCard from "../components/BarChartCard";
import DonutCard from "../components/DonutCard";
import Toolbar from "../components/Toolbar";
import ProblemTable from "../components/ProblemTable";
import Lightbox from "../components/Lightbox";
import { KpiCardsSkeleton, ChartCardSkeleton, DonutCardSkeleton } from "../components/Skeletons";
import { getProblems, getSummary, deleteProblem, apiBaseLabel } from "../api/problems";

const CLASS_COLOR = { Quality: "#3b82f6", Production: "#8b5cf6", Machine: "#f59e0b", Material: "#14b8a6" };

export default function BoardPage({ venue }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [isAdding, setIsAdding] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  // null = belum pernah kebuka sama sekali (tampilin skeleton), beda sama loading biasa
  const [initialLoading, setInitialLoading] = useState(true);
  // true tiap kali refetch jalan di background (filter/search/pindah venue),
  // dipakai buat thin loading bar di bawah header - gak nge-block tampilan data lama
  const [isRefreshing, setIsRefreshing] = useState(false);
  const requestIdRef = useRef(0);

  const refresh = useCallback(async () => {
    const myId = ++requestIdRef.current;
    setIsRefreshing(true);
    try {
      const [tableRows, sum] = await Promise.all([getProblems(venue, search, status), getSummary(venue)]);
      if (myId !== requestIdRef.current) return; // response basi (venue/filter udah ganti lagi), abaikan
      setRows(tableRows);
      setSummary(sum);
      setLoadError(false);
    } catch (err) {
      if (myId !== requestIdRef.current) return;
      console.error(err);
      setLoadError(true);
    } finally {
      if (myId === requestIdRef.current) {
        setIsRefreshing(false);
        setInitialLoading(false);
      }
    }
  }, [venue, search, status]);

  // reset filter & form input tiap pindah venue biar gak ketuker
  useEffect(() => {
    setSearch("");
    setStatus("All");
    setIsAdding(false);
    setInitialLoading(true);
  }, [venue]);

  // debounce biar gak fetch tiap ketikan
  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const handleDelete = async (id) => {
    if (!confirm("Hapus problem ini?")) return;
    try {
      await deleteProblem(id);
      refresh();
    } catch (err) {
      alert(err.message || "Gagal hapus");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <Header onAdd={() => setIsAdding(true)} venue={venue} />
      <VenueTabs active={venue} />

      {/* Thin indeterminate bar - nunjukin ada refetch jalan di background (filter/search/ganti venue)
          tanpa nge-block/nge-flash konten lama. Ketutup otomatis pas initialLoading (skeleton udah handle itu). */}
      <div className="h-0.5 w-full no-print">
        <AnimatePresence>
          {isRefreshing && !initialLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="loading-bar-track h-0.5 w-full"
            >
              <div className="loading-bar-fill h-full" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <main className="mx-auto max-w-[1920px] p-3 sm:p-6">
        <AnimatePresence>
          {loadError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-4 flex items-center justify-between gap-3 overflow-hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 no-print"
            >
              <span>Gagal konek ke server. Pastikan {apiBaseLabel} aktif dan bisa diakses.</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.92 }}
                onClick={refresh}
                aria-label="Coba lagi konek ke server"
                className="flex shrink-0 items-center gap-1.5 rounded-md border border-red-300 bg-white px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
              >
                <RotateCw size={12} /> Coba lagi
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowInsights((s) => !s)}
          aria-expanded={showInsights}
          className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-slate-500 no-print hover:text-slate-700"
        >
          <motion.span animate={{ rotate: showInsights ? 0 : -90 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={16} />
          </motion.span>
          {showInsights ? "Sembunyikan Insights" : "Tampilkan Insights"}
        </button>

        <AnimatePresence initial={false}>
          {showInsights && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="mb-6 flex flex-wrap gap-3">
                {initialLoading ? (
                  <>
                    <KpiCardsSkeleton />
                    <ChartCardSkeleton />
                    <DonutCardSkeleton />
                    <ChartCardSkeleton />
                  </>
                ) : (
                  <>
                    <KpiCards summary={summary} />
                    <BarChartCard title="Problem by Classification" data={summary?.byClassification} colorFor={(n) => CLASS_COLOR[n] || "#94a3b8"} />
                    <DonutCard open={summary?.open || 0} close={summary?.close || 0} />
                    <BarChartCard title="Problem by PIC" data={summary?.byPic} colorFor={() => "#1f3a5f"} />
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Toolbar search={search} setSearch={setSearch} status={status} setStatus={setStatus} count={rows.length} venue={venue} />

        {/* key={venue} biar tabel & isi lain crossfade halus pas pindah tab venue,
            bukan loncat instan gonta-ganti data */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={venue}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <ProblemTable
              rows={rows}
              venue={venue}
              onDelete={handleDelete}
              onPhotoClick={setLightbox}
              isAdding={isAdding}
              onCancelAdd={() => setIsAdding(false)}
              onSaved={refresh}
              isLoading={initialLoading}
            />
          </motion.div>
        </AnimatePresence>
      </main>

      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
