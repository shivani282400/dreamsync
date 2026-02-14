import Fastify from "fastify";
import cors from "@fastify/cors";
import prismaPlugin from "./plugins/prisma.js";

import { interpretationRoutes } from "./modules/interpretation/interpretation.routes.js";
import { authRoutes } from "./modules/auth/auth.routes.js";
import { insightsRoutes } from "./modules/insights/insights.routes.js";
import { reflectionRoutes } from "./modules/reflections/reflection.routes.js";
import { dreamsRoutes } from "./modules/dreams/dreams.routes.js";
import { statsRoutes } from "./modules/stats/stats.routes.js";
import { communityRoutes } from "./modules/community/community.routes.js";
import { yearlyArcRoutes } from "./modules/insights/yearlyArc.routes.js";
import { dreamChaptersRoutes } from "./modules/insights/dreamChapters.routes.js";
import { userRoutes } from "./modules/user/user.routes.js";
import { healthRoutes } from "./routes/health.routes.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // -------- CORS (FIRST) --------
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);

      if (
        origin.startsWith("http://localhost") ||
        origin.startsWith("http://127.0.0.1") ||
        origin.includes(".vercel.app")
      ) {
        return cb(null, true);
      }

      cb(new Error("Not allowed by CORS"), false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  // -------- PRISMA --------
  await app.register(prismaPlugin);

  // -------- ROUTES --------
  // Health should be registered first for Railway checks.
  app.register(healthRoutes);
  app.register(authRoutes, { prefix: "/auth" });
  app.register(interpretationRoutes, { prefix: "/api" });
  app.register(dreamsRoutes);
  app.register(statsRoutes);
  app.register(reflectionRoutes);
  app.register(insightsRoutes);
  app.register(yearlyArcRoutes);
  app.register(dreamChaptersRoutes);
  app.register(communityRoutes);
  app.register(userRoutes);

  return app;
}
