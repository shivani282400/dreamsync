import { FastifyInstance } from "fastify";
import { registerController, loginController } from "./auth.controller.js"

export async function authRoutes(app: FastifyInstance) {
  app.post("/register", registerController);
  app.post("/login", loginController);
}
