import { API_BASE_URL } from "../config/api";
import { getAuthToken } from "./authToken";


// ---------- core fetch wrapper ----------

export async function apiFetch(
  path: string,
  options: RequestInit = {}
) {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  // ✅ SAFE URL CONSTRUCTION (FIXES DOUBLE https:// BUG)
  const url = new URL(path, API_BASE_URL).toString();

  const response = await fetch(url, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers as Record<string, string>),
    },
  });

  if (!response.ok) {
    let errorMessage = `API error: ${response.status}`;
    try {
      const error = await response.json();
      errorMessage = error.message ?? errorMessage;
    } catch {
      // ignore JSON parse errors
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// ---------- Community ----------

export async function shareDreamToCommunity(dreamId: string) {
  return apiFetch(`/community/share/${dreamId}`, {
    method: "POST",
  });
}

export async function unshareDreamFromCommunity(dreamId: string) {
  return apiFetch(`/community/unshare/${dreamId}`, {
    method: "DELETE",
  });
}

// ---------- Community feed refresh event ----------

const COMMUNITY_FEED_EVENT = "dreamsync:community-feed-refresh";

export function emitCommunityFeedRefresh() {
  window.dispatchEvent(new CustomEvent(COMMUNITY_FEED_EVENT));
}

export function onCommunityFeedRefresh(handler: () => void) {
  window.addEventListener(COMMUNITY_FEED_EVENT, handler);
  return () => window.removeEventListener(COMMUNITY_FEED_EVENT, handler);
}

// ---------- Types ----------

export type Dream = {
  id: string;
  title: string | null;
  content: string;
  mood: string | null;
  tags: string[];
  createdAt: string;
  isShared?: boolean;
  interpretation?: {
    content: {
      summary: string;
      themes: string[];
      emotionalTone: string;
      reflectionPrompts: string[];
      // Include additional fields returned by the backend to avoid structural mismatches.
      symbolTags?: string[];
      wordReflections?: { word: string; reflection: string }[];
    };
  } | null;
};

export type DreamsResponse = {
  dreams: Dream[];
  meta?: { count?: number };
};

export type DreamResponse = {
  dream: Dream;
};

export type DreamReflection = {
  id: string;
  dreamId: string;
  question: string;
  answer: string;
  createdAt: string;
};

export type CommunityDream = {
  id: string;
  anonymizedText: string;
  theme: string;
  mood?: string;
  tags: string[];
  createdAt: string;
  username: string;
};

export type InsightContent = {
  title: string;
  summary: string;
  dominantThemes: string[];
  emotionalArc: string;
  keyQuestionsYouExplored: string[];
  closingNote: string;
};

export type CalendarDay = {
  date: string;
  count: number;
  dominantMood: string | null;
  tags: string[];
  reflectionCount: number;
  dreams: {
    id: string;
    title: string | null;
    mood: string | null;
    tags: string[];
    createdAt: string;
  }[];
};

export type TagTrends = {
  tags: string[];
  points: { date: string; counts: number[] }[];
};

export type WordFrequency = {
  words: { label: string; count: number }[];
};

export type YearlyArc = {
  title: string;
  dominantThemes: string[];
  emotionalProgression: string;
  reflectiveDepth: string;
  closingNote: string;
};

export type UserIdentity = {
  id: string;
  username: string;
  usernameLocked: boolean;
};

export type DreamChapter = {
  id: string;
  title: string;
  explanation: string;
  dominantThemes: string[];
  emotionalArc: string;
  startDate: string;
  endDate: string;
  dreams: {
    id: string;
    title: string | null;
    createdAt: string;
    emotionalTone: string | null;
  }[];
};

// ---------- API helpers ----------

export async function getDreams(): Promise<DreamsResponse> {
  return apiFetch("/dreams/me");
}

export async function getDreamById(id: string): Promise<DreamResponse> {
  return apiFetch(`/dreams/${id}`);
}

export async function createDream(body: {
  title?: string;
  content: string;
  mood?: string;
  tags?: string[];
}): Promise<Dream> {
  return apiFetch("/dreams", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function interpretDream(dreamId: string) {
  return apiFetch(`/api/interpretations/${dreamId}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export async function createDreamReflection(body: {
  dreamId: string;
  question: string;
  answer: string;
}): Promise<DreamReflection> {
  return apiFetch("/reflections", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getDreamReflections(
  dreamId: string
): Promise<DreamReflection[]> {
  return apiFetch(`/dreams/${dreamId}/reflections`);
}

export async function getCommunityFeed(
  theme?: string
): Promise<CommunityDream[]> {
  const query =
    theme && theme !== "All"
      ? `?theme=${encodeURIComponent(theme)}`
      : "";

  return apiFetch(`/community/feed${query}`);
}

export async function updateDreamReflection(
  reflectionId: string,
  answer: string
): Promise<DreamReflection> {
  return apiFetch(`/reflections/${reflectionId}`, {
    method: "PUT",
    body: JSON.stringify({ answer }),
  });
}

export async function deleteDreamReflection(
  reflectionId: string
): Promise<{ ok: boolean }> {
  return apiFetch(`/reflections/${reflectionId}`, {
    method: "DELETE",
  });
}

export async function getWeeklyInsights(
  week: string
): Promise<InsightContent> {
  return apiFetch(`/insights/weekly?week=${encodeURIComponent(week)}`);
}

export async function getMonthlyInsights(
  month: string
): Promise<InsightContent> {
  return apiFetch(`/insights/monthly?month=${encodeURIComponent(month)}`);
}

export async function getCalendarStats(
  month: string
): Promise<{ days: CalendarDay[] }> {
  return apiFetch(`/stats/calendar?month=${encodeURIComponent(month)}`);
}

export async function getTagTrends(
  params: { week?: string; month?: string; limit?: number }
): Promise<TagTrends> {
  const query = new URLSearchParams();
  if (params.week) query.set("week", params.week);
  if (params.month) query.set("month", params.month);
  if (params.limit) query.set("limit", String(params.limit));
  return apiFetch(`/stats/tag-trends?${query.toString()}`);
}

export async function getWordFrequency(
  params: { week?: string; month?: string; limit?: number }
): Promise<WordFrequency> {
  const query = new URLSearchParams();
  if (params.week) query.set("week", params.week);
  if (params.month) query.set("month", params.month);
  if (params.limit) query.set("limit", String(params.limit));
  return apiFetch(`/stats/word-frequency?${query.toString()}`);
}

export async function getYearlyArc(year: number): Promise<YearlyArc> {
  return apiFetch(`/insights/yearly?year=${encodeURIComponent(String(year))}`);
}

export async function getDreamChapters(): Promise<DreamChapter[]> {
  return apiFetch(`/insights/chapters`);
}

export async function getCurrentUser(): Promise<UserIdentity> {
  return apiFetch(`/user/me`);
}

export async function updateUsername(username: string): Promise<UserIdentity> {
  return apiFetch(`/user/username`, {
    method: "PUT",
    body: JSON.stringify({ username }),
  });
}

export async function regenerateUsername(): Promise<UserIdentity> {
  return apiFetch(`/user/username/regenerate`, {
    method: "POST",
  });
}

export async function lockUsername(): Promise<UserIdentity> {
  return apiFetch(`/user/username/lock`, {
    method: "POST",
  });
}
