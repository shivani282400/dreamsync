import dotenv from "dotenv";
dotenv.config();

console.log("DB:", process.env.DATABASE_URL);

import { buildApp } from "./app";

async function start() {
  const PORT = process.env.PORT || 4000;

  const app = await buildApp();

  try {
    await app.listen({
      port: Number(PORT),
      host: "0.0.0.0",
    });
    console.log(`Server is running on 0.0.0.0:${PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
