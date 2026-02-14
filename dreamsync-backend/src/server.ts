import "dotenv/config";
import { buildApp } from "./app.js";

async function start() {
  const portRaw = process.env.PORT?.trim();
  const port =
    portRaw && !Number.isNaN(Number(portRaw))
      ? Number(portRaw)
      : 3000; // local fallback

  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasJwtSecret = Boolean(process.env.JWT_SECRET?.trim());

  console.log(`[startup] PORT=${port}`);
  console.log(
    `[startup] GEMINI_API_KEY=${hasGeminiKey ? "present" : "missing"}`
  );
  console.log(`[startup] DATABASE_URL=${hasDatabaseUrl ? "present" : "missing"}`);
  console.log(`[startup] JWT_SECRET=${hasJwtSecret ? "present" : "missing"}`);

  if (!hasDatabaseUrl) {
    throw new Error("DATABASE_URL not configured");
  }

  if (!hasJwtSecret) {
    throw new Error("JWT_SECRET not configured");
  }

  const app = await buildApp();

  try {
    await app.listen({
      port,
      host: "0.0.0.0",
    });

    console.log(`Server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
