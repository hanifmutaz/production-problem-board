import { motion } from "framer-motion";
import useCountUp from "../hooks/useCountUp";

const KPI_STYLE = {
  total: { bar: "bg-blue-500", value: "text-blue-900" },
  open: { bar: "bg-red-500", value: "text-red-700" },
  close: { bar: "bg-green-500", value: "text-green-700" },
  over: { bar: "bg-amber-500", value: "text-amber-700" },
};

function KpiCard({ tone, label, value, sub, index }) {
  const s = KPI_STYLE[tone];
  const animated = useCountUp(value);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.08, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 10px 24px -8px rgba(15,23,42,0.18)" }}
      className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
    >
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${s.bar}`} />
      <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      <div className={`mt-0.5 text-xl font-bold tabular-nums ${s.value}`}>{animated}</div>
      <div className="text-[10px] text-slate-400">{sub}</div>
    </motion.div>
  );
}

// Ditumpuk 2x2 dalam satu grid, ukuran card di tengah-tengah (gak kegedean, gak kekecilan)
// biar tingginya total pas nyamain chart di sampingnya - lihat pemakaiannya di BoardPage.jsx
export default function KpiCards({ summary }) {
  const s = summary || { total: 0, open: 0, close: 0, overdue: 0 };
  return (
    <div className="grid min-w-[240px] flex-[1.15] grid-cols-2 gap-2 self-start">
      <KpiCard index={0} tone="total" label="Total Problem" value={s.total} sub="Semua record" />
      <KpiCard index={1} tone="open" label="Open" value={s.open} sub="Belum selesai" />
      <KpiCard index={2} tone="close" label="Close" value={s.close} sub="Sudah selesai" />
      <KpiCard index={3} tone="over" label="Overdue" value={s.overdue} sub="Lewat due date" />
    </div>
  );
}
