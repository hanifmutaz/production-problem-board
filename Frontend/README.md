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

## Cara jalanin (Production — single server internal)

Setup production: **1 origin**. Backend serve hasil build React (folder `public/`) + API dari port yang sama. Gak perlu setting `VITE_API_BASE` atau CORS cross-origin.

Butuh Node.js (versi 18+) dan **PostgreSQL** yang udah jalan di server internal.

1. Buat database kosong, misalnya `ppcb`:
   ```bash
   createdb ppcb
   ```
2. Copy `.env.example` jadi `.env`, isi `DATABASE_URL` sesuai koneksi database lu:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/ppcb
   NODE_ENV=production
   ```
3. Build frontend dulu (sekali tiap ada perubahan UI) — hasilnya otomatis nyasar ke `Backend/public/`:
   ```bash
   cd Frontend
   npm install
   npm run build
   ```
4. Install & jalanin backend:
   ```bash
   cd ../Backend
   npm install        # sekali aja, download dependency
   npm start          # jalanin server
   ```

Tabel `problems` otomatis dibikin (create + migrate) pas server pertama kali nyala. **Gak ada seed data dummy** — tabel mulai kosong, murni data real.

Lalu buka browser:

```
http://<ip-server-internal>:6000
```

> Frontend hasil build otomatis ke-serve dari root (single origin), lengkap sama chart, KPI, form, upload foto, export, dan routing antar venue (refresh di URL manapun tetep jalan).

### Kalau ada perubahan di Frontend
Ulangi langkah 3 (`npm run build` di folder `Frontend`), lalu restart backend (`npm start` / restart service-nya) biar file statis ke-refresh.

### Rekomendasi jalanin sebagai service
Di server internal, disarankan pakai process manager biar auto-restart kalau crash/reboot, misalnya **pm2**:
```bash
npm install -g pm2
cd Backend
pm2 start server.js --name ppcb
pm2 save
pm2 startup
```

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