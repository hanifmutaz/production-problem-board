// Placeholder loading buat pertama kali data belum dateng (summary/rows === null),
// biar gak ada "kedip kosong" pas venue baru dibuka atau network lemot.
// Semua pake .skeleton-pulse (lihat index.css) yang otomatis nurut prefers-reduced-motion.

export function KpiCardsSkeleton() {
  return (
    <div className="grid min-w-[240px] flex-[1.15] grid-cols-2 gap-2 self-start">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm"
        >
          <span className="absolute left-0 top-0 bottom-0 w-1 skeleton-pulse" />
          <div className="mb-1.5 h-2.5 w-16 rounded skeleton-pulse" />
          <div className="mb-1.5 h-5 w-10 rounded skeleton-pulse" />
          <div className="h-2 w-12 rounded skeleton-pulse" />
        </div>
      ))}
    </div>
  );
}

export function ChartCardSkeleton({ flex = "flex-[1.3]" }) {
  return (
    <div className={`min-w-[240px] ${flex} rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm`}>
      <div className="mb-3 h-2.5 w-32 rounded skeleton-pulse" />
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-2.5 w-16 shrink-0 rounded skeleton-pulse" />
            <div className="h-5 flex-1 rounded-md skeleton-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutCardSkeleton() {
  return (
    <div className="min-w-[210px] flex-1 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="mb-3 h-2.5 w-24 rounded skeleton-pulse" />
      <div className="flex items-center gap-3.5">
        <div className="h-24 w-24 shrink-0 rounded-full skeleton-pulse" />
        <div className="space-y-2">
          <div className="h-2.5 w-16 rounded skeleton-pulse" />
          <div className="h-2.5 w-16 rounded skeleton-pulse" />
        </div>
      </div>
    </div>
  );
}

export function TableRowsSkeleton({ cols = 12, rows = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, r) => (
        <tr key={r} className="border-t border-slate-100">
          {Array.from({ length: cols }).map((_, c) => (
            <td key={c} className="cell-plain border border-slate-100 p-3">
              <div className="h-3 rounded skeleton-pulse" style={{ width: c === 0 ? "60%" : "80%" }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
