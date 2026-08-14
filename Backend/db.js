// ============================================================
// db.js - Setup database PostgreSQL + auto-create tabel
// Pake driver "pg" (node-postgres)
// ============================================================
const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Kalau gak pakai DATABASE_URL, bisa isi manual lewat env berikut:
  host: process.env.DATABASE_URL ? undefined : (process.env.PGHOST || "localhost"),
  port: process.env.DATABASE_URL ? undefined : (process.env.PGPORT || 5432),
  user: process.env.DATABASE_URL ? undefined : (process.env.PGUSER || "postgres"),
  password: process.env.DATABASE_URL ? undefined : (process.env.PGPASSWORD || "postgres"),
  database: process.env.DATABASE_URL ? undefined : (process.env.PGDATABASE || "ppcb"),
  ssl: process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
});

// Tabel utama
// Venue yang valid -> dipakai backend & frontend biar konsisten (1 tabel dipakai 3 halaman)
const VENUES = ["Hirose Internal", "SGP", "Systech"];

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS problems (
    id             SERIAL PRIMARY KEY,
    venue          TEXT NOT NULL DEFAULT 'Hirose Internal',
    date           TEXT NOT NULL,
    problem        TEXT NOT NULL,
    photo          TEXT,
    qty            INTEGER DEFAULT 0,
    utilisation    TEXT,
    ppm            TEXT,
    ppm_output     TEXT,
    root_cause     TEXT,
    countermeasure TEXT,
    classification TEXT,
    pic            TEXT NOT NULL,
    due_date       TEXT,
    status         TEXT DEFAULT 'Open',
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
  );
`;

// Migrasi ringan buat DB yang sudah pernah dibuat sebelum kolom venue/impact ditambahkan
const MIGRATE_SQL = `
  ALTER TABLE problems ADD COLUMN IF NOT EXISTS venue TEXT NOT NULL DEFAULT 'Hirose Internal';
  ALTER TABLE problems ADD COLUMN IF NOT EXISTS utilisation TEXT;
  ALTER TABLE problems ADD COLUMN IF NOT EXISTS ppm TEXT;
  ALTER TABLE problems ADD COLUMN IF NOT EXISTS ppm_output TEXT;
`;

const SEED_ROWS = [
  { venue: "Hirose Internal", date: "2026-08-05", problem: "Reject terminal bent di line assy", qty: 12, utilisation: "85%", ppm: "120", ppm_output: "95", classification: "Quality",  root_cause: "Jig aus", countermeasure: "Ganti jig baru", pic: "Hanif Mutaz", due_date: "2026-08-10", status: "Open" },
  { venue: "SGP",             date: "2026-08-08", problem: "Mesin crimping stop, sensor error",  qty: 0,  utilisation: "70%", ppm: "0",   ppm_output: "0",  classification: "Machine",  root_cause: "Sensor proximity rusak", countermeasure: "Ganti sensor",  pic: "Ridho Tri",   due_date: "2026-08-14", status: "Close" },
  { venue: "Systech",         date: "2026-08-09", problem: "Material housing salah warna",       qty: 30, utilisation: "90%", ppm: "300", ppm_output: "270", classification: "Material", root_cause: "Salah kirim supplier",   countermeasure: "Retur & tukar barang", pic: "Tety Uci",    due_date: "2026-08-18", status: "Open" },
];

// Jalanin sekali pas server start: create table kalau belum ada + migrate + seed kalau kosong
async function init() {
  await pool.query(CREATE_TABLE_SQL);
  await pool.query(MIGRATE_SQL);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM problems");
  if (rows[0].n === 0) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const r of SEED_ROWS) {
        await client.query(
          `INSERT INTO problems (venue, date, problem, qty, utilisation, ppm, ppm_output, classification, root_cause, countermeasure, pic, due_date, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [r.venue, r.date, r.problem, r.qty, r.utilisation, r.ppm, r.ppm_output, r.classification, r.root_cause, r.countermeasure, r.pic, r.due_date, r.status]
        );
      }
      await client.query("COMMIT");
      console.log("[db] Seed data awal dimasukkan.");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}

module.exports = { pool, init, VENUES };
