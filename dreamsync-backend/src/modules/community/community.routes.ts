import { FastifyInstance } from "fastify";
import {
  getCommunityFeed,
  shareDreamToCommunity,
  unshareDreamFromCommunity,
} from "./community.service";
import {
  communityFeedQuerySchema,
  shareCommunityParamsSchema,
} from "./community.schema";
import { requireAuth } from "../auth/auth.middleware";

export async function communityRoutes(fastify: FastifyInstance) {
  // 🔍 Read community feed (public)
  fastify.get("/community/feed", async (req) => {
    const query = communityFeedQuerySchema.parse(req.query);
    return getCommunityFeed(fastify.prisma, query.theme);
  });

  // 🔐 Share dream to community (opt-in)
  fastify.post(
    "/community/share/:dreamId",
    {
      preHandler: requireAuth as any,
    },
    async (req) => {
      const { dreamId } = shareCommunityParamsSchema.parse(req.params);
      const userId = (req as any).user.id;

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
    async (req) => {
      const { dreamId } = shareCommunityParamsSchema.parse(req.params);
      const userId = (req as any).user.id;

      return unshareDreamFromCommunity(
        fastify.prisma,
        userId,
        dreamId
      );
    }
  );
}
