import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, X, ZoomIn } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { resolvePhotoUrl } from "../api/problems";
import PicAutocomplete from "./PicAutocomplete";

const CLASS_OPTIONS = ["Quality", "Production", "Machine", "Material"];

const emptyForm = {
  date: "", problem: "", qty: "", utilisation: "", ppm: "", ppm_output: "",
  classification: "", root_cause: "", countermeasure: "", pic: "", due_date: "", status: "Open",
};

export default function ProblemModal({ open, editing, venue, onClose, onSubmit, submitting, onPreviewClick }) {
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
        utilisation: editing.utilisation || "", ppm: editing.ppm || "", ppm_output: editing.ppm_output || "",
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
    fd.append("venue", venue);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (photoFile) fd.append("photo", photoFile);
    if (removePhoto) fd.append("removePhoto", "1");

    onSubmit(fd, editing?.id);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="max-h-[90vh] w-full max-w-[540px] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="mb-4.5 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {editing ? "Edit Production Problem" : "Add Production Problem"}
                </h2>
                <p className="mt-0.5 text-[13px] text-slate-500">Isi minimal Date, Problem, dan PIC.</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.15, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="rounded-full p-1 text-2xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                &times;
              </motion.button>
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
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="hidden"
                  id="photo-upload"
                />

                <AnimatePresence mode="wait">
                  {!preview ? (
                    <motion.label
                      key="dropzone"
                      htmlFor="photo-upload"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      whileHover={{ scale: 1.01, borderColor: "#3b82f6" }}
                      whileTap={{ scale: 0.99 }}
                      className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:bg-blue-50/50"
                    >
                      <ImagePlus size={22} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-600">Klik untuk pilih foto</span>
                      <span className="text-xs text-slate-400">JPG, PNG, atau WebP · maks 5MB</span>
                    </motion.label>
                  ) : (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        whileHover="hover"
                        onClick={() => onPreviewClick?.(preview)}
                        title="Klik untuk perbesar"
                        className="group relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-slate-300"
                      >
                        <motion.img
                          variants={{ hover: { scale: 1.1 } }}
                          src={preview}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                        <motion.div
                          variants={{ hover: { opacity: 1 } }}
                          initial={{ opacity: 0 }}
                          className="absolute inset-0 flex items-center justify-center bg-black/30"
                        >
                          <ZoomIn size={18} className="text-white" />
                        </motion.div>
                      </motion.div>
                      <div className="flex flex-col gap-2">
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          <ImagePlus size={14} /> Ganti foto
                        </motion.button>
                        {editing?.photo && !photoFile ? (
                          <label className="flex cursor-pointer items-center gap-1.5 text-sm text-slate-500">
                            <input type="checkbox" checked={removePhoto}
                              onChange={(e) => { setRemovePhoto(e.target.checked); if (e.target.checked) setPreview(null); }} />
                            Hapus foto
                          </label>
                        ) : (
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={() => {
                              setPhotoFile(null);
                              setPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-600"
                          >
                            <X size={14} /> Batal pilih
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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

              <div>
                <label className="mb-1.5 block text-[13px] font-semibold text-slate-700">Impact</label>
                <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-1">
                  <Field label="Utilisation">
                    <input type="text" placeholder="Cth: 85%" value={form.utilisation} onChange={field("utilisation")} className="input" />
                  </Field>
                  <Field label="PPM">
                    <input type="text" placeholder="Cth: 120" value={form.ppm} onChange={field("ppm")} className="input" />
                  </Field>
                  <Field label="PPM Output">
                    <input type="text" placeholder="Cth: 95" value={form.ppm_output} onChange={field("ppm_output")} className="input" />
                  </Field>
                </div>
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
                  <PicAutocomplete
                    value={form.pic}
                    onChange={(v) => setForm((f) => ({ ...f, pic: v }))}
                    venue={venue}
                    required
                  />
                </Field>
                <Field label="Due Date">
                  <input type="date" value={form.due_date} onChange={field("due_date")} className="input" />
                </Field>
              </div>

              <Field label="Status">
                <div className="flex gap-5 pt-1">
                  {["Open", "Close"].map((s) => (
                    <label key={s} className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 font-normal text-slate-700 transition-colors hover:bg-slate-100">
                      <input type="radio" name="status" value={s} checked={form.status === s}
                        onChange={field("status")} /> {s}
                    </label>
                  ))}
                </div>
              </Field>

              <div className="mt-2 flex justify-end gap-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: submitting ? 1 : 1.03 }}
                  whileTap={{ scale: submitting ? 1 : 0.97 }}
                  type="submit"
                  disabled={submitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {submitting ? "Menyimpan..." : "Save Problem"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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