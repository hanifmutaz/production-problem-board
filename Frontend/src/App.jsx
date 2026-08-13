import { useCallback, useEffect, useState } from "react";
import Header from "./components/Header";
import KpiCards from "./components/KpiCards";
import BarChartCard from "./components/BarChartCard";
import DonutCard from "./components/DonutCard";
import Toolbar from "./components/Toolbar";
import ProblemTable from "./components/ProblemTable";
import ProblemModal from "./components/ProblemModal";
import Lightbox from "./components/Lightbox";
import { getProblems, getSummary, createProblem, updateProblem, deleteProblem } from "./api/problems";

const CLASS_COLOR = { Quality: "#3b82f6", Production: "#8b5cf6", Machine: "#f59e0b", Material: "#14b8a6" };

export default function App() {
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [lightbox, setLightbox] = useState(null);
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const [tableRows, sum] = await Promise.all([getProblems(search, status), getSummary()]);
      setRows(tableRows);
      setSummary(sum);
      setLoadError(false);
    } catch (err) {
      console.error(err);
      setLoadError(true);
    }
  }, [search, status]);

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
      <Header onAdd={handleAdd} />

      <main className="mx-auto max-w-[1180px] p-6">
        {loadError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 no-print">
            Gagal konek ke server. Pastikan backend (ppcb-backend) jalan di port 3000.
          </div>
        )}

        <KpiCards summary={summary} />

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr_1.2fr]">
          <BarChartCard title="Problem by Classification" data={summary?.byClassification} colorFor={(n) => CLASS_COLOR[n] || "#94a3b8"} />
          <DonutCard open={summary?.open || 0} close={summary?.close || 0} />
          <BarChartCard title="Problem by PIC" data={summary?.byPic} colorFor={() => "#1f3a5f"} />
        </div>

        <Toolbar search={search} setSearch={setSearch} status={status} setStatus={setStatus} count={rows.length} />

        <ProblemTable rows={rows} onEdit={handleEdit} onDelete={handleDelete} onPhotoClick={setLightbox} />
      </main>

      <ProblemModal
        open={modalOpen}
        editing={editing}
        onClose={handleClose}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
      <Lightbox src={lightbox} onClose={() => setLightbox(null)} />
    </div>
  );
}
