import { FastifyInstance } from "fastify";
import {
  getCommunityFeed,
  toggleDreamLike,
  createDreamComment,
  shareDreamToCommunity,
  unshareDreamFromCommunity,
} from "./community.service"
import {
  communityFeedQuerySchema,
  shareCommunityParamsSchema,
} from "./community.schema"
import { requireAuth } from "../auth/auth.middleware"
import { verifyToken } from "../auth/auth.jwt"

function getUserId(req: any): string | undefined {
  return req.user?.userId ?? req.user?.id ?? req.user?.sub;
}

function getOptionalUserId(req: any): string | undefined {
  const authHeader = req.headers.authorization;
  if (!authHeader) return undefined;

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return undefined;

  try {
    const payload = verifyToken(token) as any;
    return payload?.userId ?? payload?.id ?? payload?.sub;
  } catch {
    return undefined;
  }
}

export async function communityRoutes(fastify: FastifyInstance) {
  // 🔍 Read community feed (public)
  fastify.get("/community/feed", async (req) => {
    const query = communityFeedQuerySchema.parse(req.query);
    const userId = getOptionalUserId(req);
    return getCommunityFeed(fastify.prisma, query.theme, userId);
  });

  // 🔍 Explore feed alias for clients that use /explore.
  fastify.get("/explore", async (req) => {
    const query = communityFeedQuerySchema.parse(req.query);
    const userId = getOptionalUserId(req);
    return getCommunityFeed(fastify.prisma, query.theme, userId);
  });

  // ❤️ Toggle like on a shared dream.
  fastify.post(
    "/dream/:id/like",
    {
      preHandler: requireAuth as any,
    },
    async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const userId = getUserId(req);

        if (!userId) {
          return reply.status(401).send({ message: "Unauthorized" });
        }

        return toggleDreamLike(fastify.prisma, userId, id);
      } catch (err: any) {
        if (err?.message === "Dream not found") {
          return reply.status(404).send({ message: err.message });
        }

        req.log.error(
          { error: err?.message, stack: err?.stack },
          "Failed to toggle dream like"
        );
        return reply
          .status(500)
          .send({ error: "Failed to toggle dream like", details: err?.message });
      }
    }
  );

  // 💬 Add a comment to a shared dream.
  fastify.post(
    "/dream/:id/comment",
    {
      preHandler: requireAuth as any,
    },
    async (req, reply) => {
      try {
        const { id } = req.params as { id: string };
        const userId = getUserId(req);
        const body = req.body as { content?: string } | undefined;

        if (!userId) {
          return reply.status(401).send({ message: "Unauthorized" });
        }

        if (!body?.content?.trim()) {
          return reply.status(400).send({ message: "Comment content required" });
        }

        return createDreamComment(
          fastify.prisma,
          userId,
          id,
          body.content
        );
      } catch (err: any) {
        if (err?.message === "Dream not found") {
          return reply.status(404).send({ message: err.message });
        }
        if (err?.message === "Comment content required") {
          return reply.status(400).send({ message: err.message });
        }

        req.log.error(
          { error: err?.message, stack: err?.stack },
          "Failed to create dream comment"
        );
        return reply
          .status(500)
          .send({ error: "Failed to create dream comment", details: err?.message });
      }
    }
  );

  // 🔐 Share dream to community (opt-in)
  fastify.post(
    "/community/share/:dreamId",
    {
      preHandler: requireAuth as any,
    },
    async (req, reply) => {
      const { dreamId } = shareCommunityParamsSchema.parse(req.params);
      const userId = getUserId(req);

      if (!userId) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      return shareDreamToCommunity(
        fastify.prisma,
        userId,
        dreamId
      );
    }
  );

  // 🔁 Unshare a dream (owner-only)
  fastify.delete(
    "/community/unshare/:dreamId",
    {
      preHandler: requireAuth as any,
    },
    async (req, reply) => {
      const { dreamId } = shareCommunityParamsSchema.parse(req.params);
      const userId = getUserId(req);

      if (!userId) {
        return reply.status(401).send({ message: "Unauthorized" });
      }

      return unshareDreamFromCommunity(
        fastify.prisma,
        userId,
        dreamId
      );
    }
  );
}
