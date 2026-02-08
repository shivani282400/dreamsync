import Fastify from "fastify";
import cors from "@fastify/cors";
import prismaPlugin from "./plugins/prisma";

import { interpretationRoutes } from "./modules/interpretation/interpretation.routes";
import { authRoutes } from "./modules/auth/auth.routes";
import { insightsRoutes } from "./modules/insights/insights.routes";
import { reflectionRoutes } from "./modules/reflections/reflection.routes";
import { dreamsRoutes } from "./modules/dreams/dreams.routes";
import { statsRoutes } from "./modules/stats/stats.routes";
import { communityRoutes } from "./modules/community/community.routes";
import { yearlyArcRoutes } from "./modules/insights/yearlyArc.routes";
import { dreamChaptersRoutes } from "./modules/insights/dreamChapters.routes";
import { userRoutes } from "./modules/user/user.routes";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // -------- CORS --------
  await app.register(cors, {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  });

  // -------- PRISMA --------
  await app.register(prismaPlugin);

  // -------- ROUTES --------
  app.register(authRoutes, { prefix: "/auth" });
  app.register(interpretationRoutes, { prefix: "/api" });
  app.register(dreamsRoutes);
  app.register(statsRoutes);
  app.register(reflectionRoutes);
  app.register(insightsRoutes);
  app.register(yearlyArcRoutes);
  app.register(dreamChaptersRoutes);
  app.register(userRoutes);
  app.register(communityRoutes);

  return app;
}
