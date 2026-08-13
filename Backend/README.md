# Production Problem Control Board — Backend

Backend beneran pakai **Node + Express + SQLite**. Data disimpan permanen di database (`ppcb.db`), foto ke-upload ke folder, plus ada endpoint Export CSV.

## Struktur folder

```
ppcb-backend/
├─ server.js          # REST API (Express)
├─ db.js              # setup SQLite + auto-create tabel + seed
├─ package.json       # dependencies
├─ ppcb.db            # (otomatis kebuat saat pertama run)
└─ public/
   ├─ index.html      # frontend yang udah nyambung ke API
   └─ uploads/        # foto hasil upload
```

## Cara jalanin

Butuh Node.js (versi 18+). Buka terminal di folder `ppcb-backend`:

```bash
npm install        # sekali aja, download dependency
npm start          # jalanin server
```

Lalu buka browser:

```
http://localhost:3000
```

> Frontend `public/index.html` otomatis ke-serve dari root, jadi tinggal buka localhost:3000 langsung jalan lengkap sama chart, KPI, form, upload foto, dan export.

## API Endpoints

| Method | Endpoint | Fungsi |
|--------|----------|--------|
| GET    | `/api/problems?q=&status=` | List problem (support search & filter) |
| GET    | `/api/problems/:id` | Detail 1 problem |
| GET    | `/api/summary` | Data KPI + chart (total, open, close, overdue, dll) |
| POST   | `/api/problems` | Tambah problem (multipart, bisa upload foto) |
| PUT    | `/api/problems/:id` | Update problem (mis. ubah status jadi Close) |
| DELETE | `/api/problems/:id` | Hapus problem |
| GET    | `/api/export/csv` | Download CSV (kebuka di Excel) |

## Catatan

- **Database SQLite** = 1 file (`ppcb.db`), gak perlu install MySQL/server DB terpisah. Cocok buat internal / skala tim.
- Kalau nanti dipakai rame-rame satu pabrik & butuh multi-user berat, tinggal ganti `db.js` ke **MySQL/PostgreSQL** — struktur query-nya udah rapi jadi gampang migrasi.
- Foto disimpan di `public/uploads/`. Backup folder ini + file `ppcb.db` = backup semua data.

## Kalau mau integrasi ke stack React/Vite/Shadcn (PM Monitoring)

Endpoint di atas tinggal di-`fetch` dari komponen React lu. Contoh:

```js
// services/problemService.js
const API = "http://localhost:3000/api";
export const getProblems = (q="", status="All") =>
  fetch(`${API}/problems?q=${q}&status=${status}`).then(r => r.json());
export const getSummary = () => fetch(`${API}/summary`).then(r => r.json());
export const addProblem = (formData) =>
  fetch(`${API}/problems`, { method:"POST", body: formData }).then(r => r.json());
export const deleteProblem = (id) =>
  fetch(`${API}/problems/${id}`, { method:"DELETE" });
```
