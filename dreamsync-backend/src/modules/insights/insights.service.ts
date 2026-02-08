import { InsightType, PrismaClient } from "@prisma/client";
import { InsightContent } from "./insights.types";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function getIsoWeekRange(period: string): { start: Date; end: Date } {
  const match = period.match(/^(\d{4})-W(\d{2})$/);
  if (!match) {
    throw new Error("week is required in YYYY-Www format");
  }

  const year = Number(match[1]);
  const week = Number(match[2]);

  if (!Number.isFinite(year) || !Number.isFinite(week)) {
    throw new Error("Invalid week format");
  }

  const jan4 = new Date(Date.UTC(year, 0, 4));
  const jan4Day = jan4.getUTCDay() || 7; // 1..7 (Mon..Sun)
  const start = new Date(jan4);
  start.setUTCDate(jan4.getUTCDate() - (jan4Day - 1) + (week - 1) * 7);
  start.setUTCHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 7);

  return { start, end };
}

function getMonthRange(period: string): {
  start: Date;
  end: Date;
  label: string;
} {
  const match = period.match(/^(\d{4})-(\d{2})$/);
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
  const label = `${MONTH_NAMES[monthIndex]} ${year}`;

  return { start, end, label };
}

function topItems(items: string[], limit: number): string[] {
  const counts = new Map<string, number>();
  for (const raw of items) {
    if (!raw) continue;
    const key = raw.toLowerCase().trim();
    if (!key) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value]) => value);
}

function buildEmotionalArc(entries: string[]): string {
  const cleaned = entries
    .map((e) => e.toLowerCase().trim())
    .filter(Boolean);

  if (cleaned.length === 0) return "steady";
  if (cleaned.length === 1) return cleaned[0];

  const start = cleaned[0];
  const mid = cleaned[Math.floor(cleaned.length / 2)];
  const end = cleaned[cleaned.length - 1];

  if (start === mid && mid === end) return start;

  const unique = [start, mid, end].filter(
    (value, index, arr) => arr.indexOf(value) === index
  );

  return unique.join(" -> ");
}

function buildSummary(params: {
  dreamCount: number;
  reflectionCount: number;
  dominantThemes: string[];
  periodLabel: string;
  tone: "weekly" | "monthly";
}): string {
  const { dreamCount, reflectionCount, dominantThemes, periodLabel, tone } =
    params;

  if (dreamCount === 0) {
    return `No dreams were recorded for ${periodLabel}. This space can stay quiet until more entries arrive.`;
  }

  const themeLine = dominantThemes.length
    ? `Themes that returned include ${dominantThemes.join(", ")}.`
    : "Themes are still emerging.";

  const reflectionLine =
    reflectionCount > 0
      ? `You added ${reflectionCount} reflection${
          reflectionCount === 1 ? "" : "s"
        }, adding depth to the dream record.`
      : "Reflection answers are ready whenever you feel drawn to add them.";

  return `During this ${tone} period (${periodLabel}), you recorded ${dreamCount} dream${
    dreamCount === 1 ? "" : "s"
  }. ${themeLine} ${reflectionLine}`;
}

function buildClosingNote(dreamCount: number, tone: "weekly" | "monthly") {
  if (dreamCount === 0) {
    return "Whenever you return, this space will still be here for you.";
  }

  return tone === "weekly"
    ? "This week feels like a gentle snapshot rather than a conclusion."
    : "The month reads like a soft arc of attention, not a final statement.";
}

