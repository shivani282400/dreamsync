import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

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

type InterpretationContent = {
  themes?: unknown;
  emotionalTone?: unknown;
};

const TITLE_MAP: Array<{
  match: string[];
  title: string;
}> = [
  {
    match: ["reflection", "inner awareness"],
    title: "A Phase of Quiet Processing",
  },
  {
    match: ["transition", "uncertainty"],
    title: "Navigating Change",
  },
  {
    match: ["fear", "anxiety"],
    title: "Working Through Unease",
  },
  {
    match: ["home", "family"],
    title: "Returning to What Grounds You",
  },
];

function toDayString(date: Date) {
  return date.toISOString().split("T")[0];
}

function daysBetween(start: Date, end: Date) {
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(diff / 86400000));
}

function pickTitle(themes: string[]) {
  for (const rule of TITLE_MAP) {
    if (rule.match.every((m) => themes.includes(m))) {
      return rule.title;
    }
  }

  const [first, second] = themes;
  if (first && second) {
    return `A Chapter of ${capitalize(first)} and ${capitalize(second)}`;
  }

  if (first) return `A Chapter of ${capitalize(first)}`;
  return "A Gentle Chapter";
}

function capitalize(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function buildEmotionalArc(tones: (string | null)[]) {
  const cleaned = tones
    .filter((tone): tone is string => typeof tone === "string")
    .map((tone) => tone.toLowerCase().trim())
    .filter(Boolean);

  if (cleaned.length === 0) return "steady";
  if (cleaned.length === 1) return cleaned[0];

  const start = cleaned[0];
  const mid = cleaned[Math.floor(cleaned.length / 2)];
  const end = cleaned[cleaned.length - 1];

  const unique = [start, mid, end].filter(
    (value, index, arr) => arr.indexOf(value) === index
  );

  return unique.join(" → ");
}

function extractThemes(tags: string[], interpretation?: InterpretationContent) {
  const themes: string[] = [];
  tags.forEach((tag) => themes.push(tag.toLowerCase().trim()));

  if (Array.isArray(interpretation?.themes)) {
    interpretation.themes.forEach((theme) => {
      if (typeof theme === "string") {
        themes.push(theme.toLowerCase().trim());
      }
    });
  }

  return themes.filter(Boolean);
}

function intersectionCount(a: Set<string>, b: Set<string>) {
  let count = 0;
  for (const item of a) {
    if (b.has(item)) count += 1;
  }
  return count;
}

export async function getDreamChapters(
  prisma: PrismaClient,
  userId: string
): Promise<DreamChapter[]> {
  const dreams = await prisma.dream.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: {
      interpretation: { select: { content: true } },
    },
  });

  type DreamRow = (typeof dreams)[number];
  const clusters: DreamRow[][] = [];
  let currentCluster: DreamRow[] = [];

  for (const dream of dreams) {
    if (currentCluster.length === 0) {
      currentCluster.push(dream);
      continue;
    }

    const lastDream = currentCluster[currentCluster.length - 1];
    const lastDate = lastDream.createdAt;
    const currentDate = dream.createdAt;
    const withinWindow =
      Math.abs(currentDate.getTime() - lastDate.getTime()) <=
      14 * 86400000;

    const lastThemes = new Set(
      extractThemes(
        lastDream.tags ?? [],
        lastDream.interpretation?.content as InterpretationContent
      )
    );
    const currentThemes = new Set(
      extractThemes(
        dream.tags ?? [],
        dream.interpretation?.content as InterpretationContent
      )
    );

    const overlap = intersectionCount(lastThemes, currentThemes);

    if (withinWindow && overlap >= 2) {
      currentCluster.push(dream);
    } else {
      clusters.push(currentCluster);
      currentCluster = [dream];
    }
  }

  if (currentCluster.length > 0) {
    clusters.push(currentCluster);
  }

  const validClusters = clusters.filter((cluster) => cluster.length >= 2);

  const chapters: DreamChapter[] = validClusters.map((cluster) => {
    const themes: string[] = [];
    const tones: (string | null)[] = [];

    cluster.forEach((dream) => {
      const content = dream.interpretation?.content as InterpretationContent;
      themes.push(
        ...extractThemes(dream.tags ?? [], content)
      );
      if (typeof content?.emotionalTone === "string") {
        tones.push(content.emotionalTone);
      } else if (dream.mood) {
        tones.push(dream.mood);
      } else {
        tones.push(null);
      }
    });

    const themeCounts = new Map<string, number>();
    themes.forEach((theme) => {
      themeCounts.set(theme, (themeCounts.get(theme) ?? 0) + 1);
    });

    const dominantThemes = Array.from(themeCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([theme]) => theme);

    const startDate = cluster[0].createdAt;
    const endDate = cluster[cluster.length - 1].createdAt;
    const duration = daysBetween(startDate, endDate);

    return {
      id: crypto.randomUUID(),
      title: pickTitle(dominantThemes),
      explanation: `${cluster.length} dreams over ${duration} days · Shared themes: ${
        dominantThemes.length ? dominantThemes.join(", ") : "emerging"
      }`,
      dominantThemes,
      emotionalArc: buildEmotionalArc(tones),
      startDate: toDayString(startDate),
      endDate: toDayString(endDate),
      dreams: cluster.map((dream) => {
        const content = dream.interpretation?.content as InterpretationContent;
        const tone =
          typeof content?.emotionalTone === "string"
            ? content.emotionalTone
            : dream.mood ?? null;

        return {
          id: dream.id,
          title: dream.title,
          createdAt: dream.createdAt.toISOString(),
          emotionalTone: tone,
        };
      }),
    };
  });

  return chapters.sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  );
}
