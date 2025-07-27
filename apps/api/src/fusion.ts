import { zValidator } from "@hono/zod-validator";
import axios from "axios";
import { Hono } from "hono";
import z from "zod";

const authAxios = axios.create({
  baseURL: "https://api.1inch.dev/fusion-plus",
  headers: {
    Authorization: "Bearer " + process.env.FUSION_API_KEY,
  },
});

export const fusionApp = () =>
  new Hono().get(
    "/quoter/:version/quote/receive/",
    zValidator(
      "query",
      z.object({
        srcChain: z.coerce.number(),
        dstChain: z.coerce.number(),
        srcTokenAddress: z.string(),
        dstTokenAddress: z.string(),
        amount: z.coerce.bigint(),
        walletAddress: z.string(),
      })
    ),
    async (c) => {
      try {
        const params = c.req.valid("query");
        const resp = await authAxios.get("/quoter/v1.0/quote/receive/", {
          params,
        });
        return c.json(resp.data);
      } catch (e: any) {
        return c.json(e.response.data);
      }
    }
  );
