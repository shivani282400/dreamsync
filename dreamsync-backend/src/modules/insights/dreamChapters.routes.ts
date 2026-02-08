import { FastifyInstance } from "fastify";
import { requireAuth } from "../auth/auth.middleware";
import { getDreamChapters } from "./dreamChapters.service";

export async function dreamChaptersRoutes(app: FastifyInstance) {
  app.get(
    "/insights/chapters",
    { preHandler: requireAuth as any },
    async (request, reply) => {
      const user = (request as any).user;
      if (!user?.id) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const chapters = await getDreamChapters(
        request.server.prisma,
        user.id
      );

      return reply.send(chapters);
    }
  );
}
