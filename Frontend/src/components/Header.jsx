import { motion } from "framer-motion";
import { FileSpreadsheet, FileText, Plus } from "lucide-react";
import { exportCsvUrl } from "../api/problems";

export default function Header({ onAdd }) {
  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="bg-navy text-white shadow-md"
    >
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-4">
        <motion.h1
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-lg font-semibold tracking-wide"
        >
          PRODUCTION PROBLEM CONTROL BOARD
        </motion.h1>
        <motion.div
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex gap-2"
        >
          <motion.a
            href={exportCsvUrl()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold hover:bg-green-800"
          >
            <FileSpreadsheet size={16} /> Export Excel
          </motion.a>
          <motion.button
            onClick={() => window.print()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold hover:bg-red-800"
          >
            <FileText size={16} /> Export PDF
          </motion.button>
          <motion.button
            onClick={onAdd}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/30"
          >
            <Plus size={16} /> Add Problem
          </motion.button>
        </motion.div>
      </div>
    </motion.header>
  );
}
