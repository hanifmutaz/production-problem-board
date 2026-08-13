import { Pencil, Trash2, ImageOff } from "lucide-react";
import { resolvePhotoUrl } from "../api/problems";

const TODAY = new Date().toISOString().slice(0, 10);
const isOverdue = (p) => p.status === "Open" && p.due_date && p.due_date < TODAY;

function Badge({ status }) {
  const cls = status === "Open" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700";
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap ${cls}`}>{status}</span>;
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
          {rows.length === 0 ? (
            <tr>
              <td colSpan={10} className="p-6 text-center text-slate-400">Belum ada data</td>
            </tr>
          ) : (
            rows.map((p, i) => (
              <tr
                key={p.id}
                className={`border-t border-slate-100 hover:bg-slate-50 ${isOverdue(p) ? "bg-red-50 hover:bg-red-100" : ""}`}
              >
                <td className="p-3">{i + 1}</td>
                <td className="p-3">{p.date}</td>
                <td className="p-3">{p.problem}</td>
                <td className="p-3">
                  {p.photo ? (
                    <img
                      src={resolvePhotoUrl(p.photo)}
                      onClick={() => onPhotoClick(resolvePhotoUrl(p.photo))}
                      title="Klik untuk perbesar"
                      className="h-11 w-11 cursor-pointer rounded-lg border border-slate-300 object-cover transition hover:scale-110 hover:border-blue-500"
                    />
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
                    <button onClick={() => onEdit(p)} title="Edit" className="text-slate-300 hover:text-blue-600">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => onDelete(p.id)} title="Hapus" className="text-slate-300 hover:text-red-500">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
