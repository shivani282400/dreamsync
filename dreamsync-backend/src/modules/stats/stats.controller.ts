import { FastifyRequest, FastifyReply } from "fastify";
import {
  getCalendarStats,
  getFrequencyStats,
  getTagTrends,
  getWordFrequency,
} from "./stats.service.js"
import { getEmotionalTrends } from "./emotionalTrends.service.js"
import { getDreamClusters } from "./dreamClusters.service.js"

// Phase 4.1
export async function frequencyStatsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;
  if (!user?.id) {
    reply.status(401).send({ message: "Unauthorized" });
    return;
  }

  const stats = await getFrequencyStats(request.server.prisma, user.id);
  reply.send(stats);
}

// Phase 4.2
export async function emotionalTrendsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;
  if (!user?.id) {
    reply.status(401).send({ message: "Unauthorized" });
    return;
  }

  const trends = await getEmotionalTrends(request.server.prisma, user.id);
  reply.send(trends);
}

// Phase 4.3
export async function dreamClustersController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const user = (request as any).user;
  if (!user?.id) {
    reply.status(401).send({ message: "Unauthorized" });
    return;
  }

  const clusters = await getDreamClusters(request.server.prisma, user.id);
  reply.send(clusters);
}

export async function calendarStatsController(
  request: FastifyRequest<{ Querystring: { month?: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user;
  if (!user?.id) {
    reply.status(401).send({ message: "Unauthorized" });
    return;
  }

  const month = request.query.month;
  if (!month) {
    reply.status(400).send({ message: "month is required (YYYY-MM)" });
    return;
  }

  try {
    const data = await getCalendarStats(request.server.prisma, user.id, month);
    reply.send(data);
  } catch (err: any) {
    reply.status(400).send({ message: err.message || "Invalid month" });
  }
}

export async function wordFrequencyController(
  request: FastifyRequest<{ Querystring: { week?: string; month?: string; limit?: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user;
  if (!user?.id) {
    reply.status(401).send({ message: "Unauthorized" });
    return;
  }

  const { week, month, limit } = request.query;
  if (!week && !month) {
    reply
      .status(400)
      .send({ message: "week or month is required (YYYY-Www or YYYY-MM)" });
    return;
  }

  try {
    const data = await getWordFrequency(request.server.prisma, user.id, {
      week,
      month,
      limit: limit ? Number(limit) : undefined,
    });
    reply.send(data);
  } catch (err: any) {
    reply.status(400).send({ message: err.message || "Invalid range" });
  }
}

export async function tagTrendsController(
  request: FastifyRequest<{ Querystring: { week?: string; month?: string; limit?: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user;
  if (!user?.id) {
    reply.status(401).send({ message: "Unauthorized" });
    return;
  }

  const { week, month, limit } = request.query;
  if (!week && !month) {
    reply
      .status(400)
      .send({ message: "week or month is required (YYYY-Www or YYYY-MM)" });
    return;
  }

  try {
    const data = await getTagTrends(request.server.prisma, user.id, {
      week,
      month,
      limit: limit ? Number(limit) : undefined,
    });
    reply.send(data);
  } catch (err: any) {
    reply.status(400).send({ message: err.message || "Invalid range" });
  }
}
