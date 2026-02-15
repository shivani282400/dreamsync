import { FastifyRequest, FastifyReply } from "fastify";
import { generateInterpretation } from "./interpretation.service.js";

/**
 * POST /interpretations/:dreamId
 */
export async function interpretDreamController(
  request: FastifyRequest<{ Params: { dreamId: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const user = (request as any).user as
      | { id?: string; userId?: string; sub?: string }
      | undefined;

    const { dreamId } = request.params;
    const userId = user?.userId ?? user?.id ?? user?.sub;

    if (!userId) {
      reply.status(401).send({ message: "Unauthorized" });
      return;
    }

    const result = await generateInterpretation(request.server.prisma, {
      userId,
      dreamId,
    });

    reply.status(200).send(result);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));

    request.log.error(
      {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      "Interpretation generation failed"
    );

    reply.status(500).send({
      error: "Interpretation generation failed",
      details: error.message,
    });
  }
}

/**
 * GET /interpretations/:dreamId
 */
export async function getInterpretationController(
  request: FastifyRequest<{ Params: { dreamId: string } }>,
  reply: FastifyReply
): Promise<void> {
  try {
    const user = (request as any).user as
      | { id?: string; userId?: string; sub?: string }
      | undefined;

    const { dreamId } = request.params;
    const userId = user?.userId ?? user?.id ?? user?.sub;

    if (!userId) {
      reply.status(401).send({ message: "Unauthorized" });
      return;
    }

    const interpretation =
      await request.server.prisma.interpretation.findFirst({
        where: {
          dreamId,
          dream: { userId },
        },
      });

    if (!interpretation) {
      reply.status(404).send({ message: "Interpretation not found" });
      return;
    }

    reply.status(200).send(interpretation.content);
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));

    request.log.error(
      {
        message: error.message,
        stack: error.stack,
      },
      "Failed to fetch interpretation"
    );

    reply.status(500).send({
      error: "Failed to fetch interpretation",
      details: error.message,
    });
  }
}
