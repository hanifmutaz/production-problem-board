import { FileSpreadsheet, FileText, Plus } from "lucide-react";
import { exportCsvUrl } from "../api/problems";

export default function Header({ onAdd }) {
  return (
    <header className="bg-navy text-white shadow-md">
      <div className="mx-auto flex max-w-[1180px] flex-wrap items-center justify-between gap-3 px-6 py-4">
        <h1 className="text-lg font-semibold tracking-wide">PRODUCTION PROBLEM CONTROL BOARD</h1>
        <div className="flex gap-2">
          <a href={exportCsvUrl()}
            className="flex items-center gap-1.5 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold hover:bg-green-800">
            <FileSpreadsheet size={16} /> Export Excel
          </a>
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold hover:bg-red-800">
            <FileText size={16} /> Export PDF
          </button>
          <button onClick={onAdd}
            className="flex items-center gap-1.5 rounded-lg bg-white/20 px-4 py-2.5 text-sm font-semibold hover:bg-white/30">
            <Plus size={16} /> Add Problem
          </button>
        </div>
      </div>
    </header>
  );
}
