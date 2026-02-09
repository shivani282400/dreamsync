import { FastifyInstance } from "fastify";
import {
  frequencyStatsController,
  emotionalTrendsController,
  dreamClustersController,
  calendarStatsController,
  wordFrequencyController,
  tagTrendsController,
} from "./stats.controller.js"
import { requireAuth } from "../auth/auth.middleware.js"

export async function statsRoutes(app: FastifyInstance) {
  // Phase 4.1
  app.get(
    "/stats/frequency",
    { preHandler: requireAuth },
    frequencyStatsController
  );

  // Phase 4.2
  app.get(
    "/stats/emotional-trends",
    { preHandler: requireAuth },
    emotionalTrendsController
  );

  // Phase 4.3
  app.get(
    "/stats/dream-clusters",
    { preHandler: requireAuth },
    dreamClustersController
  );

  app.get(
    "/stats/calendar",
    { preHandler: requireAuth as any },
    calendarStatsController as any
  );

  app.get(
    "/stats/word-frequency",
    { preHandler: requireAuth as any },
    wordFrequencyController as any
  );

  app.get(
    "/stats/tag-trends",
    { preHandler: requireAuth as any },
    tagTrendsController as any
  );
}
