const baseUrl = import.meta.env.VITE_API_URL?.trim();
if (!baseUrl) {
  throw new Error("VITE_API_URL not configured");
}

export const API_BASE_URL = baseUrl;
