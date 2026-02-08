import { PrismaClient } from "@prisma/client";

export async function seedInsights(prisma: PrismaClient) {
  const users = await prisma.user.findMany();

  for (const user of users) {
    await prisma.insightSnapshot.upsert({
      where: {
        userId_period_type: {
          userId: user.id,
          period: "2026-01",
          type: "MONTHLY",
        },
      },
      update: {},
      create: {
        userId: user.id,
        period: "2026-01",
        type: "MONTHLY",
        content: {
          title: "A month of quiet awareness",
          summary:
            "Your dreams reflected moments of pause, observation, and subtle change.",
          dominantThemes: ["transition", "self-observation"],
          emotionalArc: "From uncertainty to grounded calm",
          keyQuestionsYouExplored: [
            "What am I moving toward?",
            "Where can I slow down?",
          ],
          closingNote:
            "Not all growth announces itself. Some simply unfolds.",
        },
      },
    });
  }

  console.log("📨 Insights seeded (idempotent)");
}
