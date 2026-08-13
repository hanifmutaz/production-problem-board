export default function BarChartCard({ title, data, colorFor }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-slate-700">{title}</h3>
      {entries.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">Belum ada data</div>
      ) : (
        <div className="space-y-3">
          {entries.map(([name, val]) => (
            <div key={name} className="flex items-center gap-2.5">
              <div className="w-20 shrink-0 truncate text-right text-xs text-slate-600" title={name}>
                {name}
              </div>
              <div className="h-5 flex-1 overflow-hidden rounded-md bg-slate-100">
                <div
                  className="h-full rounded-md transition-all duration-300"
                  style={{ width: `${(val / max) * 100}%`, background: colorFor(name) }}
                />
              </div>
              <div className="w-6 text-xs font-semibold text-slate-700">{val}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
