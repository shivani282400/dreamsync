import { FastifyInstance } from "fastify";
import {
  getMyDreamsController,
  getDreamController,
  createDreamController,
  getSharedDreamController,
  createDreamShareController,
} from "./dreams.controller"
import { requireAuth } from "../auth/auth.middleware"

export async function dreamsRoutes(app: FastifyInstance) {
  app.get<{ Params: { shareId: string } }>("/share/:shareId", getSharedDreamController);
  app.get("/me", { preHandler: requireAuth }, getMyDreamsController);
  app.get("/:id", { preHandler: requireAuth }, getDreamController);
  app.post<{ Params: { id: string } }>(
    "/:id/share",
    { preHandler: requireAuth },
    createDreamShareController
  );
  app.post("/", { preHandler: requireAuth }, createDreamController);
}
