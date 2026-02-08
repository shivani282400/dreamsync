import { FastifyInstance } from "fastify";
import { requireAuth } from "../auth/auth.middleware";
import { generateAnonymousUsername } from "../../utils/anonymousUsername";

function isValidUsername(value: string) {
  return /^[A-Za-z0-9_]{3,20}$/.test(value);
}

export async function userRoutes(app: FastifyInstance) {
  app.get(
    "/user/me",
    { preHandler: requireAuth as any },
    async (request, reply) => {
      const user = (request as any).user;
      if (!user?.id) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const record = await request.server.prisma.user.findUnique({
        where: { id: user.id },
        select: { id: true, username: true, usernameLocked: true },
      });

      if (!record) {
        return reply.status(404).send({ message: "User not found" });
      }

      return reply.send(record);
    }
  );

  app.put(
    "/user/username",
    { preHandler: requireAuth as any },
    async (request, reply) => {
      const user = (request as any).user;
      if (!user?.id) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const { username } = request.body as { username?: string };
      if (!username || !isValidUsername(username)) {
        return reply.status(400).send({ message: "Invalid username" });
      }

      const current = await request.server.prisma.user.findUnique({
        where: { id: user.id },
        select: { usernameLocked: true },
      });

      if (current?.usernameLocked) {
        return reply.status(403).send({ message: "Username is locked" });
      }

      const existing = await request.server.prisma.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (existing && existing.id !== user.id) {
        return reply.status(409).send({ message: "Username already taken" });
      }

      const updated = await request.server.prisma.user.update({
        where: { id: user.id },
        data: { username },
        select: { id: true, username: true, usernameLocked: true },
      });

      return reply.send(updated);
    }
  );

  app.post(
    "/user/username/regenerate",
    { preHandler: requireAuth as any },
    async (request, reply) => {
      const user = (request as any).user;
      if (!user?.id) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const current = await request.server.prisma.user.findUnique({
        where: { id: user.id },
        select: { usernameLocked: true },
      });

      if (current?.usernameLocked) {
        return reply.status(403).send({ message: "Username is locked" });
      }

      let username = generateAnonymousUsername();
      for (let i = 0; i < 5; i += 1) {
        const existing = await request.server.prisma.user.findUnique({
          where: { username },
          select: { id: true },
        });
        if (!existing) break;
        username = generateAnonymousUsername();
      }

      const updated = await request.server.prisma.user.update({
        where: { id: user.id },
        data: { username },
        select: { id: true, username: true, usernameLocked: true },
      });

      return reply.send(updated);
    }
  );

  app.post(
    "/user/username/lock",
    { preHandler: requireAuth as any },
    async (request, reply) => {
      const user = (request as any).user;
      if (!user?.id) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const updated = await request.server.prisma.user.update({
        where: { id: user.id },
        data: { usernameLocked: true },
        select: { id: true, username: true, usernameLocked: true },
      });

      return reply.send(updated);
    }
  );
}
