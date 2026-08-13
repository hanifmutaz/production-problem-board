export default function Toolbar({ search, setSearch, status, setStatus, count }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print">
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari problem / PIC..."
          className="w-60 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-sm:w-full"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Close">Close</option>
        </select>
      </div>
      <div className="text-sm text-slate-500">
        Total: <b className="text-slate-700">{count}</b> problem
      </div>
    </div>
  );
}
