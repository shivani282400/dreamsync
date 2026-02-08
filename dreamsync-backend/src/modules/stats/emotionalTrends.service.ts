import { PrismaClient } from "@prisma/client";

type EmotionalTrendPoint = {
  period: string;   // YYYY-MM
  emotion: string;
  count: number;
};

type InterpretationContent = {
  emotionalTone?: unknown;
};

function formatMonth(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export async function getEmotionalTrends(
  prisma: PrismaClient,
  userId: string
): Promise<{
  trends: EmotionalTrendPoint[];
}> {
  const interpretations = await prisma.interpretation.findMany({
    where: {
      dream: {
        userId,
      },
    },
    select: {
      content: true,
      createdAt: true,
    },
  });

  // Map<period, Map<emotion, count>>
  const trendMap = new Map<string, Map<string, number>>();

  for (const interp of interpretations) {
    const content = interp.content as InterpretationContent;
    if (typeof content.emotionalTone !== "string") continue;

    const emotion = content.emotionalTone.toLowerCase().trim();
    const period = formatMonth(interp.createdAt);

    if (!trendMap.has(period)) {
      trendMap.set(period, new Map());
    }

    const emotionMap = trendMap.get(period)!;
    emotionMap.set(emotion, (emotionMap.get(emotion) ?? 0) + 1);
  }

  // Flatten map → array
  const trends: EmotionalTrendPoint[] = [];

  for (const [period, emotions] of trendMap.entries()) {
    for (const [emotion, count] of emotions.entries()) {
      trends.push({ period, emotion, count });
    }
  }

  // Sort by period ASC (chronological)
  trends.sort((a, b) => a.period.localeCompare(b.period));

  return { trends };
}
