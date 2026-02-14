import "dotenv/config";
import { buildApp } from "./app.js";

async function start() {
  const app = await buildApp();

  // Railway provides PORT automatically
  const port = Number(process.env.PORT) || 8080;

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
