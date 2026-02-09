import { FastifyRequest, FastifyReply } from "fastify";
import { generateMonthlyReflection } from "./reflection.service.js"
import { rewriteReflectionPoetically } from "./reflection.poetic.service.js"

/**
 * GET /reflections/monthly?period=YYYY-MM
 * Phase 5.1 + 5.2 — Monthly insight letter (deterministic → poetic)
 */
export async function reflectionController(
  request: FastifyRequest<{ Querystring: { period?: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user?.id) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const period = request.query.period;
  if (!period) {
    return reply.status(400).send({
      message: "period is required (YYYY-MM)",
    });
  }

  // Phase 5.1 — deterministic monthly reflection
  const reflection = await generateMonthlyReflection(
    request.server.prisma,
    user.id,
    period
  );

  // Phase 5.2 — poetic rewrite (safe + optional)
  const poetic = await rewriteReflectionPoetically(reflection);

  return reply.send(poetic);
}

/**
 * POST /reflections
 * Save a user-written reflection answer for a dream
 */
export async function createDreamReflectionController(
  request: FastifyRequest<{
    Body: {
      dreamId?: string;
      question?: string;
      answer?: string;
    };
  }>,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user?.id) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const { dreamId, question, answer } = request.body || {};

  if (!dreamId || !question || !answer) {
    return reply.status(400).send({
      message: "dreamId, question, and answer are required",
    });
  }

  // 🔒 Verify dream ownership
  const dream = await request.server.prisma.dream.findFirst({
    where: {
      id: dreamId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!dream) {
    return reply.status(404).send({ message: "Dream not found" });
  }

  // ✅ Correct Prisma call
  const reflection = await request.server.prisma.dreamReflection.create({
    data: {
      dreamId: dream.id,
      question,
      answer,
    },
  });

  return reply.send(reflection);
}

/**
 * GET /dreams/:id/reflections
 * Fetch reflections for a dream
 */
export async function getDreamReflectionsController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user?.id) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const dreamId = request.params.id;

  // 🔒 Verify dream ownership
  const dream = await request.server.prisma.dream.findFirst({
    where: {
      id: dreamId,
      userId: user.id,
    },
    select: { id: true },
  });

  if (!dream) {
    return reply.status(404).send({ message: "Dream not found" });
  }

  const reflections = await request.server.prisma.dreamReflection.findMany({
    where: { dreamId: dream.id },
    orderBy: { createdAt: "asc" },
  });

  return reply.send(reflections);
}

/**
 * PUT /reflections/:id
 * Update a user reflection answer
 */
export async function updateDreamReflectionController(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { answer?: string };
  }>,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user?.id) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const reflectionId = request.params.id;
  const { answer } = request.body || {};

  if (!answer || !answer.trim()) {
    return reply.status(400).send({ message: "answer is required" });
  }

  const reflection = await request.server.prisma.dreamReflection.findFirst({
    where: {
      id: reflectionId,
      dream: { userId: user.id },
    },
  });

  if (!reflection) {
    return reply.status(404).send({ message: "Reflection not found" });
  }

  const updated = await request.server.prisma.dreamReflection.update({
    where: { id: reflectionId },
    data: { answer },
  });

  return reply.send(updated);
}

/**
 * DELETE /reflections/:id
 * Remove a user reflection answer
 */
export async function deleteDreamReflectionController(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = (request as any).user;

  if (!user?.id) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const reflectionId = request.params.id;

  const reflection = await request.server.prisma.dreamReflection.findFirst({
    where: {
      id: reflectionId,
      dream: { userId: user.id },
    },
  });

  if (!reflection) {
    return reply.status(404).send({ message: "Reflection not found" });
  }

  await request.server.prisma.dreamReflection.delete({
    where: { id: reflectionId },
  });

  return reply.send({ ok: true });
}
