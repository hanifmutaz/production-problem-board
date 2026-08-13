import { motion } from "framer-motion";

export default function BarChartCard({ title, data, colorFor }) {
  const entries = Object.entries(data || {}).sort((a, b) => b[1] - a[1]);
  const max = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.2 }}
      className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm"
    >
      <h3 className="mb-3.5 text-sm font-semibold text-slate-700">{title}</h3>
      {entries.length === 0 ? (
        <div className="py-6 text-center text-sm text-slate-400">Belum ada data</div>
      ) : (
        <div className="space-y-3">
          {entries.map(([name, val], i) => (
            <div key={name} className="flex items-center gap-2.5">
              <div className="w-20 shrink-0 truncate text-right text-xs text-slate-600" title={name}>
                {name}
              </div>
              <div className="h-5 flex-1 overflow-hidden rounded-md bg-slate-100">
                <motion.div
                  key={`${name}-${val}`}
                  className="h-full rounded-md"
                  style={{ background: colorFor(name) }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(val / max) * 100}%` }}
                  transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                />
              </div>
              <div className="w-6 text-xs font-semibold text-slate-700">{val}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
