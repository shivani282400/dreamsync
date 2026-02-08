import { PrismaClient } from "@prisma/client";

export async function seedDreams(prisma: PrismaClient) {
  const users = await prisma.user.findMany();

  for (const user of users) {
    const existing = await prisma.dream.findFirst({
      where: { userId: user.id },
    });

    if (existing) continue;

    await prisma.dream.createMany({
      data: [
        {
          userId: user.id,
          content:
            "I was walking through a foggy forest just before sunrise. Everything felt quiet but meaningful.",
          mood: "Calm",
          tags: ["fog", "transition"],
        },
        {
          userId: user.id,
          content:
            "I kept missing a train that everyone else boarded easily. I wasn’t anxious, just observant.",
          mood: "Reflective",
          tags: ["delay", "observation"],
        },
      ],
    });
  }

  console.log("🌙 Dreams seeded (idempotent)");
}
