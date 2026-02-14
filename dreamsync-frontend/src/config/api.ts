let baseUrl = import.meta.env.VITE_API_URL?.trim();
if (!baseUrl) {
  throw new Error("VITE_API_URL not configured");
}

// Normalize protocol if missing (defaults to https://).
if (!/^https?:\/\//.test(baseUrl)) {
  baseUrl = `https://${baseUrl}`;
}

// Validate and normalize to a proper absolute URL with trailing slash.
let normalizedBaseUrl: string;
try {
  const url = new URL(baseUrl);
  normalizedBaseUrl = url.toString().endsWith("/")
    ? url.toString()
    : `${url.toString()}/`;
} catch {
  throw new Error(
    `VITE_API_URL must be a valid URL (e.g. https://example.com): "${baseUrl}"`
  );
}

export const API_BASE_URL = normalizedBaseUrl;

// Safe helper to build absolute API URLs without malformed concatenation.
export function buildApiUrl(path: string): string {
  return new URL(path, API_BASE_URL).toString();
}
