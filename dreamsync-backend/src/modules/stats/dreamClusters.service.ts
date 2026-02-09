import { PrismaClient } from "@prisma/client";
import { findSimilarDreams } from "../../services/vector.service.js"

type DreamCluster = {
  clusterId: string;
  label: string;
  dreamIds: string[];
};

type InterpretationContent = {
  themes?: unknown;
};

/**
 * Simple cosine similarity threshold-based clustering.
 * This is deterministic, fast, and explainable.
 */
const SIMILARITY_THRESHOLD = 0.75;

export async function getDreamClusters(
  prisma: PrismaClient,
  userId: string
): Promise<{
  clusters: DreamCluster[];
}> {
  // 1️⃣ Fetch all dream IDs for user
  const dreams = await prisma.dream.findMany({
    where: { userId },
    select: { id: true },
  });

  const remaining = new Set(dreams.map((d) => d.id));
  const clusters: DreamCluster[] = [];

  // 2️⃣ Greedy clustering
  for (const dream of dreams) {
    if (!remaining.has(dream.id)) continue;

    // Find similar dreams via vector DB
    const similar = await findSimilarDreams(userId, [], 10).catch(() => []);
    const similarIds = similar
      .filter((s) => s.score >= SIMILARITY_THRESHOLD)
      .map((s) => s.dreamId)
      .filter((id) => remaining.has(id));

    const clusterDreamIds = [dream.id, ...similarIds];

    // Remove clustered dreams from remaining
    clusterDreamIds.forEach((id) => remaining.delete(id));

    clusters.push({
      clusterId: crypto.randomUUID(),
      label: "Recurring dream pattern",
      dreamIds: clusterDreamIds,
    });
  }

  // 3️⃣ Generate cluster labels from interpretation themes
  for (const cluster of clusters) {
    const interpretations = await prisma.interpretation.findMany({
      where: {
        dreamId: { in: cluster.dreamIds },
      },
      select: {
        content: true,
      },
    });

    const themeCount = new Map<string, number>();

    for (const interp of interpretations) {
      const content = interp.content as InterpretationContent;
      if (!Array.isArray(content.themes)) continue;

      for (const theme of content.themes) {
        if (typeof theme !== "string") continue;
        const key = theme.toLowerCase().trim();
        themeCount.set(key, (themeCount.get(key) ?? 0) + 1);
      }
    }

    const topTheme = Array.from(themeCount.entries()).sort(
      (a, b) => b[1] - a[1]
    )[0];

    if (topTheme) {
      cluster.label = `Dreams about ${topTheme[0]}`;
    }
  }

  return { clusters };
}
