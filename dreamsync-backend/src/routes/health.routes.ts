import { FastifyInstance } from "fastify";

export async function healthRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return {
      status: "ok",
      service: "dreamsync-backend",
      timestamp: new Date().toISOString(),
    };
  });

  app.get("/health", async () => {
    return {
      status: "ok",
      service: "dreamsync-backend",
      timestamp: new Date().toISOString(),
    };
  });
}
