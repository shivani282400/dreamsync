import { FastifyReply, FastifyRequest } from "fastify";
import {
  getMonthlyInsightSnapshot,
  getWeeklyInsightSnapshot,
} from "./insights.service.js"

export async function weeklyInsightsController(
  request: FastifyRequest<{ Querystring: { week?: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user?.id) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const week = request.query.week;
  if (!week) {
    return reply.status(400).send({ message: "week is required (YYYY-Www)" });
  }

  try {
    const content = await getWeeklyInsightSnapshot(
      request.server.prisma,
      user.id,
      week
    );
    return reply.send(content);
  } catch (err: any) {
    return reply.status(400).send({ message: err.message || "Invalid week" });
  }
}

export async function monthlyInsightsController(
  request: FastifyRequest<{ Querystring: { month?: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user?.id) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const month = request.query.month;
  if (!month) {
    return reply.status(400).send({ message: "month is required (YYYY-MM)" });
  }

  try {
    const content = await getMonthlyInsightSnapshot(
      request.server.prisma,
      user.id,
      month
    );
    return reply.send(content);
  } catch (err: any) {
    return reply.status(400).send({ message: err.message || "Invalid month" });
  }
}
