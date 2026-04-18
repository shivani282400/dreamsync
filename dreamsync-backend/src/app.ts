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
import { healthRoutes } from "./routes/health.routes";

export async function buildApp() {
  const app = Fastify({ logger: true });

  // -------- CORS (FIRST) --------
  await app.register(cors, {
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
      const isLocal = origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1");
      const isRender = origin.includes(".onrender.com");

      if (isLocal || isRender || allowedOrigins.includes(origin) || origin.includes(".vercel.app")) {
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

  // -------- MONITORING --------
  app.addHook("onRequest", (request, reply, done) => {
    (request as any).startTime = Date.now();
    done();
  });

  app.addHook("onResponse", (request, reply, done) => {
    const start = (request as any).startTime;
    if (start) {
      const duration = Date.now() - start;
      if (duration > 1000) {
        request.log.warn(
          `[PERF] ${request.method} ${request.url} took ${duration}ms`
        );
      }
    }
    done();
  });

  // -------- ROUTES --------
  // Health should be registered first for Railway checks.
  app.register(healthRoutes);
  app.register(authRoutes, { prefix: "/auth" });
  app.register(interpretationRoutes, { prefix: "/api" });
  app.register(dreamsRoutes, { prefix: "/dreams" });
  app.register(statsRoutes);
  app.register(reflectionRoutes);
  app.register(insightsRoutes);
  app.register(yearlyArcRoutes);
  app.register(dreamChaptersRoutes);
  app.register(communityRoutes);
  app.register(userRoutes);

  return app;
}
