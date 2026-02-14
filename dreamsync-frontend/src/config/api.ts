const rawBaseUrl = import.meta.env.VITE_API_URL?.trim();
if (!rawBaseUrl) {
  throw new Error("VITE_API_URL not configured");
}

// Validate and normalize to a proper absolute URL with protocol and trailing slash.
let normalizedBaseUrl: string;
try {
  const url = new URL(rawBaseUrl);
  normalizedBaseUrl = url.toString().endsWith("/")
    ? url.toString()
    : `${url.toString()}/`;
} catch {
  throw new Error(
    `VITE_API_URL must be a valid absolute URL with protocol (e.g. https://example.com): "${rawBaseUrl}"`
  );
}

export const API_BASE_URL = normalizedBaseUrl;

// Safe helper to build absolute API URLs without malformed concatenation.
export function buildApiUrl(path: string): string {
  return new URL(path, API_BASE_URL).toString();
}
