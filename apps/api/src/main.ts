import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { PrismaClient } from "../generated/prisma";

import { createEventEmitter } from "./events";
import { Env } from "./utils";
import { fusionApp, orderApp } from "./routes";

const prisma = new PrismaClient();

async function main() {
  const app = new Hono<Env>();
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

  const events = createEventEmitter();

  app
    .use(logger())
    .use(cors())
    .use("*", async (c, next) => {
      c.set("prisma", prisma);
      c.set("events", events);
      await next();
    })
    .route("/fusion-plus", fusionApp())
    .route("/order", orderApp())
    .get(
      "/ws",
      upgradeWebSocket((c) => {
        return {
          onOpen: (_, ws) => {
            events.addListener("Order", (data) => {
              const output = JSON.stringify({
                event: "Order",
                orderId: data.orderId,
              });
              ws.send(output);
            });
          },
          onMessage(_, ws) {
            ws.send("Pong");
          },
          onClose: () => {
            console.log("Connection closed");
          },
        };
      })
    );

  const server = serve({ port: 3001, fetch: app.fetch }, (e) => {
    console.log(`Running on PORT ${e.port}`);
  });
  injectWebSocket(server);
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
