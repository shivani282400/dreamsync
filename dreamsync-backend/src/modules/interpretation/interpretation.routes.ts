import { FastifyInstance } from "fastify";
import {
  interpretDreamController,
  getInterpretationController,
} from "./interpretation.controller";
import { requireAuth } from "../auth/auth.middleware";

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
