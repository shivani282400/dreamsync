import { FastifyInstance } from "fastify";
import {
  getMyDreamsController,
  getDreamController,
  createDreamController,
} from "./dreams.controller.js"
import { requireAuth } from "../auth/auth.middleware.js"

export async function dreamsRoutes(app: FastifyInstance) {
  app.get("/dreams/me", { preHandler: requireAuth }, getMyDreamsController);
  app.get("/dreams/:id", { preHandler: requireAuth }, getDreamController);

  app.post("/dreams", { preHandler: requireAuth }, createDreamController);
}
