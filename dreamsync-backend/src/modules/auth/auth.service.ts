import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { generateAnonymousUsername } from "../../utils/anonymousUsername";

export type RegisterInput = {
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export async function registerUser(prisma: PrismaClient, input: RegisterInput) {
  const hashedPassword = await bcrypt.hash(input.password, 10);

  try {
    let username = generateAnonymousUsername();
    for (let i = 0; i < 5; i += 1) {
      const existing = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (!existing) break;
      username = generateAnonymousUsername();
    }

    const stillExists = await prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (stillExists) {
      username = `${username}_${Math.floor(Math.random() * 900 + 100)}`;
    }

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        username,
      },
    });

    return {
      userId: user.id, // ✅ STANDARDIZED
      email: user.email,
      username: user.username,
    };
  } catch (err: unknown) {
    const prismaErr = err as { code?: string };
    if (prismaErr.code === "P2002") {
      throw new Error("Email already registered");
    }
    throw err;
  }
}

export async function loginUser(prisma: PrismaClient, input: LoginInput) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isValid = await bcrypt.compare(input.password, user.password);

  if (!isValid) {
    throw new Error("Invalid credentials");
  }

  let username = user.username;
  if (!username) {
    username = generateAnonymousUsername();
    for (let i = 0; i < 5; i += 1) {
      const exists = await prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });
      if (!exists) break;
      username = generateAnonymousUsername();
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { username },
    });
  }

  return {
    userId: user.id, // ✅ STANDARDIZED
    email: user.email,
    username,
  };
}
