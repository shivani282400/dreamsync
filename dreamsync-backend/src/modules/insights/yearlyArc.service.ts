import { PrismaClient } from "@prisma/client";

export type YearlyArc = {
  title: string;
  dominantThemes: string[];
  emotionalProgression: string;
  reflectiveDepth: string;
  closingNote: string;
};

function topItems(items: string[], limit: number) {
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

function buildProgression(moods: string[]) {
  const cleaned = moods.map((m) => m.toLowerCase().trim()).filter(Boolean);
  if (cleaned.length === 0) return "steady";
  if (cleaned.length === 1) return cleaned[0];
  const first = cleaned[0];
  const last = cleaned[cleaned.length - 1];
  if (first === last) return first;
  return `${first} → ${last}`;
}

export async function getYearlyArc(
  prisma: PrismaClient,
  userId: string,
  year: number
): Promise<YearlyArc> {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year + 1, 0, 1));

  const dreams = await prisma.dream.findMany({
    where: {
      userId,
      createdAt: { gte: start, lt: end },
    },
    orderBy: { createdAt: "asc" },
    select: {
      mood: true,
      tags: true,
      createdAt: true,
    },
  });

  const reflections = await prisma.dreamReflection.findMany({
    where: {
      dream: { userId },
      createdAt: { gte: start, lt: end },
    },
    select: { id: true },
  });

  const moods = dreams
    .map((d) => d.mood)
    .filter((m): m is string => typeof m === "string");
  const tags = dreams.flatMap((d) => d.tags ?? []);

  const dominantThemes = topItems(tags, 4);
  const emotionalProgression = buildProgression(moods);

  const dreamCount = dreams.length;
  const reflectionCount = reflections.length;
  const reflectiveDepth =
    dreamCount === 0
      ? "No reflections were recorded this year."
      : `You wrote ${reflectionCount} reflection${
          reflectionCount === 1 ? "" : "s"
        } across ${dreamCount} dream${dreamCount === 1 ? "" : "s"}.`;

  const closingNote =
    dreamCount === 0
      ? "When you return, this space will still be here to hold your story."
      : "This year reads as a quiet arc of attention rather than a conclusion.";

  return {
    title: `${year} Yearly Arc`,
    dominantThemes,
    emotionalProgression,
    reflectiveDepth,
    closingNote,
  };
}
