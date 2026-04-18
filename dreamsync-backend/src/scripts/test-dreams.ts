import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function run() {
  const users = await prisma.user.findMany({ include: { dreams: true } });
  console.log(JSON.stringify(users.map(u => ({ email: u.email, dreams: u.dreams.length })), null, 2));
}
run();
