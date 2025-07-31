// @ts-ignore
import { EvmAddress } from "@1inch/cross-chain-sdk";
import {
  addressContentsToLockingBytecode,
  binToHex,
  CashAddressNetworkPrefix,
  cashAddressToLockingBytecode,
  hexToBin,
  lockingBytecodeToAddressContents,
  lockingBytecodeToCashAddress,
} from "@bitauth/libauth";
import { BCH_ADDR_PREFIX } from "./config";

export const evmAddressToBchPubkHash = (address: EvmAddress) => {
  return hexToBin(address.toHex().slice(-40));
};

export const evmAddressToBch = (
  address: EvmAddress,
  prefix: `${CashAddressNetworkPrefix}` = BCH_ADDR_PREFIX
): string => {
  const pubkhash = evmAddressToBchPubkHash(address);
  const lock = addressContentsToLockingBytecode({
    payload: pubkhash,
    type: "P2PKH",
  });

  const addressBch = lockingBytecodeToCashAddress({ bytecode: lock, prefix });
  if (typeof addressBch === "string") {
    throw new Error(`Invalid address: ${addressBch}`);
  }

  return addressBch.address;
};

export const bchAddressToEvm = (address: string): EvmAddress => {
  const lock = cashAddressToLockingBytecode(address);
  if (typeof lock === "string") {
    throw new Error(`Invalid BCH address: ${lock}`);
  }

  const contents = lockingBytecodeToAddressContents(lock.bytecode);
  if (contents.type !== "P2PKH") {
    throw new Error(`Unsupported BCH address type: ${contents.type}`);
  }

  return EvmAddress.fromString("0x" + binToHex(contents.payload));
};
