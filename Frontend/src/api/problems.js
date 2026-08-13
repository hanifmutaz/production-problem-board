// API layer buat Production Problem Control Board
// Default: relative "/api" (dev pake proxy vite, prod bisa taruh 1 origin sama backend)
// Kalau backend-nya beda origin, set VITE_API_BASE di .env, mis: VITE_API_BASE=http://localhost:3000/api
const API = import.meta.env.VITE_API_BASE || "/api";

// Label buat ditampilin di pesan error kalau fetch gagal - biar gak hardcode port yang salah.
export const apiBaseLabel = import.meta.env.VITE_API_BASE || "backend (lihat vite.config.js proxy)";

async function toJson(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request gagal (${res.status})`);
  }
  return res.json();
}

export function getProblems(q = "", status = "All") {
  const params = new URLSearchParams({ q, status });
  return fetch(`${API}/problems?${params}`).then(toJson);
}

export function getSummary() {
  return fetch(`${API}/summary`).then(toJson);
}

export function createProblem(formData) {
  return fetch(`${API}/problems`, { method: "POST", body: formData }).then(toJson);
}

export function updateProblem(id, formData) {
  return fetch(`${API}/problems/${id}`, { method: "PUT", body: formData }).then(toJson);
}

export function deleteProblem(id) {
  return fetch(`${API}/problems/${id}`, { method: "DELETE" }).then(toJson);
}

export function exportCsvUrl() {
  return `${API}/export/csv`;
}

// Foto disimpan backend sebagai path relatif ("/uploads/xxx.png").
// Kalau VITE_API_BASE nunjuk ke origin lain, foto perlu di-resolve ke origin itu juga.
export function resolvePhotoUrl(photoPath) {
  if (!photoPath) return null;
  if (!import.meta.env.VITE_API_BASE) return photoPath; // sama origin, path relatif udah cukup
  try {
    const origin = new URL(import.meta.env.VITE_API_BASE).origin;
    return origin + photoPath;
  } catch {
    return photoPath;
  }
}
