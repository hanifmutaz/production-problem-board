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

// Jalanin sekali pas server start: create table kalau belum ada + migrate
// (Production: gak ada auto-seed data dummy — tabel mulai kosong)
async function init() {
  await pool.query(CREATE_TABLE_SQL);
  await pool.query(MIGRATE_SQL);
}

module.exports = { pool, init, VENUES };
