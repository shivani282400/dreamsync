import { PrismaClient } from "@prisma/client";

type FrequencyItem = {
  label: string;
  count: number;
};

type InterpretationContent = {
  themes?: unknown;
  symbolTags?: unknown;
  emotionalTone?: unknown;
};

type DateRange = { start: Date; end: Date };

function parseWeekRange(week: string): DateRange {
  const match = week.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error("week is required in YYYY-Www format");
  }

  const year = Number(match[1]);
  const weekNumber = Number(match[2]);
  if (!Number.isFinite(year) || !Number.isFinite(weekNumber)) {
    throw new Error("Invalid week format");
  }

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7;
  const start = new Date(jan4);
  start.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (weekNumber - 1) * 7);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  return { start, end };
}

function parseMonthRange(month: string): DateRange {
  const match = month.match(/^(\d{4})-(\d{2})$/);
  if (!match) {
    throw new Error("month is required in YYYY-MM format");
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  if (!Number.isFinite(year) || monthIndex < 0 || monthIndex > 11) {
    throw new Error("Invalid month format");
  }

  const start = new Date(Date.UTC(year, monthIndex, 1));
  const end = new Date(Date.UTC(year, monthIndex + 1, 1));

  return { start, end };
}

function dayKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function toRange(params: { week?: string; month?: string }): DateRange {
  if (params.week) return parseWeekRange(params.week);
  if (params.month) return parseMonthRange(params.month);
  throw new Error("week or month is required");
}

function topList(items: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const raw of items) {
    const key = raw.toLowerCase().trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label]) => label);
}

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "for",
  "from",
  "has",
  "have",
  "had",
  "he",
  "her",
  "hers",
  "him",
  "his",
  "i",
  "in",
  "into",
  "is",
  "it",
  "its",
  "me",
  "my",
  "mine",
  "no",
  "not",
  "of",
  "on",
  "or",
  "our",
  "ours",
  "she",
  "so",
  "that",
  "the",
  "their",
  "them",
  "there",
  "these",
  "they",
  "this",
  "to",
  "was",
  "we",
  "were",
  "with",
  "you",
  "your",
  "yours",
]);

