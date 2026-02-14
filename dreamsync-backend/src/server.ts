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

  const missing: string[] = [];
  if (!hasDatabaseUrl) missing.push("DATABASE_URL");
  if (!hasJwtSecret) missing.push("JWT_SECRET");
  if (!hasGeminiKey) missing.push("GEMINI_API_KEY");

  if (missing.length > 0) {
    const message = `Missing required env vars: ${missing.join(", ")}`;
    if (process.env.NODE_ENV === "production") {
      console.error(message);
    } else {
      throw new Error(message);
    }
  }

  if (hasDatabaseUrl && !/\b-pooler\./.test(process.env.DATABASE_URL || "")) {
    console.warn(
      "DATABASE_URL does not appear to be a Neon pooler connection (-pooler.*)."
    );
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
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
}

start();
