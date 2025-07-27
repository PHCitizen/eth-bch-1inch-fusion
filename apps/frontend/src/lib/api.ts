import { hc } from "hono/client";

import type { HonoRouteType } from "api";

export const api = hc<HonoRouteType>(
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
);
