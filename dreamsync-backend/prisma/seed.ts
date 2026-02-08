import { PrismaClient } from "@prisma/client";
import { seedUsers } from "./seeds/users.seed.js";
import { seedDreams } from "./seeds/dreams.seed.js";
import { seedCommunity } from "./seeds/community.seed.js";
import { seedInsights } from "./seeds/insights.seed.js";


const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding DreamSync database...");

  await seedUsers(prisma);
  await seedDreams(prisma);
  await seedCommunity(prisma);
  await seedInsights(prisma);

  console.log("✅ Seeding complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
