import { createApp } from "./app";
import { PORT } from "./config/env";
import { prisma } from "./lib/prisma";
import type { Server } from "http";

async function main() {
  await prisma.$connect();
  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });

  setupGracefulShutdown(server);
}

function setupGracefulShutdown(server: Server) {
  let shuttingDown = false;
  const shutdown = async (signal: NodeJS.Signals) => {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`Received ${signal}, shutting down gracefully...`);

    server.close(async () => {
      try {
        await prisma.$disconnect();
      } finally {
        process.exit(0);
      }
    });

    // Safety timeout to avoid hanging forever in container/platform shutdown.
    setTimeout(() => {
      console.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10_000).unref();
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
