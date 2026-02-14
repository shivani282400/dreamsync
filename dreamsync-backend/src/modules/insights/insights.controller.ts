import { FastifyReply, FastifyRequest } from "fastify";
import {
  getMonthlyInsightSnapshot,
  getWeeklyInsightSnapshot,
} from "./insights.service.js"

export async function weeklyInsightsController(
  request: FastifyRequest<{ Querystring: { week?: string } }>,
  reply: FastifyReply
) {
  try {
    const user = (request as any).user;

    if (!user?.id) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const week = request.query.week;
    if (!week) {
      return reply.status(400).send({ message: "week is required (YYYY-Www)" });
    }

    const content = await getWeeklyInsightSnapshot(
      request.server.prisma,
      user.id,
      week
    );
    return reply.send(content);
  } catch (err: any) {
    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Failed to fetch weekly insights"
    );
    return reply.status(500).send({
      error: "Failed to fetch weekly insights",
      details: err?.message ?? "Unknown error",
    });
  }
}

export async function monthlyInsightsController(
  request: FastifyRequest<{ Querystring: { month?: string } }>,
  reply: FastifyReply
) {
  try {
    const user = (request as any).user;

    if (!user?.id) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const month = request.query.month;
    if (!month) {
      return reply.status(400).send({ message: "month is required (YYYY-MM)" });
    }

    const content = await getMonthlyInsightSnapshot(
      request.server.prisma,
      user.id,
      month
    );
    return reply.send(content);
  } catch (err: any) {
    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Failed to fetch monthly insights"
    );
    return reply.status(500).send({
      error: "Failed to fetch monthly insights",
      details: err?.message ?? "Unknown error",
    });
  }
}
