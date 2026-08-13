# Production Problem Control Board — Frontend (React)

React + Vite + Tailwind v4 buat `ppcb-backend`. Fitur sama persis kayak versi HTML lama (KPI, 3 chart, search & filter, table dengan foto/lightbox, add/edit/delete, export CSV & PDF) — cuma sekarang berupa komponen React yang gampang dikembangin/di-reuse.

## Struktur

```
src/
├─ api/problems.js        # semua fetch ke backend
├─ components/
│  ├─ Header.jsx           # judul + tombol export & add
│  ├─ KpiCards.jsx         # 4 kartu KPI
│  ├─ BarChartCard.jsx     # bar chart by classification / PIC
│  ├─ DonutCard.jsx        # donut open vs close
│  ├─ Toolbar.jsx          # search + filter status
│  ├─ ProblemTable.jsx     # tabel data (highlight row overdue)
│  ├─ ProblemModal.jsx     # form add/edit (reuse buat dua-duanya)
│  └─ Lightbox.jsx         # preview foto full-size
└─ App.jsx                 # state & orkestrasi
```

## Jalanin

Backend (`ppcb-backend`) harus jalan duluan di `localhost:3000`.

```bash
npm install
npm run dev       # http://localhost:5173, /api & /uploads di-proxy ke backend
```

Kalau backend jalan di origin/port lain (bukan localhost:3000), set `VITE_API_BASE` di `.env` (lihat `.env.example`).

## Build production

```bash
npm run build     # hasil di dist/
```

Cara paling gampang deploy: copy isi `dist/` ke folder `public/` di `ppcb-backend`, jadi backend Express yang serve langsung (satu origin, gak perlu CORS/`VITE_API_BASE`). Atau host `dist/` terpisah (mis. Nginx/static host) dan set `VITE_API_BASE` ke URL backend.
