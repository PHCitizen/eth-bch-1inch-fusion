import type { SupportedChain } from "@1inch/cross-chain-sdk";
import { CashAddressNetworkPrefix } from "@bitauth/libauth";

export const BCH_CHAIN_ID = 137 as SupportedChain;
export const BCH_ADDR_PREFIX: `${CashAddressNetworkPrefix}` = "bitcoincash";
