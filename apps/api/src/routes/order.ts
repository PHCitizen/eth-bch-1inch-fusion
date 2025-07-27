import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { OrderSchema } from "../schema";
import { Env } from "../utils";

export const orderApp = () =>
  new Hono<Env>()
    .get("/", async (c) => {
      const orders = await c.var.prisma.order.findMany({
        omit: { id: true },
      });
      return c.json(orders);
    })
    .post("/create", zValidator("json", OrderSchema), async (c) => {
      const data = c.req.valid("json");

      const orderId = await c.var.prisma.order.create({
        data: {
          ...data,
          srcTimelock: { create: data.srcTimelock },
          dstTimelock: { create: data.dstTimelock },
        },
      });

      c.var.events.emit("Order", { orderId: orderId.uuid });
      return c.json({ success: true });
    });
