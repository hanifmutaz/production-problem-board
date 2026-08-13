export default function DonutCard({ open, close }) {
  const total = open + close || 1;
  const openPct = (open / total) * 100;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm">
      <h3 className="mb-3.5 text-sm font-semibold text-slate-700">Open vs Close</h3>
      <div className="flex items-center gap-4.5">
        <svg width="130" height="130" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.915" fill="none" stroke="#22c55e" strokeWidth="6" />
          <circle
            cx="21" cy="21" r="15.915" fill="none" stroke="#ef4444" strokeWidth="6"
            strokeDasharray={`${openPct} ${100 - openPct}`} strokeDashoffset="25"
          />
          <text x="21" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill="#334155">
            {open + close}
          </text>
          <text x="21" y="26" textAnchor="middle" fontSize="3.5" fill="#94a3b8">total</text>
        </svg>
        <div className="text-sm">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-red-500" /> Open <b className="ml-1">{open}</b>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-sm bg-green-500" /> Close <b className="ml-1">{close}</b>
          </div>
        </div>
      </div>
    </div>
  );
}
