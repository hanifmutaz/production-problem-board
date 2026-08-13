# Production Problem Control Board — Backend

Backend beneran pakai **Node + Express + PostgreSQL**. Data disimpan permanen di PostgreSQL, foto ke-upload ke folder, plus ada endpoint Export CSV.

## Struktur folder

```
ppcb-backend/
├─ server.js          # REST API (Express)
├─ db.js              # setup koneksi PostgreSQL (pg) + auto-create tabel + seed
├─ package.json       # dependencies
├─ .env.example       # contoh konfigurasi koneksi database
└─ public/
   ├─ index.html      # frontend yang udah nyambung ke API
   └─ uploads/        # foto hasil upload
```

## Cara jalanin

Butuh Node.js (versi 18+) dan **PostgreSQL** yang udah jalan (lokal atau cloud, mis. Supabase/Neon/Railway).

1. Buat database kosong, misalnya `ppcb`:
   ```bash
   createdb ppcb
   ```
2. Copy `.env.example` jadi `.env`, isi `DATABASE_URL` sesuai koneksi database lu:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/ppcb
   ```
3. Install & jalanin:
   ```bash
   npm install        # sekali aja, download dependency
   npm start          # jalanin server
   ```

Tabel `problems` & data seed awal otomatis dibikin pas server pertama kali nyala — gak perlu migration manual.

Lalu buka browser:

```
http://localhost:6000
```

> Frontend `public/index.html` otomatis ke-serve dari root, jadi tinggal buka localhost:6000 langsung jalan lengkap sama chart, KPI, form, upload foto, dan export.

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

- **Database PostgreSQL**: butuh server Postgres jalan (lokal via `apt`/`brew`, Docker, atau layanan cloud gratis kayak Supabase/Neon/Railway). Cek `.env.example` buat opsi konfigurasi koneksi.
- Semua query udah pakai parameterized query (`$1, $2, ...`) via `pg`, jadi aman dari SQL injection.
- Kalau butuh multi-instance / scaling, PostgreSQL udah support itu secara native — tinggal arahkan `DATABASE_URL` ke server yang sama dari tiap instance backend.
- Foto tetap disimpan di `public/uploads/` (bukan di database). Backup folder ini + database Postgres = backup semua data.

## Kalau mau integrasi ke stack React/Vite/Shadcn (PM Monitoring)

Endpoint di atas tinggal di-`fetch` dari komponen React lu. Contoh:

```js
// services/problemService.js
const API = "http://localhost:6000/api";
export const getProblems = (q="", status="All") =>
  fetch(`${API}/problems?q=${q}&status=${status}`).then(r => r.json());
export const getSummary = () => fetch(`${API}/summary`).then(r => r.json());
export const addProblem = (formData) =>
  fetch(`${API}/problems`, { method:"POST", body: formData }).then(r => r.json());
export const deleteProblem = (id) =>
  fetch(`${API}/problems/${id}`, { method:"DELETE" });
```
