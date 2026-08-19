import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Dev only: proxy biar `npm run dev` (Vite dev server) tetep bisa nembak backend lokal
  server: {
    proxy: {
      '/api': 'http://localhost:6000',
      '/uploads': 'http://localhost:6000',
    },
  },
  // Production: hasil `npm run build` langsung ditaruh di Backend/public,
  // jadi backend (single origin) yang serve file statis ini
  build: {
    outDir: '../Backend/public',
    emptyOutDir: false, // jangan hapus folder uploads/ yang ada di Backend/public
  },
})
