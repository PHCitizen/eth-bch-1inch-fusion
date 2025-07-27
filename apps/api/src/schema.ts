import { z } from "zod";

export const MAX_BYTES_4 = 2 ** (4 * 8);
export const hexStringSchema = z.string().regex(/^([0-9A-Fa-f]{2})*$/);

export const ChainSchema = z.enum(["BitcoinCash", "Eth"]);

export const SrcTimelockSchema = z.object({
  finalityLock: z.int().min(0).max(MAX_BYTES_4),
  resolverUnlock: z.int().min(0).max(MAX_BYTES_4),
  publicUnlock: z.int().min(0).max(MAX_BYTES_4),
  resolverCancel: z.int().min(0).max(MAX_BYTES_4),
  publicCancel: z.int().min(0).max(MAX_BYTES_4),
});

export const DstTimelockSchema = z.object({
  finalityLock: z.int().min(0).max(MAX_BYTES_4),
  resolverUnlock: z.int().min(0).max(MAX_BYTES_4),
  publicUnlock: z.int().min(0).max(MAX_BYTES_4),
  resolverCancel: z.int().min(0).max(MAX_BYTES_4),
});

export const OrderSchema = z.object({
  srcChain: ChainSchema,
  srcTimelock: SrcTimelockSchema,

  dstChain: ChainSchema,
  dstTimelock: DstTimelockSchema,

  makerAsset: z.string(),
  takerAsset: z.string(),
  makerAddr: z.string(),
  takerAddr: z.string(),
  makingAmount: z.bigint(),
  takingAmount: z.bigint(),

  hashLock: hexStringSchema.min(32).max(32),
});
