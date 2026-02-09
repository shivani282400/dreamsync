import "dotenv/config";
import { buildApp } from "./app.js";

async function start() {
  const app = await buildApp();

  const port = Number(process.env.PORT) || 3000;

  app.listen({ port, host: "0.0.0.0" }, (err, address) => {
    if (err) {
      app.log.error(err);
      process.exit(1);
    }
    app.log.info(`Server running at ${address}`);
  });
}

start();
