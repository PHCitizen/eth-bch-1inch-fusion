import { PrismaClient } from "../generated/prisma";
import { createEventEmitter } from "./events";

export type Env = {
  Bindings: {};
  Variables: {
    prisma: PrismaClient;
    events: ReturnType<typeof createEventEmitter>;
  };
};
