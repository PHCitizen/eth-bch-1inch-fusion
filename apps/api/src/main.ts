import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { PrismaClient } from "../generated/prisma";

import { createEventEmitter } from "./events";
import { Env } from "./utils";
import { fusionApp, orderApp, wsApp } from "./routes";

const prisma = new PrismaClient();

async function main() {
  const events = createEventEmitter();
  const { injectWebSocket, app: wsAppRoute } = wsApp();

  const app = new Hono<Env>()
    .use(logger())
    .use(cors())
    .use("*", async (c, next) => {
      c.set("prisma", prisma);
      c.set("events", events);
      await next();
    })
    .route("/fusion-plus", fusionApp())
    .route("/order", orderApp())
    .route("/ws", wsAppRoute);

  const server = serve({ port: 3001, fetch: app.fetch }, (e) => {
    console.log(`Running on PORT ${e.port}`);
  });
  injectWebSocket(server);

  return app;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

export type HonoRouteType = Awaited<ReturnType<typeof main>>;