export async function getWeeklyInsightSnapshot(
  prisma: PrismaClient,
  userId: string,
  week: string
): Promise<InsightContent> {
  const existing = await prisma.insightSnapshot.findFirst({
    where: { userId, period: week, type: InsightType.WEEKLY },
  });

  if (existing) {
    return existing.content as InsightContent;
  }

  const range = getIsoWeekRange(week);

  const dreams = await prisma.dream.findMany({
    where: {
      userId,
      createdAt: { gte: range.start, lt: range.end },
    },
    orderBy: { createdAt: "asc" },
    include: {
      interpretation: { select: { content: true } },
      reflections: { select: { question: true, answer: true } },
    },
  });

  const dreamCount = dreams.length;

  const themes: string[] = [];
  const moods: string[] = [];
  const reflectionQuestions: string[] = [];

  for (const dream of dreams) {
    if (dream.mood) moods.push(dream.mood);

    const interp = dream.interpretation?.content as any;
    if (Array.isArray(interp?.themes)) {
      themes.push(...interp.themes);
    }
    if (interp?.emotionalTone && !dream.mood) {
      moods.push(String(interp.emotionalTone));
    }

    for (const reflection of dream.reflections) {
      if (reflection.question) reflectionQuestions.push(reflection.question);
    }
  }

  const dominantThemes = topItems(themes, 4);
  const emotionalArc = buildEmotionalArc(moods);
  const keyQuestionsYouExplored = Array.from(
    new Set(reflectionQuestions.map((q) => q.trim()).filter(Boolean))
  ).slice(0, 4);

  const summary = buildSummary({
    dreamCount,
    reflectionCount: reflectionQuestions.length,
    dominantThemes,
    periodLabel: week,
    tone: "weekly",
  });

  const content: InsightContent = {
    title: `Week ${week}`,
    summary,
    dominantThemes,
    emotionalArc,
    keyQuestionsYouExplored,
    closingNote: buildClosingNote(dreamCount, "weekly"),
  };

  await prisma.insightSnapshot.create({
    data: {
      userId,
      period: week,
      type: InsightType.WEEKLY,
      content,
    },
  });

  return content;
}

export async function getMonthlyInsightSnapshot(
  prisma: PrismaClient,
  userId: string,
  month: string
): Promise<InsightContent> {
  const existing = await prisma.insightSnapshot.findFirst({
    where: { userId, period: month, type: InsightType.MONTHLY },
  });

  if (existing) {
    return existing.content as InsightContent;
  }

  const range = getMonthRange(month);

  const dreams = await prisma.dream.findMany({
    where: {
      userId,
      createdAt: { gte: range.start, lt: range.end },
    },
    orderBy: { createdAt: "asc" },
    include: {
      interpretation: { select: { content: true } },
      reflections: { select: { question: true, answer: true } },
    },
  });

  const dreamCount = dreams.length;

  const themes: string[] = [];
  const moods: string[] = [];
  const reflectionQuestions: string[] = [];

  for (const dream of dreams) {
    if (dream.mood) moods.push(dream.mood);

    const interp = dream.interpretation?.content as any;
    if (Array.isArray(interp?.themes)) {
      themes.push(...interp.themes);
    }
    if (interp?.emotionalTone && !dream.mood) {
      moods.push(String(interp.emotionalTone));
    }

    for (const reflection of dream.reflections) {
      if (reflection.question) reflectionQuestions.push(reflection.question);
    }
  }

  const dominantThemes = topItems(themes, 5);
  const emotionalArc = buildEmotionalArc(moods);
  const keyQuestionsYouExplored = Array.from(
    new Set(reflectionQuestions.map((q) => q.trim()).filter(Boolean))
  ).slice(0, 6);

  const summary = buildSummary({
    dreamCount,
    reflectionCount: reflectionQuestions.length,
    dominantThemes,
    periodLabel: range.label,
    tone: "monthly",
  });

  const content: InsightContent = {
    title: `${range.label} Reflections`,
    summary,
    dominantThemes,
    emotionalArc,
    keyQuestionsYouExplored,
    closingNote: buildClosingNote(dreamCount, "monthly"),
  };

  await prisma.insightSnapshot.create({
    data: {
      userId,
      period: month,
      type: InsightType.MONTHLY,
      content,
    },
  });

  return content;
}
