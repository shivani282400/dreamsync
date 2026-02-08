import { PrismaClient } from "@prisma/client";
import { generateAnonymousUsername } from "../utils/anonymousUsername";

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    where: { username: null },
    select: { id: true },
  });

  console.log(`Found ${users.length} users without username`);

  for (const user of users) {
    let username = generateAnonymousUsername();

    // ensure uniqueness
    while (
      await prisma.user.findUnique({ where: { username } })
    ) {
      username = generateAnonymousUsername();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });

    console.log(`✔ assigned ${username}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
