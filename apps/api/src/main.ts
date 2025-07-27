import { Hono } from "hono";
import { logger } from "hono/logger";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { zValidator } from "@hono/zod-validator";
import z from "zod";

import { PrismaClient } from "../generated/prisma";
import { OrderSchema } from "./schema";
import { createEventEmitter } from "./events";

const prisma = new PrismaClient();

async function main() {
  const app = new Hono();
  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

  const events = createEventEmitter();

  app
    .use(logger())
    .post("/order/create", zValidator("json", OrderSchema), async (c) => {
      const data = c.req.valid("json");
      // randomId used to exclude receiving own order
      const sender = c.req.header("X-ID") || null;

      const orderId = await prisma.order.create({
        data: {
          ...data,
          srcTimelock: { create: data.srcTimelock },
          dstTimelock: { create: data.dstTimelock },
        },
      });

      events.emit("Order", { sender, orderId: orderId.uuid });
      return c.json({ success: true });
    })
    .get(
      "/ws",
      upgradeWebSocket((c) => {
        let id: string | null = null;

        return {
          onOpen: (_, ws) => {
            events.addListener("Order", (data) => {
              if (!id || data.sender === id) return;

              ws.send(JSON.stringify({ orderId: data.orderId }));
            });
          },
          onMessage(event, ws) {
            if (!id) {
              const schema = z.object({ id: z.string() });
              const result = schema.safeParse(event.data);
              if (result.success) {
                id = result.data.id;
              }
            }

            ws.send("Pong");
          },
          onClose: () => {
            console.log("Connection closed");
          },
        };
      })
    );

  const server = serve({ port: 3001, fetch: app.fetch });
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
