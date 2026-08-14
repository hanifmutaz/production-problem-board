import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Header from "../components/Header";
import VenueTabs from "../components/VenueTabs";
import KpiCards from "../components/KpiCards";
import BarChartCard from "../components/BarChartCard";
import DonutCard from "../components/DonutCard";
import Toolbar from "../components/Toolbar";
import ProblemTable from "../components/ProblemTable";
import ProblemModal from "../components/ProblemModal";
import Lightbox from "../components/Lightbox";
import { getProblems, getSummary, createProblem, updateProblem, deleteProblem, apiBaseLabel } from "../api/problems";

const CLASS_COLOR = { Quality: "#3b82f6", Production: "#8b5cf6", Machine: "#f59e0b", Material: "#14b8a6" };

export default function BoardPage({ venue }) {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [showInsights, setShowInsights] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [tableRows, sum] = await Promise.all([getProblems(venue, search, status), getSummary(venue)]);
      setRows(tableRows);
      setSummary(sum);
      setLoadError(false);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    }
  }, [venue, search, status]);

  // reset filter tiap pindah venue biar gak ketuker
  useEffect(() => {
    setSearch("");
    setStatus("All");
  }, [venue]);

  // debounce biar gak fetch tiap ketikan
  useEffect(() => {
    const t = setTimeout(refresh, 250);
    return () => clearTimeout(t);
  }, [refresh]);

  const handleAdd = () => { setEditing(null); setModalOpen(true); };
  const handleEdit = (row) => { setEditing(row); setModalOpen(true); };
  const handleClose = () => setModalOpen(false);

  const handleSubmit = async (formData, id) => {
    setSubmitting(true);
    try {
      if (id) await updateProblem(id, formData);
      else await createProblem(formData);
      setModalOpen(false);
      refresh();
    } catch (err) {
      alert(err.message || "Gagal simpan");
    } finally {
      setSubmitting(false);
    }
  };

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
      <Header onAdd={handleAdd} venue={venue} />
      <VenueTabs active={venue} />

      <main className="mx-auto max-w-[1920px] p-6">
        <AnimatePresence>
          {loadError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25 }}
              className="mb-4 overflow-hidden rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 no-print"
            >
              Gagal konek ke server. Pastikan {apiBaseLabel} aktif dan bisa diakses.
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowInsights((s) => !s)}
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
                <KpiCards summary={summary} />
                <BarChartCard title="Problem by Classification" data={summary?.byClassification} colorFor={(n) => CLASS_COLOR[n] || "#94a3b8"} />
                <DonutCard open={summary?.open || 0} close={summary?.close || 0} />
                <BarChartCard title="Problem by PIC" data={summary?.byPic} colorFor={() => "#1f3a5f"} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Toolbar search={search} setSearch={setSearch} status={status} setStatus={setStatus} count={rows.length} venue={venue} />

        <ProblemTable rows={rows} onEdit={handleEdit} onDelete={handleDelete} onPhotoClick={setLightbox} />
      </main>

      <ProblemModal
        open={modalOpen}
        editing={editing}
        venue={venue}
        onClose={handleClose}
        onSubmit={handleSubmit}
        submitting={submitting}
        onPreviewClick={setLightbox}
      />
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
