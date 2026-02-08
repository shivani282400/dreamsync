import { z } from "zod";

export const communityFeedQuerySchema = z.object({
  theme: z.string().optional(),
});

export const shareCommunityParamsSchema = z.object({
  dreamId: z.string().uuid(),
});
