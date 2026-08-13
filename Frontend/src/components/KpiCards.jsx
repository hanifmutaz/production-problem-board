const KPI_STYLE = {
  total: { bar: "bg-blue-500", value: "text-blue-900" },
  open: { bar: "bg-red-500", value: "text-red-700" },
  close: { bar: "bg-green-500", value: "text-green-700" },
  over: { bar: "bg-amber-500", value: "text-amber-700" },
};

function KpiCard({ tone, label, value, sub }) {
  const s = KPI_STYLE[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${s.bar}`} />
      <div className="text-[13px] font-semibold text-slate-500">{label}</div>
      <div className={`mt-1.5 text-3xl font-bold ${s.value}`}>{value}</div>
      <div className="mt-0.5 text-xs text-slate-400">{sub}</div>
    </div>
  );
}

export default function KpiCards({ summary }) {
  const s = summary || { total: 0, open: 0, close: 0, overdue: 0 };
  return (
    <div className="mb-5 grid grid-cols-2 gap-4 md:grid-cols-4">
      <KpiCard tone="total" label="Total Problem" value={s.total} sub="Semua record" />
      <KpiCard tone="open" label="Open" value={s.open} sub="Belum selesai" />
      <KpiCard tone="close" label="Close" value={s.close} sub="Sudah selesai" />
      <KpiCard tone="over" label="Overdue" value={s.overdue} sub="Lewat due date" />
    </div>
  );
}
