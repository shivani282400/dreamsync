import { PrismaClient } from "@prisma/client";

// 🔍 Read community feed
export async function getCommunityFeed(
  prisma: PrismaClient,
  theme?: string
) {
  const feed = await prisma.communityDream.findMany({
    where:
      theme && theme !== "All"
        ? { theme }
        : {}, // ✅ EMPTY OBJECT, NOT undefined
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      dream: {
        select: {
          user: { select: { username: true } },
        },
      },
    },
  });

  return feed.map((item) => ({
    id: item.id,
    anonymizedText: item.anonymizedText,
    theme: item.theme,
    mood: item.mood,
    tags: item.tags,
    createdAt: item.createdAt,
    username: item.dream.user.username,
  }));
}

// 🔐 Share a dream to community (opt-in, idempotent)
export async function shareDreamToCommunity(
  prisma: PrismaClient,
  userId: string,
  dreamId: string
) {
  // 1. Verify dream ownership
  const dream = await prisma.dream.findFirst({
    where: {
      id: dreamId,
      userId,
    },
  });

  if (!dream) {
    throw new Error("Dream not found or access denied");
  }

  // 2. Check if already shared (IDEMPOTENT FIX)
  const existing = await prisma.communityDream.findFirst({
    where: {
      originalDreamId: dream.id,
    },
  });
  

  if (existing) {
    return existing; // ✅ return instead of error
  }

  // 3. Anonymize content
  const anonymizedText =
    dream.content.length > 240
      ? dream.content.slice(0, 240) + "…"
      : dream.content;

  // 4. Create community entry
  return prisma.communityDream.create({
    data: {
      originalDreamId: dream.id,
      anonymizedText,
      theme: dream.mood ?? "General",
      mood: dream.mood,
      tags: dream.tags,
    },
  });
}

// 🔁 Unshare a dream from community (owner-only, idempotent)
export async function unshareDreamFromCommunity(
  prisma: PrismaClient,
  userId: string,
  dreamId: string
) {
  const dream = await prisma.dream.findFirst({
    where: {
      id: dreamId,
      userId,
    },
  });

  if (!dream) {
    throw new Error("Dream not found or access denied");
  }

  const existing = await prisma.communityDream.findFirst({
    where: {
      originalDreamId: dream.id,
    },
  });

  if (!existing) {
    return { ok: true };
  }

  await prisma.communityDream.delete({
    where: { id: existing.id },
  });

  return { ok: true };
}
