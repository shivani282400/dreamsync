import { FastifyRequest, FastifyReply } from "fastify";
import * as DreamService from "./dreams.service"

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

    // Use the Fastify-decorated shared Prisma client.
    const dreams = await DreamService.getUserDreams(request.server.prisma, userId);
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

    // Use the Fastify-decorated shared Prisma client.
    const dream = await DreamService.getDreamById(request.server.prisma, id, userId);

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

    // Use the Fastify-decorated shared Prisma client.
    const dream = await DreamService.createDream(request.server.prisma, {
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

// GET /share/:shareId
export async function getSharedDreamController(
  request: FastifyRequest<{ Params: { shareId: string } }>,
  reply: FastifyReply
) {
  try {
    const { shareId } = request.params;

    const shared = await DreamService.findDreamByShareId(
      request.server.prisma,
      shareId
    );

    if (!shared) {
      return reply.status(404).send({ message: "Shared dream not found" });
    }

    return reply.send(shared);
  } catch (err: any) {
    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Failed to fetch shared dream"
    );
    return reply
      .status(500)
      .send({ error: "Failed to fetch shared dream", details: err?.message });
  }
}

// POST /dreams/:id/share
export async function createDreamShareController(
  request: FastifyRequest<{ Params: { id: string } }>,
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

    const { id } = request.params;
    const shareId = await DreamService.createOrGetShareId(
      request.server.prisma,
      id,
      userId
    );

    const host = request.headers.host;
    const origin = host ? `${request.protocol}://${host}` : "";
    // Public link for clients to copy/share.
    const shareUrl = `${origin}/dreams/share/${shareId}`;

    return reply.send({ shareId, shareUrl });
  } catch (err: any) {
    if (err?.message === "Dream not found or access denied") {
      return reply.status(404).send({ message: err.message });
    }

    request.log.error(
      { error: err?.message, stack: err?.stack },
      "Failed to create dream share"
    );
    return reply
      .status(500)
      .send({ error: "Failed to create dream share", details: err?.message });
  }
}
