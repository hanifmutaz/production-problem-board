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
const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS problems (
    id             SERIAL PRIMARY KEY,
    date           TEXT NOT NULL,
    problem        TEXT NOT NULL,
    photo          TEXT,
    qty            INTEGER DEFAULT 0,
    classification TEXT,
    root_cause     TEXT,
    countermeasure TEXT,
    pic            TEXT NOT NULL,
    due_date       TEXT,
    status         TEXT DEFAULT 'Open',
    created_at     TIMESTAMP DEFAULT NOW(),
    updated_at     TIMESTAMP DEFAULT NOW()
  );
`;

const SEED_ROWS = [
  { date: "2026-08-05", problem: "Reject terminal bent di line assy", qty: 12, classification: "Quality",  pic: "Hanif Mutaz", due_date: "2026-08-10", status: "Open" },
  { date: "2026-08-08", problem: "Mesin crimping stop, sensor error",  qty: 0,  classification: "Machine",  pic: "Ridho Tri",   due_date: "2026-08-14", status: "Close" },
  { date: "2026-08-09", problem: "Material housing salah warna",       qty: 30, classification: "Material", pic: "Tety Uci",    due_date: "2026-08-18", status: "Open" },
];

// Jalanin sekali pas server start: create table kalau belum ada + seed kalau kosong
async function init() {
  await pool.query(CREATE_TABLE_SQL);

  const { rows } = await pool.query("SELECT COUNT(*)::int AS n FROM problems");
  if (rows[0].n === 0) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const r of SEED_ROWS) {
        await client.query(
          `INSERT INTO problems (date, problem, qty, classification, pic, due_date, status)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [r.date, r.problem, r.qty, r.classification, r.pic, r.due_date, r.status]
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

module.exports = { pool, init };
