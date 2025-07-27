import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { zValidator } from "@hono/zod-validator";

import { PrismaClient } from "../generated/prisma";
import { OrderSchema } from "./schema";
import { createEventEmitter } from "./events";
import { fusionApp } from "./fusion";

const prisma = new PrismaClient();

async function main() {
  const app = new Hono();
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

  const events = createEventEmitter();

  app
    .use(logger())
    .use(cors())
    .route("/fusion-plus", fusionApp())
    .post("/order/create", zValidator("json", OrderSchema), async (c) => {
      const data = c.req.valid("json");

      const orderId = await prisma.order.create({
        data: {
          ...data,
          srcTimelock: { create: data.srcTimelock },
          dstTimelock: { create: data.dstTimelock },
        },
      });

      events.emit("Order", { orderId: orderId.uuid });
      return c.json({ success: true });
    })
    .get("/order", async (c) => {
      const orders = await prisma.order.findMany({
        omit: { id: true },
      });
      return c.json(orders);
    })
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
