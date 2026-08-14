import { motion } from "framer-motion";
import useCountUp from "../hooks/useCountUp";

export default function DonutCard({ open, close }) {
  const total = open + close || 1;
  const openPct = (open / total) * 100;
  const animatedTotal = useCountUp(open + close);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1 }}
      className="min-w-[210px] flex-1 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm"
    >
      <h3 className="mb-2.5 text-xs font-semibold text-slate-700">Open vs Close</h3>
      <div className="flex items-center gap-3.5">
        <svg width="96" height="96" viewBox="0 0 42 42">
          <circle cx="21" cy="21" r="15.915" fill="none" stroke="#22c55e" strokeWidth="6" />
          <motion.circle
            cx="21" cy="21" r="15.915" fill="none" stroke="#ef4444" strokeWidth="6"
            strokeDashoffset="25"
            initial={{ strokeDasharray: "0 100" }}
            animate={{ strokeDasharray: `${openPct} ${100 - openPct}` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
          <text x="21" y="20" textAnchor="middle" fontSize="7" fontWeight="700" fill="#334155">
            {animatedTotal}
          </text>
          <text x="21" y="26" textAnchor="middle" fontSize="3.5" fill="#94a3b8">total</text>
        </svg>
        <div className="text-xs">
          <div className="mb-1.5 flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> Open <b className="ml-1">{open}</b>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-green-500" /> Close <b className="ml-1">{close}</b>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
