// ============================================================
// db.js - Setup database SQLite + auto-create tabel
// Pake node:sqlite bawaan Node.js (Node 22.5+) - GAK butuh native
// compile / Visual Studio Build Tools kayak better-sqlite3.
// ============================================================
const { DatabaseSync } = require("node:sqlite");
const path = require("path");

const db = new DatabaseSync(path.join(__dirname, "ppcb.db"));
db.exec("PRAGMA journal_mode = WAL");

// Tabel utama
db.exec(`
  CREATE TABLE IF NOT EXISTS problems (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
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
    created_at     TEXT DEFAULT (datetime('now','localtime')),
    updated_at     TEXT DEFAULT (datetime('now','localtime'))
  );
`);

// Seed data awal kalau tabel masih kosong
const count = db.prepare("SELECT COUNT(*) AS n FROM problems").get().n;
if (count === 0) {
  const seed = db.prepare(`
    INSERT INTO problems (date, problem, qty, classification, pic, due_date, status)
    VALUES (@date, @problem, @qty, @classification, @pic, @due_date, @status)
  `);
  const rows = [
    { date:"2026-08-05", problem:"Reject terminal bent di line assy", qty:12, classification:"Quality",    pic:"Hanif Mutaz",   due_date:"2026-08-10", status:"Open" },
    { date:"2026-08-08", problem:"Mesin crimping stop, sensor error",  qty:0,  classification:"Machine",    pic:"Ridho Tri",     due_date:"2026-08-14", status:"Close" },
    { date:"2026-08-09", problem:"Material housing salah warna",       qty:30, classification:"Material",   pic:"Tety Uci",      due_date:"2026-08-18", status:"Open" },
  ];
  db.exec("BEGIN");
  try {
    rows.forEach((r) => seed.run(r));
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }
  console.log("[db] Seed data awal dimasukkan.");
}

module.exports = db;