export async function getFrequencyStats(
  prisma: PrismaClient,
  userId: string
): Promise<{
  themes: FrequencyItem[];
  symbols: FrequencyItem[];
}> {
  // Fetch interpretations (content JSON)
  const interpretations = await prisma.interpretation.findMany({
    where: {
      dream: {
        userId,
      },
    },
    select: {
      content: true,
    },
  });

  // Fetch dreams (symbols from tags)
  const dreams = await prisma.dream.findMany({
    where: { userId },
    select: {
      tags: true,
    },
  });

  // ---- THEME COUNTING (FROM content.themes) ----
  const themeMap = new Map<string, number>();

  for (const interp of interpretations) {
    const content = interp.content as InterpretationContent;

    if (!Array.isArray(content?.themes)) continue;

    for (const theme of content.themes) {
      if (typeof theme !== "string") continue;

      const key = theme.toLowerCase().trim();
      themeMap.set(key, (themeMap.get(key) ?? 0) + 1);
    }
  }

  // ---- SYMBOL COUNTING (FROM interpretation.symbolTags + dream.tags) ----
  const symbolMap = new Map<string, number>();

  for (const interp of interpretations) {
    const content = interp.content as InterpretationContent;

    if (!Array.isArray(content?.symbolTags)) continue;

    for (const tag of content.symbolTags) {
      if (typeof tag !== "string") continue;

      const key = tag.toLowerCase().trim();
      symbolMap.set(key, (symbolMap.get(key) ?? 0) + 1);
    }
  }

  for (const dream of dreams) {
    if (!Array.isArray(dream.tags)) continue;

    for (const tag of dream.tags) {
      if (typeof tag !== "string") continue;

      const key = tag.toLowerCase().trim();
      symbolMap.set(key, (symbolMap.get(key) ?? 0) + 1);
    }
  }

  const themes = Array.from(themeMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  const symbols = Array.from(symbolMap.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);

  return { themes, symbols };
}

export async function getCalendarStats(
  prisma: PrismaClient,
  userId: string,
  month: string
): Promise<{
  days: {
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
      createdAt: Date;
    }[];
  }[];
}> {
  const range = parseMonthRange(month);

  const dreams = await prisma.dream.findMany({
    where: {
      userId,
      createdAt: { gte: range.start, lt: range.end },
    },
    orderBy: { createdAt: "asc" },
    include: { interpretation: { select: { content: true } } },
  });

  const grouped = new Map<
    string,
    {
      dreams: {
        id: string;
        title: string | null;
        mood: string | null;
        tags: string[];
        createdAt: Date;
      }[];
      moods: string[];
      tags: string[];
      reflectionCount: number;
    }
  >();

  for (const dream of dreams) {
    const key = dayKey(dream.createdAt);
    if (!grouped.has(key)) {
      grouped.set(key, { dreams: [], moods: [], tags: [], reflectionCount: 0 });
    }

    const entry = grouped.get(key)!;
    entry.dreams.push({
      id: dream.id,
      title: dream.title,
      mood: dream.mood ?? null,
      tags: dream.tags ?? [],
      createdAt: dream.createdAt,
    });

    if (dream.mood) entry.moods.push(dream.mood);

    const interp = dream.interpretation?.content as InterpretationContent;
    if (typeof interp?.emotionalTone === "string" && !dream.mood) {
      entry.moods.push(String(interp.emotionalTone));
    }

    if (Array.isArray(dream.tags)) entry.tags.push(...dream.tags);
    if (Array.isArray(interp?.symbolTags))
      entry.tags.push(...(interp.symbolTags as string[]));
  }

  const reflections = await prisma.dreamReflection.findMany({
    where: {
      dream: { userId },
      createdAt: { gte: range.start, lt: range.end },
    },
    select: { createdAt: true },
  });

  for (const reflection of reflections) {
    const key = dayKey(reflection.createdAt);
    if (!grouped.has(key)) {
      grouped.set(key, { dreams: [], moods: [], tags: [], reflectionCount: 0 });
    }
    grouped.get(key)!.reflectionCount += 1;
  }

  const days = Array.from(grouped.entries())
    .map(([date, value]) => {
      const mood = topList(value.moods, 1)[0] ?? null;
      const tags = topList(value.tags, 3);
      return {
        date,
        count: value.dreams.length,
        dominantMood: mood,
        tags,
        reflectionCount: value.reflectionCount,
        dreams: value.dreams,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  return { days };
}

export async function getWordFrequency(
  prisma: PrismaClient,
  userId: string,
  params: { week?: string; month?: string; limit?: number }
): Promise<{ words: { label: string; count: number }[] }> {
  const range = toRange(params);
  const limit = params.limit ?? 20;

  const reflections = await prisma.dreamReflection.findMany({
    where: {
      dream: { userId },
      createdAt: { gte: range.start, lt: range.end },
    },
    select: { answer: true },
  });

  const counts = new Map<string, number>();

  for (const reflection of reflections) {
    const tokens = reflection.answer
      .toLowerCase()
      .split(/[^a-z0-9']+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3 && !STOP_WORDS.has(t));

    for (const token of tokens) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
  }

  const words = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));

  return { words };
}

export async function getTagTrends(
  prisma: PrismaClient,
  userId: string,
  params: { week?: string; month?: string; limit?: number }
): Promise<{ tags: string[]; points: { date: string; counts: number[] }[] }> {
  const range = toRange(params);
  const limit = params.limit ?? 6;

  const dreams = await prisma.dream.findMany({
    where: {
      userId,
      createdAt: { gte: range.start, lt: range.end },
    },
    orderBy: { createdAt: "asc" },
    include: { interpretation: { select: { content: true } } },
  });

  const allTags: string[] = [];
  const byDay = new Map<string, string[]>();

  for (const dream of dreams) {
    const key = dayKey(dream.createdAt);
    if (!byDay.has(key)) byDay.set(key, []);

    const tags = [
      ...(dream.tags ?? []),
      ...(((dream.interpretation?.content as InterpretationContent)
        ?.symbolTags as string[]) ?? []),
    ];

    allTags.push(...tags);
    byDay.get(key)!.push(...tags);
  }

  const topTags = topList(allTags, limit);

  const points = Array.from(byDay.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, tags]) => {
      const counts = topTags.map((tag) => {
        const key = tag.toLowerCase();
        return tags.filter((t) => t.toLowerCase().trim() === key).length;
      });
      return { date, counts };
    });

  return { tags: topTags, points };
}
