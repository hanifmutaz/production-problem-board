// ============================================================
// server.js - REST API Production Problem Control Board
// Express + PostgreSQL (pg) + Multer (upload foto)
// ============================================================
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { pool, init, VENUES } = require("./db");

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

// Kecilin boilerplate try/catch di tiap route
const asyncRoute = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Validasi venue dari query/body biar gak nyasar data ke venue yang gak valid
function isValidVenue(v) {
  return VENUES.includes(v);
}

// ============================================================
// ROUTES
// ============================================================

// GET daftar venue yang valid (dipakai FE buat tab/menu)
app.get("/api/venues", (req, res) => res.json(VENUES));

// GET daftar nama PIC yang pernah disubmit (buat autocomplete di form, bukan dropdown tetap)
// ?venue= optional -> kalau diisi, saran cuma dari venue itu; kalau kosong, dari semua venue
app.get("/api/pics", asyncRoute(async (req, res) => {
  const { venue } = req.query;
  const sql = venue && venue !== "All"
    ? "SELECT DISTINCT pic FROM problems WHERE venue = $1 AND pic IS NOT NULL AND pic <> '' ORDER BY pic ASC"
    : "SELECT DISTINCT pic FROM problems WHERE pic IS NOT NULL AND pic <> '' ORDER BY pic ASC";
  const { rows } = await pool.query(sql, venue && venue !== "All" ? [venue] : []);
  res.json(rows.map(r => r.pic));
}));

// GET semua problem (support ?venue= & ?status= & ?q=)
app.get("/api/problems", asyncRoute(async (req, res) => {
  const { status, q, venue } = req.query;
  let sql = "SELECT * FROM problems WHERE 1=1";
  const params = [];
  if (venue && venue !== "All") {
    params.push(venue);
    sql += ` AND venue = $${params.length}`;
  }
  if (status && status !== "All") {
    params.push(status);
    sql += ` AND status = $${params.length}`;
  }
  if (q) {
    params.push(`%${q}%`);
    sql += ` AND (problem ILIKE $${params.length} OR pic ILIKE $${params.length})`;
  }
  sql += " ORDER BY date DESC, id DESC";
  const { rows } = await pool.query(sql, params);
  res.json(rows);
}));

// GET ringkasan buat KPI + chart (support ?venue=)
app.get("/api/summary", asyncRoute(async (req, res) => {
  const { venue } = req.query;
  const sql = venue && venue !== "All"
    ? "SELECT * FROM problems WHERE venue = $1"
    : "SELECT * FROM problems";
  const { rows: all } = await pool.query(sql, venue && venue !== "All" ? [venue] : []);
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
}));

