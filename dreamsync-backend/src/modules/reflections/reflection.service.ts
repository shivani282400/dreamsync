import { PrismaClient } from "@prisma/client";
import { getFrequencyStats } from "../stats/stats.service";
import { getEmotionalTrends } from "../stats/emotionalTrends.service";
import { getDreamClusters } from "../stats/dreamClusters.service";

export async function generateMonthlyReflection(
  prisma: PrismaClient,
  userId: string,
  period: string // "YYYY-MM"
) {
  const frequency = await getFrequencyStats(prisma, userId);
  const trends = await getEmotionalTrends(prisma, userId);
  const clusters = await getDreamClusters(prisma, userId);

  const topTheme = frequency.themes[0]?.label;
  const topEmotion = trends.trends.find(t => t.period === period)?.emotion;
  const mainCluster = clusters.clusters[0];

  const highlights: string[] = [];

  if (topTheme) {
    highlights.push(`Themes of ${topTheme} appeared frequently.`);
  }

  if (topEmotion) {
    highlights.push(`Emotional tone often felt ${topEmotion}.`);
  }

  if (mainCluster) {
    highlights.push(
      `${mainCluster.dreamIds.length} dreams felt closely connected.`
    );
  }

  return {
    period,
    title: "A Month of Subtle Shifts",
    summary: `This period reflects recurring patterns in your dreams. Rather than isolated moments, your dreams seem to return gently to similar ideas and emotions, suggesting an ongoing inner process.`,
    highlights,
  };
}
