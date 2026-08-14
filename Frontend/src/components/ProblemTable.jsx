import { AnimatePresence, motion } from "framer-motion";
import { Pencil, Trash2, ImageOff, ZoomIn } from "lucide-react";
import { resolvePhotoUrl } from "../api/problems";

const TODAY = new Date().toISOString().slice(0, 10);
const isOverdue = (p) => p.status === "Open" && p.due_date && p.due_date < TODAY;
const COL_COUNT = 13; // No, Date, Problem, Gambar, Qty, Utilisation, PPM, PPM Output, Root Cause, Countermeasure, Classification, PIC, Due Date, Status, action -> pakai 15 sebenernya tapi colSpan cukup approx

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
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-sm table-fixed">
        <colgroup>
          <col style={{ width: "3%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "14%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "3%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "11%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "7%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "6%" }} />
          <col style={{ width: "5%" }} />
        </colgroup>
        <thead className="bg-sky-100">
          <tr>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">No</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Date</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Problem</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Gambar</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Qty</th>
            <th colSpan={3} className="border border-sky-200 p-2 text-center text-[13px] font-semibold text-slate-700">Impact</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Root Cause<br /><span className="font-normal text-slate-500">(Mechanism)</span></th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Action<br />Countermeasure</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Classification</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">PIC</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Due Date</th>
            <th rowSpan={2} className="border border-sky-200 p-3 text-left text-[13px] font-semibold text-slate-700">Status</th>
            <th rowSpan={2} className="border border-sky-200 p-3 no-print"></th>
          </tr>
          <tr>
            <th className="border border-sky-200 p-2 text-center text-xs font-semibold text-slate-600">Utilisation</th>
            <th className="border border-sky-200 p-2 text-center text-xs font-semibold text-slate-600">PPM</th>
            <th className="border border-sky-200 p-2 text-center text-xs font-semibold text-slate-600">PPM Output</th>
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
                <td colSpan={COL_COUNT + 2} className="p-6 text-center text-slate-400">Belum ada data</td>
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
                  whileHover={{ backgroundColor: isOverdue(p) ? "#fecaca" : "#f1f5f9" }}
                  className={`border-t border-slate-100 ${
                    isOverdue(p) ? "bg-red-50 animate-pulse-slow" : i % 2 === 1 ? "bg-slate-50/60" : ""
                  }`}
                >
                  <td className="border border-slate-100 p-3">{i + 1}</td>
                  <td className="border border-slate-100 p-3 whitespace-nowrap">{p.date}</td>
                  <td className="border border-slate-100 p-3 whitespace-pre-wrap break-words">{p.problem}</td>
                  <td className="border border-slate-100 p-3">
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
                  <td className="border border-slate-100 p-3">{p.qty}</td>
                  <td className="border border-slate-100 p-3">{p.utilisation || "-"}</td>
                  <td className="border border-slate-100 p-3">{p.ppm || "-"}</td>
                  <td className="border border-slate-100 p-3">{p.ppm_output || "-"}</td>
                  <td className="border border-slate-100 p-3 whitespace-pre-wrap break-words">{p.root_cause || "-"}</td>
                  <td className="border border-slate-100 p-3 whitespace-pre-wrap break-words">{p.countermeasure || "-"}</td>
                  <td className="border border-slate-100 p-3">{p.classification || "-"}</td>
                  <td className="border border-slate-100 p-3 whitespace-nowrap">{p.pic}</td>
                  <td className="border border-slate-100 p-3 whitespace-nowrap">{p.due_date || "-"}</td>
                  <td className="border border-slate-100 p-3"><Badge status={p.status} /></td>
                  <td className="border border-slate-100 p-3 no-print">
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
