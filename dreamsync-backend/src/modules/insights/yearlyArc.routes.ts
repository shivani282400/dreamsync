import { FastifyInstance } from "fastify";
import { requireAuth } from "../auth/auth.middleware.js"
import { getYearlyArc } from "./yearlyArc.service.js"

export async function yearlyArcRoutes(app: FastifyInstance) {
  app.get(
    "/insights/yearly",
    { preHandler: requireAuth as any },
    async (request, reply) => {
      const user = (request as any).user;
      if (!user?.id) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      const yearParam = (request.query as { year?: string }).year;
      const year = yearParam ? Number(yearParam) : new Date().getFullYear();

      if (!Number.isFinite(year) || year < 1970) {
        return reply.status(400).send({ message: "Invalid year" });
      }

      const content = await getYearlyArc(
        request.server.prisma,
        user.id,
        year
      );

      return reply.send(content);
    }
  );
}