// GET satu problem
app.get("/api/problems/:id", asyncRoute(async (req, res) => {
  const { rows } = await pool.query("SELECT * FROM problems WHERE id = $1", [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
}));

// POST tambah problem (dengan / tanpa foto)
app.post("/api/problems", upload.single("photo"), asyncRoute(async (req, res) => {
  const b = req.body;
  if (!b.venue || !isValidVenue(b.venue))
    return res.status(400).json({ error: `venue wajib diisi & harus salah satu dari: ${VENUES.join(", ")}` });
  if (!b.date || !b.problem?.trim() || !b.pic)
    return res.status(400).json({ error: "date, problem, dan pic wajib diisi" });

  const values = {
    venue: b.venue,
    date: b.date,
    problem: b.problem.trim(),
    photo: req.file ? "/uploads/" + req.file.filename : null,
    qty: Math.max(0, +b.qty || 0),
    utilisation: b.utilisation?.trim() || null,
    ppm: b.ppm?.trim() || null,
    ppm_output: b.ppm_output?.trim() || null,
    classification: b.classification || null,
    root_cause: b.root_cause?.trim() || null,
    countermeasure: b.countermeasure?.trim() || null,
    pic: b.pic,
    due_date: b.due_date || null,
    status: b.status || "Open",
  };

  const { rows } = await pool.query(
    `INSERT INTO problems (venue, date, problem, photo, qty, utilisation, ppm, ppm_output, classification, root_cause, countermeasure, pic, due_date, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
     RETURNING *`,
    [values.venue, values.date, values.problem, values.photo, values.qty, values.utilisation,
     values.ppm, values.ppm_output, values.classification, values.root_cause, values.countermeasure,
     values.pic, values.due_date, values.status]
  );
  res.status(201).json(rows[0]);
}));

// PUT update problem (mis. update status jadi Close, atau edit detail)
app.put("/api/problems/:id", upload.single("photo"), asyncRoute(async (req, res) => {
  const { rows: curRows } = await pool.query("SELECT * FROM problems WHERE id = $1", [req.params.id]);
  const cur = curRows[0];
  if (!cur) return res.status(404).json({ error: "Not found" });
  const b = req.body;

  // kalau ada foto baru, foto lama dihapus dari disk biar gak numpuk sampah
  if (req.file && cur.photo) removePhotoFile(cur.photo);
  // kalau FE eksplisit minta hapus foto tanpa ganti foto baru
  if (!req.file && b.removePhoto === "1" && cur.photo) removePhotoFile(cur.photo);

  const nextPhoto = req.file
    ? "/uploads/" + req.file.filename
    : (b.removePhoto === "1" ? null : cur.photo);

  if (b.venue && !isValidVenue(b.venue))
    return res.status(400).json({ error: `venue harus salah satu dari: ${VENUES.join(", ")}` });

  const values = {
    id: req.params.id,
    venue: b.venue ?? cur.venue,
    date: b.date ?? cur.date,
    problem: (b.problem ?? cur.problem)?.trim(),
    photo: nextPhoto,
    qty: b.qty != null ? Math.max(0, +b.qty) : cur.qty,
    utilisation: (b.utilisation ?? cur.utilisation)?.trim?.() ?? cur.utilisation,
    ppm: (b.ppm ?? cur.ppm)?.trim?.() ?? cur.ppm,
    ppm_output: (b.ppm_output ?? cur.ppm_output)?.trim?.() ?? cur.ppm_output,
    classification: b.classification ?? cur.classification,
    root_cause: (b.root_cause ?? cur.root_cause)?.trim() || null,
    countermeasure: (b.countermeasure ?? cur.countermeasure)?.trim() || null,
    pic: b.pic ?? cur.pic,
    due_date: b.due_date ?? cur.due_date,
    status: b.status ?? cur.status,
  };

  const { rows } = await pool.query(
    `UPDATE problems SET
       venue=$1, date=$2, problem=$3, photo=$4, qty=$5, utilisation=$6, ppm=$7, ppm_output=$8,
       classification=$9, root_cause=$10, countermeasure=$11, pic=$12, due_date=$13,
       status=$14, updated_at=NOW()
     WHERE id=$15
     RETURNING *`,
    [values.venue, values.date, values.problem, values.photo, values.qty, values.utilisation,
     values.ppm, values.ppm_output, values.classification, values.root_cause, values.countermeasure,
     values.pic, values.due_date, values.status, values.id]
  );
  res.json(rows[0]);
}));

// DELETE problem (foto ikut dihapus dari disk)
app.delete("/api/problems/:id", asyncRoute(async (req, res) => {
  const { rows } = await pool.query("DELETE FROM problems WHERE id = $1 RETURNING *", [req.params.id]);
  const cur = rows[0];
  if (!cur) return res.status(404).json({ error: "Not found" });
  if (cur.photo) removePhotoFile(cur.photo);
  res.json({ ok: true });
}));

// Export CSV langsung dari server
app.get("/api/export/csv", asyncRoute(async (req, res) => {
  const { venue } = req.query;
  const sql = venue && venue !== "All"
    ? "SELECT * FROM problems WHERE venue = $1 ORDER BY date DESC, id DESC"
    : "SELECT * FROM problems ORDER BY date DESC, id DESC";
  const { rows } = await pool.query(sql, venue && venue !== "All" ? [venue] : []);
  const headers = ["No","Venue","Date","Problem","Qty","Utilisation","PPM","PPM Output","Root Cause","Countermeasure","Classification","PIC","Due Date","Status"];
  const esc = v => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [headers, ...rows.map((r,i)=>[
    i+1, r.venue, r.date, r.problem, r.qty, r.utilisation, r.ppm, r.ppm_output,
    r.root_cause, r.countermeasure, r.classification, r.pic, r.due_date, r.status
  ])].map(r => r.map(esc).join(",")).join("\r\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="Problem_Board_${venue && venue !== "All" ? venue.replace(/\s+/g,"_") : "All"}.csv"`);
  res.send("\uFEFF" + csv);
}));

// 404 buat route API yang gak ke-mapping
app.use("/api", (req, res) => res.status(404).json({ error: "Endpoint not found" }));

// Error handler (nangkep error dari multer: file kegedean / bukan gambar, juga error DB)
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes("gambar")) {
    return res.status(400).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

// Init DB dulu (create table + seed) baru start server
init()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`\n  PPCB backend jalan di  http://localhost:${PORT}`);
      console.log(`  Frontend  -> taruh index.html di folder /public`);
      console.log(`  API       -> http://localhost:${PORT}/api/problems\n`);
    });
  })
  .catch((err) => {
    console.error("[db] Gagal konek/inisialisasi PostgreSQL:", err.message);
    process.exit(1);
  });
