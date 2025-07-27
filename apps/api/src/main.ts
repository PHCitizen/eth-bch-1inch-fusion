import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { logger } from "hono/logger";

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.create({
    data: {
      email: Math.random() + "test@example.com",
      name: "Test User",
    },
  });

  const routes = new Hono().use(logger()).get("/users", async (c) => {
    const users = await prisma.user.findMany();
    return c.json(users);
  });

  serve({ port: 3001, fetch: routes.fetch });
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
