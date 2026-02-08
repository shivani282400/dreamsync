import { PrismaClient } from "@prisma/client";

export async function getUserDreams(
  prisma: PrismaClient,
  userId: string
) {
  return prisma.dream.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      interpretation: true,
      reflections: { select: { id: true } },
    },
  });
}

export async function getDreamById(
  prisma: PrismaClient,
  dreamId: string,
  userId: string
) {
  return prisma.dream.findFirst({
    where: { id: dreamId, userId },
    include: {
      interpretation: true,
      reflections: { select: { id: true } },
    },
  });
}

export async function createDream(prisma: PrismaClient, data: {
  userId: string;
  title?: string | null;
  content: string;
  mood?: string | null;
  tags?: string[];
}) {
  return prisma.dream.create({
    data: {
      userId: data.userId,
      title: data.title ?? null,
      content: data.content,
      mood: data.mood ?? null,
      tags: data.tags ?? [],
    },
    include: {
      interpretation: true,
      reflections: { select: { id: true } },
    },
  });
}
