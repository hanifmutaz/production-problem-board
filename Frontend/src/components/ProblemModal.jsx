import { useEffect, useRef, useState } from "react";
import { resolvePhotoUrl } from "../api/problems";

const PIC_OPTIONS = ["Hanif Mutaz", "Tety Uci", "Ridho Tri", "Liska Waluyan"];
const CLASS_OPTIONS = ["Quality", "Production", "Machine", "Material"];

const emptyForm = {
  date: "", problem: "", qty: "", classification: "", root_cause: "",
  countermeasure: "", pic: "", due_date: "", status: "Open",
};

export default function ProblemModal({ open, editing, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [removePhoto, setRemovePhoto] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({
        date: editing.date || "", problem: editing.problem || "", qty: editing.qty ?? "",
        classification: editing.classification || "", root_cause: editing.root_cause || "",
        countermeasure: editing.countermeasure || "", pic: editing.pic || "",
        due_date: editing.due_date || "", status: editing.status || "Open",
      });
      setPreview(editing.photo ? resolvePhotoUrl(editing.photo) : null);
    } else {
      setForm(emptyForm);
      setPreview(null);
    }
    setPhotoFile(null);
    setRemovePhoto(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, editing]);

  if (!open) return null;

  const field = (name) => (e) => setForm((f) => ({ ...f, [name]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file || null);
    if (file) {
      setPreview(URL.createObjectURL(file));
      setRemovePhoto(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.date || !form.problem.trim() || !form.pic) return;

    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photoFile) fd.append("photo", photoFile);
    if (removePhoto) fd.append("removePhoto", "1");

    onSubmit(fd, editing?.id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4">
      <div className="max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4.5 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {editing ? "Edit Production Problem" : "Add Production Problem"}
            </h2>
            <p className="mt-0.5 text-[13px] text-slate-500">Isi minimal Date, Problem, dan PIC.</p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-600">&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Date" required>
            <input type="date" required value={form.date} onChange={field("date")} className="input" />
          </Field>

          <Field label="Problem" required>
            <textarea rows={2} required value={form.problem} onChange={field("problem")}
              placeholder="Cth: Reject terminal bent di line assy" className="input" />
          </Field>

          <Field label="Photo">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhoto} className="text-sm" />
            {preview && (
              <div className="mt-2 flex items-center gap-3">
                <img src={preview} alt="preview" className="h-24 w-24 rounded-lg border border-slate-300 object-cover" />
                {editing?.photo && !photoFile && (
                  <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-500">
                    <input type="checkbox" checked={removePhoto}
                      onChange={(e) => { setRemovePhoto(e.target.checked); if (e.target.checked) setPreview(null); }} />
                    Hapus foto
                  </label>
                )}
              </div>
            )}
          </Field>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field label="Qty">
              <input type="number" placeholder="0" value={form.qty} onChange={field("qty")} className="input" />
            </Field>
            <Field label="Classification">
              <select value={form.classification} onChange={field("classification")} className="input">
                <option value="">- Pilih -</option>
                {CLASS_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          <Field label="Root Cause">
            <textarea rows={2} value={form.root_cause} onChange={field("root_cause")}
              placeholder="Cth: Jig aus" className="input" />
          </Field>
          <Field label="Countermeasure">
            <textarea rows={2} value={form.countermeasure} onChange={field("countermeasure")}
              placeholder="Cth: Ganti jig baru" className="input" />
          </Field>

          <div className="grid grid-cols-2 gap-3 max-sm:grid-cols-1">
            <Field label="PIC" required>
              <select required value={form.pic} onChange={field("pic")} className="input">
                <option value="">- Pilih -</option>
                {PIC_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </Field>
            <Field label="Due Date">
              <input type="date" value={form.due_date} onChange={field("due_date")} className="input" />
            </Field>
          </div>

          <Field label="Status">
            <div className="flex gap-5 pt-1">
              {["Open", "Close"].map((s) => (
                <label key={s} className="flex items-center gap-1.5 font-normal text-slate-700">
                  <input type="radio" name="status" value={s} checked={form.status === s}
                    onChange={field("status")} /> {s}
                </label>
              ))}
            </div>
          </Field>

          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" disabled={submitting}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
              {submitting ? "Menyimpan..." : "Save Problem"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}
