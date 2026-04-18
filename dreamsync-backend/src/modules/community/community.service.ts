import { PrismaClient } from "@prisma/client";

function mapCommunityDream(item: Awaited<ReturnType<typeof getCommunityDreamsQuery>>[number], userId?: string) {
  const comments = item.dream.comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    username: comment.user.username ?? "Anonymous dreamer",
  }));

  return {
    id: item.id,
    dreamId: item.originalDreamId,
    content: item.anonymizedText,
    anonymizedText: item.anonymizedText,
    theme: item.theme,
    mood: item.mood,
    tags: item.tags,
    createdAt: item.createdAt,
    username: item.dream.user.username ?? "Anonymous dreamer",
    likesCount: item.dream._count.likes,
    commentsCount: item.dream._count.comments,
    isLiked: Boolean(userId && item.dream.likes.length > 0),
    comments,
  };
}

function getCommunityDreamsQuery(
  prisma: PrismaClient,
  theme?: string,
  userId?: string
) {
  return prisma.communityDream.findMany({
    where: theme && theme !== "All" ? { theme } : {},
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      dream: {
        select: {
          user: { select: { username: true } },
          likes: {
            where: userId ? { userId } : { id: "__no_user__" },
            select: { id: true },
            take: 1,
          },
          comments: {
            orderBy: { createdAt: "asc" },
            take: 20,
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: { select: { username: true } },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      },
    },
  });
}

// 🔍 Read community feed
export async function getCommunityFeed(
  prisma: PrismaClient,
  theme?: string,
  userId?: string
) {
  const feed = await getCommunityDreamsQuery(prisma, theme, userId);
  return feed.map((item) => mapCommunityDream(item, userId));
}

export async function toggleDreamLike(
  prisma: PrismaClient,
  userId: string,
  dreamId: string
) {
  const dream = await prisma.dream.findUnique({
    where: { id: dreamId },
    include: { communityShare: true },
  });

  if (!dream || !dream.communityShare) {
    throw new Error("Dream not found");
  }

  const existing = await prisma.like.findUnique({
    where: {
      userId_dreamId: {
        userId,
        dreamId,
      },
    },
  });

  let isLiked = false;

  if (existing) {
    await prisma.like.delete({ where: { id: existing.id } });
  } else {
    await prisma.like.create({
      data: {
        userId,
        dreamId,
      },
    });
    isLiked = true;
  }

  const [likesCount, commentsCount] = await Promise.all([
    prisma.like.count({ where: { dreamId } }),
    prisma.comment.count({ where: { dreamId } }),
  ]);

  return {
    dreamId,
    isLiked,
    likesCount,
    commentsCount,
  };
}

export async function createDreamComment(
  prisma: PrismaClient,
  userId: string,
  dreamId: string,
  content: string
) {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("Comment content required");
  }

  const dream = await prisma.dream.findUnique({
    where: { id: dreamId },
    include: { communityShare: true },
  });

  if (!dream || !dream.communityShare) {
    throw new Error("Dream not found");
  }

  const comment = await prisma.comment.create({
    data: {
      content: trimmed,
      userId,
      dreamId,
    },
    select: {
      id: true,
      content: true,
      createdAt: true,
      user: { select: { username: true } },
    },
  });

  const [likesCount, commentsCount] = await Promise.all([
    prisma.like.count({ where: { dreamId } }),
    prisma.comment.count({ where: { dreamId } }),
  ]);

  return {
    dreamId,
    likesCount,
    commentsCount,
    comment: {
      id: comment.id,
      content: comment.content,
      createdAt: comment.createdAt,
      username: comment.user.username ?? "Anonymous dreamer",
    },
  };
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
