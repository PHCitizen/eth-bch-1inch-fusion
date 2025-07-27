"use client";
import { parseUnits, Wallet } from "ethers";

import { bchSdk } from "@/lib";
import { Button } from "@/components/ui/button";
import { SupportedChains } from "@1inch/cross-chain-sdk";

export default function Home() {
  const quote = async () => {
    const params = {
      srcChainId: SupportedChains[0],
      dstChainId: SupportedChains[2],
      srcTokenAddress: "0xdac17f958d2ee523a2206206994597c13d831ec7",
      dstTokenAddress: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d",
      amount: parseUnits("10", 6).toString(),
      walletAddress: Wallet.createRandom().address,
      source: "sdk-test",
    };

    const quote = await bchSdk.getQuote(params);
  };

  return (
    <div className="text-red-500">
      Hello World
      <Button onClick={quote}>Fetch</Button>
    </div>
  );
}
