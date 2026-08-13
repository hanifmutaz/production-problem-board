import { motion } from "framer-motion";

export default function Toolbar({ search, setSearch, status, setStatus, count }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35, delay: 0.3 }}
      className="mb-4 flex flex-wrap items-center justify-between gap-3 no-print"
    >
      <div className="flex flex-wrap gap-2">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari problem / PIC..."
          className="w-60 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:border-blue-500 focus:ring-1 focus:ring-blue-500 max-sm:w-full"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition-shadow focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Close">Close</option>
        </select>
      </div>
      <div className="text-sm text-slate-500">
        Total:{" "}
        <motion.b
          key={count}
          initial={{ scale: 1.3, color: "#2563eb" }}
          animate={{ scale: 1, color: "#334155" }}
          transition={{ duration: 0.35 }}
          className="inline-block text-slate-700"
        >
          {count}
        </motion.b>{" "}
        problem
      </div>
    </motion.div>
  );
}
