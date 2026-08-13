// ============================================================
// server.js - REST API Production Problem Control Board
// Express + SQLite + Multer (upload foto)
// ============================================================
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 6000;

app.use(cors());                                                // biar gampang disambungin ke frontend React/Vite terpisah
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));        // serve frontend + foto
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// ---- Upload foto ----
const uploadDir = path.join(__dirname, "public", "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("File harus berupa gambar (jpg/png/webp/dll)"));
    }
    cb(null, true);
  },
});

// Hapus file foto lama di folder uploads (dipanggil pas replace/delete)
function removePhotoFile(photoPath) {
  if (!photoPath) return;
  const filename = path.basename(photoPath);
  const filePath = path.join(uploadDir, filename);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") console.error("[uploads] gagal hapus", filename, err.message);
  });
}

// ============================================================
// ROUTES
// ============================================================

// GET semua problem (support ?status= & ?q=)
app.get("/api/problems", (req, res) => {
  const { status, q } = req.query;
  let sql = "SELECT * FROM problems WHERE 1=1";
  const params = [];
  if (status && status !== "All") { sql += " AND status = ?"; params.push(status); }
  if (q) { sql += " AND (problem LIKE ? OR pic LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }
  sql += " ORDER BY date DESC, id DESC";
  res.json(db.prepare(sql).all(...params));
});

// GET ringkasan buat KPI + chart
app.get("/api/summary", (req, res) => {
  const all = db.prepare("SELECT * FROM problems").all();
  const today = new Date().toISOString().slice(0, 10);
  const byGroup = (key) => {
    const m = {};
    all.forEach(r => { const k = r[key] || "-"; m[k] = (m[k] || 0) + 1; });
    return m;
  };
  res.json({
    total: all.length,
    open: all.filter(r => r.status === "Open").length,
    close: all.filter(r => r.status === "Close").length,
    overdue: all.filter(r => r.status === "Open" && r.due_date && r.due_date < today).length,
    byClassification: byGroup("classification"),
    byPic: byGroup("pic"),
  });
});

// GET satu problem
app.get("/api/problems/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM problems WHERE id = ?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "Not found" });
  res.json(row);
});

// POST tambah problem (dengan / tanpa foto)
app.post("/api/problems", upload.single("photo"), (req, res) => {
  const b = req.body;
  if (!b.date || !b.problem?.trim() || !b.pic)
    return res.status(400).json({ error: "date, problem, dan pic wajib diisi" });

  const info = db.prepare(`
    INSERT INTO problems (date, problem, photo, qty, classification, root_cause, countermeasure, pic, due_date, status)
    VALUES (@date, @problem, @photo, @qty, @classification, @root_cause, @countermeasure, @pic, @due_date, @status)
  `).run({
    date: b.date, problem: b.problem.trim(),
    photo: req.file ? "/uploads/" + req.file.filename : null,
    qty: Math.max(0, +b.qty || 0), classification: b.classification || null,
    root_cause: b.root_cause?.trim() || null, countermeasure: b.countermeasure?.trim() || null,
    pic: b.pic, due_date: b.due_date || null, status: b.status || "Open",
  });
  res.status(201).json(db.prepare("SELECT * FROM problems WHERE id = ?").get(info.lastInsertRowid));
});

// PUT update problem (mis. update status jadi Close, atau edit detail)
app.put("/api/problems/:id", upload.single("photo"), (req, res) => {
  const cur = db.prepare("SELECT * FROM problems WHERE id = ?").get(req.params.id);
  if (!cur) return res.status(404).json({ error: "Not found" });
  const b = req.body;

  // kalau ada foto baru, foto lama dihapus dari disk biar gak numpuk sampah
  if (req.file && cur.photo) removePhotoFile(cur.photo);
  // kalau FE eksplisit minta hapus foto tanpa ganti foto baru
  if (!req.file && b.removePhoto === "1" && cur.photo) removePhotoFile(cur.photo);

  const nextPhoto = req.file
    ? "/uploads/" + req.file.filename
    : (b.removePhoto === "1" ? null : cur.photo);

  db.prepare(`
    UPDATE problems SET
      date=@date, problem=@problem, photo=@photo, qty=@qty, classification=@classification,
      root_cause=@root_cause, countermeasure=@countermeasure, pic=@pic, due_date=@due_date,
      status=@status, updated_at=datetime('now','localtime')
    WHERE id=@id
  `).run({
    id: req.params.id,
    date: b.date ?? cur.date, problem: (b.problem ?? cur.problem)?.trim(),
    photo: nextPhoto,
    qty: b.qty != null ? Math.max(0, +b.qty) : cur.qty,
    classification: b.classification ?? cur.classification,
    root_cause: (b.root_cause ?? cur.root_cause)?.trim() || null,
    countermeasure: (b.countermeasure ?? cur.countermeasure)?.trim() || null,
    pic: b.pic ?? cur.pic, due_date: b.due_date ?? cur.due_date,
    status: b.status ?? cur.status,
  });
  res.json(db.prepare("SELECT * FROM problems WHERE id = ?").get(req.params.id));
});

// DELETE problem (foto ikut dihapus dari disk)
app.delete("/api/problems/:id", (req, res) => {
  const cur = db.prepare("SELECT * FROM problems WHERE id = ?").get(req.params.id);
  if (!cur) return res.status(404).json({ error: "Not found" });
  db.prepare("DELETE FROM problems WHERE id = ?").run(req.params.id);
  if (cur.photo) removePhotoFile(cur.photo);
  res.json({ ok: true });
});

// Export CSV langsung dari server
app.get("/api/export/csv", (req, res) => {
  const rows = db.prepare("SELECT * FROM problems ORDER BY date DESC, id DESC").all();
  const headers = ["No","Date","Problem","Qty","Classification","Root Cause","Countermeasure","PIC","Due Date","Status"];
  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows.map((r,i)=>[
    i+1, r.date, r.problem, r.qty, r.classification, r.root_cause, r.countermeasure, r.pic, r.due_date, r.status
  ])].map(r => r.map(esc).join(",")).join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="Problem_Board.csv"`);
  res.send("\uFEFF" + csv);
});

// 404 buat route API yang gak ke-mapping
app.use("/api", (req, res) => res.status(404).json({ error: "Endpoint not found" }));

// Error handler (nangkep error dari multer: file kegedean / bukan gambar)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("gambar")) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`\n  PPCB backend jalan di  http://localhost:${PORT}`);
  console.log(`  Frontend  -> taruh index.html di folder /public`);
  console.log(`  API       -> http://localhost:${PORT}/api/problems\n`);
});
