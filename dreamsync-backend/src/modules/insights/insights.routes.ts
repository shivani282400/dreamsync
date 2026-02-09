import { FastifyInstance } from "fastify";
import { requireAuth } from "../auth/auth.middleware.js"
import {
  monthlyInsightsController,
  weeklyInsightsController,
} from "./insights.controller.js"

export async function insightsRoutes(app: FastifyInstance) {
  app.get(
    "/insights/weekly",
    { preHandler: requireAuth as any },
    weeklyInsightsController as any
  );

  app.get(
    "/insights/monthly",
    { preHandler: requireAuth as any },
    monthlyInsightsController as any
  );
}
