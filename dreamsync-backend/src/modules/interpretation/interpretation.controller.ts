import { FastifyRequest, FastifyReply } from "fastify";
import { generateInterpretation } from "./interpretation.service.js";

export async function interpretDreamController(
  request: FastifyRequest<{ Params: { dreamId: string } }>,
  reply: FastifyReply
) {
  try {
    const user = (request as any).user as
      | { id?: string; userId?: string; sub?: string }
      | undefined;

    const { dreamId } = request.params;
    const userId = user?.userId ?? user?.id ?? user?.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const result = await generateInterpretation(request.server.prisma, {
      userId,
      dreamId,
    });

    return reply.status(200).send(result);
  } catch (err: any) {
    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Interpretation generation failed"
    );

    return reply.status(500).send({
      error: "Interpretation generation failed",
      details: err?.message ?? "Unknown error",
    });
  }
}

export async function getInterpretationController(
  request: FastifyRequest<{ Params: { dreamId: string } }>,
  reply: FastifyReply
) {
  try {
    const user = (request as any).user as
      | { id?: string; userId?: string; sub?: string }
      | undefined;

    const { dreamId } = request.params;
    const userId = user?.userId ?? user?.id ?? user?.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const interpretation = await request.server.prisma.interpretation.findFirst({
      where: {
        dreamId,
        dream: { userId },
      },
    });

    if (!interpretation) {
      return reply.status(404).send({ message: "Interpretation not found" });
    }

    return reply.status(200).send(interpretation.content);
  } catch (err: any) {
    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Failed to fetch interpretation"
    );
    return reply.status(500).send({
      error: "Failed to fetch interpretation",
      details: err?.message ?? "Unknown error",
    });
  }
}
