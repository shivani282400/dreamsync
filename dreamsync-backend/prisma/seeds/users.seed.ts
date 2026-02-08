import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const DEMO_USERS = [
  { email: "demo@dreamsync.app", password: "password123" },
  { email: "calm.user@dreamsync.app", password: "password123" },
  { email: "reflective.user@dreamsync.app", password: "password123" },
];

export async function seedUsers(prisma: PrismaClient) {
  for (const user of DEMO_USERS) {
    const hashed = await bcrypt.hash(user.password, 10);

    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        email: user.email,
        password: hashed,
      },
    });
  }

  console.log("👤 Demo users seeded (idempotent)");
}
