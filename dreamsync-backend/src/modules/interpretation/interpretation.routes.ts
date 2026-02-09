import { FastifyInstance } from "fastify";
import {
  interpretDreamController,
  getInterpretationController,
} from "./interpretation.controller.js"
import { requireAuth } from "../auth/auth.middleware.js"

export async function interpretationRoutes(app: FastifyInstance) {
  app.post(
    "/interpretations/:dreamId",
    { preHandler: requireAuth as any },
    interpretDreamController as any
  );

  app.get(
    "/interpretations/:dreamId",
    { preHandler: requireAuth as any },
    getInterpretationController as any
  );
}
