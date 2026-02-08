import { apiFetch } from "../lib/apiClient";

export async function interpretDreamApi(
  dreamText: string,
  mood?: string,
  tags?: string[]
) {
  return apiFetch("/api/interpret", {
    method: "POST",
    body: JSON.stringify({
      dreamText,
      mood,
      tags,
    }),
  });
}
