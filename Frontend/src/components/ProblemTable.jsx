import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2, ImageOff, ZoomIn } from "lucide-react";
import { resolvePhotoUrl } from "../api/problems";

const TODAY = new Date().toISOString().slice(0, 10);
const isOverdue = (p) => p.status === "Open" && p.due_date && p.due_date < TODAY;

function Badge({ status }) {
  const cls = status === "Open" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
  return (
    <motion.span
      key={status}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.25 }}
      className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}
    >
      {status}
    </motion.span>
  );
}

export default function ProblemTable({ rows, onEdit, onDelete, onPhotoClick }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-sky-100">
          <tr>
            {["No", "Date", "Problem", "Photo", "Qty", "Classification", "PIC", "Due Date", "Status", ""].map((h) => (
              <th key={h} className="p-3 text-left text-[13px] font-semibold text-slate-700">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.length === 0 ? (
              <motion.tr
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <td colSpan={10} className="p-6 text-center text-slate-400">Belum ada data</td>
              </motion.tr>
            ) : (
              rows.map((p, i) => (
                <motion.tr
                  key={p.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: 40, backgroundColor: "#fee2e2" }}
                  transition={{ duration: 0.28, delay: Math.min(i * 0.03, 0.3) }}
                  whileHover={{ backgroundColor: isOverdue(p) ? "#fecaca" : "#f8fafc" }}
                  className={`border-t border-slate-100 ${isOverdue(p) ? "bg-red-50 animate-pulse-slow" : ""}`}
                >
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3">{p.date}</td>
                  <td className="p-3">{p.problem}</td>
                  <td className="p-3">
                    {p.photo ? (
                      <motion.div
                        whileHover="hover"
                        onClick={() => onPhotoClick(resolvePhotoUrl(p.photo))}
                        title="Klik untuk perbesar"
                        className="group relative h-11 w-11 cursor-pointer overflow-hidden rounded-lg border border-slate-300 hover:border-blue-500"
                      >
                        <motion.img
                          variants={{ hover: { scale: 1.15 } }}
                          src={resolvePhotoUrl(p.photo)}
                          className="h-full w-full object-cover"
                        />
                        <motion.div
                          variants={{ hover: { opacity: 1 } }}
                          initial={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/30"
                        >
                          <ZoomIn size={16} className="text-white" />
                        </motion.div>
                      </motion.div>
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-300">
                        <ImageOff size={16} />
                      </div>
                    )}
                  </td>
                  <td className="p-3">{p.qty}</td>
                  <td className="p-3">{p.classification || "-"}</td>
                  <td className="p-3">{p.pic}</td>
                  <td className="p-3">{p.due_date || "-"}</td>
                  <td className="p-3"><Badge status={p.status} /></td>
                  <td className="p-3">
                    <div className="flex gap-1.5">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onEdit(p)}
                        title="Edit"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={16} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onDelete(p.id)}
                        title="Hapus"
                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </motion.button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  );
}