import { FastifyInstance } from "fastify";
import {
  getMyDreamsController,
  getDreamController,
  createDreamController,
} from "./dreams.controller.js"
import { requireAuth } from "../auth/auth.middleware.js"

export async function dreamsRoutes(app: FastifyInstance) {
  app.get("/me", { preHandler: requireAuth }, getMyDreamsController);
  app.get("/:id", { preHandler: requireAuth }, getDreamController);
  app.post("/", { preHandler: requireAuth }, createDreamController);
}
