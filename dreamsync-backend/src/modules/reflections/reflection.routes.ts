import { FastifyInstance } from "fastify";
import {
  createDreamReflectionController,
  deleteDreamReflectionController,
  getDreamReflectionsController,
  reflectionController,
  updateDreamReflectionController,
} from "./reflection.controller.js"
import { requireAuth } from "../auth/auth.middleware.js"

export async function reflectionRoutes(app: FastifyInstance) {
  app.post(
    "/reflections",
    { preHandler: requireAuth as any },
    createDreamReflectionController as any
  );

  app.get(
    "/dreams/:id/reflections",
    { preHandler: requireAuth as any },
    getDreamReflectionsController as any
  );

  app.put(
    "/reflections/:id",
    { preHandler: requireAuth as any },
    updateDreamReflectionController as any
  );

  app.delete(
    "/reflections/:id",
    { preHandler: requireAuth as any },
    deleteDreamReflectionController as any
  );

  app.get(
    "/reflections/monthly",
    { preHandler: requireAuth as any },
    reflectionController as any
  );
}
