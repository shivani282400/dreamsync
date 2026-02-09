const raw = import.meta.env.VITE_API_URL;

if (!raw) {
  console.warn("⚠️ VITE_API_URL is undefined, falling back to localhost");
}

export const API_BASE_URL = raw ?? "http://localhost:3000";

console.warn("🔥 FRONTEND BUILD CHECK 🔥");
console.warn("API_BASE_URL =", API_BASE_URL);
