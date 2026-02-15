import { PrismaClient } from "@prisma/client";
import { randomBytes } from "node:crypto";

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

export async function findDreamByShareId(
  prisma: PrismaClient,
  shareId: string
) {
  const rows = await prisma.$queryRawUnsafe<
    Array<{
      id: string;
      title: string | null;
      content: string;
      mood: string | null;
      tags: string[];
      createdAt: Date;
      interpretationContent: unknown;
    }>
  >(
    `
      SELECT
        d."id",
        d."title",
        d."content",
        d."mood",
        d."tags",
        d."createdAt",
        i."content" AS "interpretationContent"
      FROM "Dream" d
      LEFT JOIN "Interpretation" i ON i."dreamId" = d."id"
      WHERE d."shareId" = $1
      LIMIT 1
    `,
    shareId
  );

  const row = rows[0];
  if (!row) return null;

  return {
    dream: {
      id: row.id,
      title: row.title,
      content: row.content,
      mood: row.mood,
      tags: row.tags,
      createdAt: row.createdAt,
    },
    interpretation: row.interpretationContent ?? null,
  };
}

export async function createOrGetShareId(
  prisma: PrismaClient,
  dreamId: string,
  userId: string
) {
  const dreams = await prisma.$queryRawUnsafe<
    Array<{ id: string; shareId: string | null }>
  >(
    `
      SELECT "id", "shareId"
      FROM "Dream"
      WHERE "id" = $1 AND "userId" = $2
      LIMIT 1
    `,
    dreamId,
    userId
  );
  const dream = dreams[0];

  if (!dream) {
    throw new Error("Dream not found or access denied");
  }

  if (dream.shareId) {
    return dream.shareId;
  }

  // Generate a short URL-safe token and retry on unique collisions.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate = randomBytes(9).toString("base64url");

    const updatedCount = await prisma.$executeRawUnsafe(
      `
        UPDATE "Dream"
        SET "shareId" = $1
        WHERE "id" = $2 AND "userId" = $3 AND "shareId" IS NULL
      `,
      candidate,
      dream.id,
      userId
    );

    if (updatedCount > 0) {
      return candidate;
    }

    const currentRows = await prisma.$queryRawUnsafe<
      Array<{ shareId: string | null }>
    >(
      `
        SELECT "shareId"
        FROM "Dream"
        WHERE "id" = $1 AND "userId" = $2
        LIMIT 1
      `,
      dream.id,
      userId
    );
    const currentShareId = currentRows[0]?.shareId;
    if (currentShareId) {
      return currentShareId;
    }
  }

  throw new Error("Unable to generate a unique share token");
}
