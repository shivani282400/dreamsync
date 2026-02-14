import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../plugins/prisma.js"
import * as DreamService from "./dreams.service.js"

// GET /dreams/me
export async function getMyDreamsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user as
      | { id?: string; userId?: string; sub?: string }
      | undefined;
    const userId = user?.userId ?? user?.id ?? user?.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const dreams = await DreamService.getUserDreams(prisma, userId);
    return reply.send({
      dreams,
      meta: { count: dreams.length },
    });
  } catch (err: any) {
    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Failed to fetch dreams"
    );
    return reply
      .status(500)
      .send({ error: "Failed to fetch dreams", details: err?.message });
  }
}

// GET /dreams/:id
export async function getDreamController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user as
      | { id?: string; userId?: string; sub?: string }
      | undefined;

    const userId = user?.userId ?? user?.id ?? user?.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const { id } = request.params as { id: string };

    const dream = await DreamService.getDreamById(prisma, id, userId);

    if (!dream) {
      return reply.status(404).send({ message: "Dream not found" });
    }

    return reply.send({ dream });
  } catch (err: any) {
    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Failed to fetch dream"
    );
    return reply
      .status(500)
      .send({ error: "Failed to fetch dream", details: err?.message });
  }
}


// POST /dreams
export async function createDreamController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const user = request.user as
      | { id?: string; userId?: string; sub?: string }
      | undefined;

    const userId = user?.userId ?? user?.id ?? user?.sub;

    if (!userId) {
      return reply.status(401).send({ message: "Unauthorized" });
    }

    const body = request.body as {
      title?: string;
      content: string;
      mood?: string;
      tags?: string[];
    };

    if (!body?.content) {
      return reply.status(400).send({ message: "Content required" });
    }

    const dream = await DreamService.createDream(prisma, {
      userId,
      ...body,
    });

    return reply.status(201).send(dream);
  } catch (err: any) {
    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Failed to create dream"
    );
    return reply
      .status(500)
      .send({ error: "Failed to create dream", details: err?.message });
  }
}
