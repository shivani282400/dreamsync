import { PrismaClient } from "@prisma/client";

export async function seedCommunity(prisma: PrismaClient) {
  const dream = await prisma.dream.findFirst({
    include: { user: true },
  });

  if (!dream) return;

  const exists = await prisma.communityDream.findFirst({
    where: { originalDreamId: dream.id },
  });

  if (exists) return;

  await prisma.communityDream.create({
    data: {
      originalDreamId: dream.id,
      anonymizedText:
        "I was walking through a foggy forest, sensing quiet guidance without knowing the destination.",
      theme: "Transition",
      mood: dream.mood,
      tags: dream.tags,
    },
  });

  console.log("🌍 Community dream seeded (idempotent)");
}
