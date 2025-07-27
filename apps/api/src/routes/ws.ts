import { Context, Hono } from "hono";
import { createNodeWebSocket } from "@hono/node-ws";
import { Env } from "../utils";
import { BlankInput } from "hono/types";

export const wsApp = () => {
  const app = new Hono<Env>();

  const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app });

  app.get(
    "/",
    upgradeWebSocket((c: Context<Env, "/ws", BlankInput>) => {
      return {
        onOpen: (_, ws) => {
          c.var.events.addListener("Order", (data) => {
            const output = JSON.stringify({
              event: "Order",
              orderId: data.orderId,
            });
            ws.send(output);
          });
        },
        onMessage() {},
        onClose: () => console.log("Connection closed"),
      };
    })
  );

  return { app, injectWebSocket };
};
