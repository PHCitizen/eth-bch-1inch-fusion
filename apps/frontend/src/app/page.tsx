"use client";
import { formatUnits, parseUnits, Wallet } from "ethers";
import { useState } from "react";
import { SupportedChains } from "@1inch/cross-chain-sdk";
import { ArrowUpDown } from "lucide-react";

import { api, bchSdk } from "@/lib";
import { Chains } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger } from "@/components/ui/select";

type Token = {
  chain: Chains;
  tokenId: string;
  decimals: number;
  symbol: string;
  amount: bigint;
};

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

  const [sellToken, setSellToken] = useState<Token>({
    amount: 0n,
    chain: "BitcoinCash",
    decimals: 8,
    symbol: "BCH",
    tokenId: "0",
  });
  const [buyToken, setBuyToken] = useState<Token>({
    amount: 0n,
    chain: "Eth",
    decimals: 18,
    symbol: "ETH",
    tokenId: "0",
  });

  const quoteToken = (token1: Token, token2: Token, input: bigint) => {
    // TODO: fix ratio 1bch/2eth
    const multiplier = token1.chain === "BitcoinCash" ? 2 : 1 / 2;

    return [
      { ...token1, amount: input },
      {
        ...token2,
        amount: parseUnits(
          String(Number(formatUnits(input, token1.decimals)) * multiplier),
          token2.decimals
        ),
      },
    ];
  };

  const handleSellAmountChange = (value: string) => {
    const [newSellToken, newBuyToken] = quoteToken(
      sellToken,
      buyToken,
      parseUnits(value, sellToken.decimals)
    );
    setSellToken(newSellToken);
    setBuyToken(newBuyToken);
  };

  const handleSwitch = () => {
    if (!buyToken) return;

    const [newSellToken, newBuyToken] = quoteToken(
      buyToken,
      sellToken,
      parseUnits(
        formatUnits(sellToken.amount, sellToken.decimals),
        buyToken.decimals
      )
    );

    setSellToken(newSellToken);
    setBuyToken(newBuyToken);
  };

  const handleSwap = async () => {};

  const sellAmountFmt = formatUnits(sellToken.amount, sellToken.decimals);
  const buyAmountFmt = formatUnits(buyToken.amount, buyToken.decimals);

  return (
    <div className="flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6 space-y-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Swap</h1>
          </div>

          {/* Sell Section */}
          <div className="space-y-2">
            <Label
              htmlFor="sell-amount"
              className="text-gray-300 text-sm font-medium"
            >
              Sell
            </Label>
            <div className="relative">
              <div className=" rounded-xl p-4 border ">
                <div className="flex items-center justify-between mb-2">
                  <Input
                    id="sell-amount"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={sellAmountFmt}
                    onChange={(e) => handleSellAmountChange(e.target.value)}
                    className="px-2 bg-transparent border-none text-2xl font-semibold text-white placeholder-gray-500 h-auto focus-visible:ring-0"
                  />
                  <Select
                    value={sellToken?.tokenId}
                    onValueChange={(value) => {
                      setSellToken((c) => ({ ...c, tokenId: value }));
                    }}
                  >
                    <SelectTrigger className="w-auto bg-gray-600 border-gray-500 text-white hover:bg-gray-500">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-full  flex items-center justify-center text-white text-xs font-bold`}
                        ></div>
                        <span className="font-medium">{sellToken.symbol}</span>
                      </div>
                    </SelectTrigger>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="flex justify-center">
            <Button
              onClick={handleSwitch}
              variant="ghost"
              size="icon"
              className="rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 border border-gray-600"
              disabled={!buyToken}
            >
              <ArrowUpDown className="w-4 h-4" />
            </Button>
          </div>

          {/* Buy Section */}
          <div className="space-y-2">
            <Label
              htmlFor="buy-amount"
              className="text-gray-300 text-sm font-medium"
            >
              Buy
            </Label>
            <div className="relative">
              <div className="rounded-xl p-4 border ">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-2xl font-semibold text-white">
                    {buyAmountFmt}
                  </div>
                  <Select
                    value={buyToken?.tokenId || ""}
                    onValueChange={(value) => {}}
                  >
                    <SelectTrigger className="w-auto  text-white">
                      {buyToken ? (
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold`}
                          ></div>
                          <span className="font-medium">{buyToken.symbol}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>Select token</span>
                        </div>
                      )}
                    </SelectTrigger>
                    {/* <SelectContent className="bg-gray-700 border-gray-600">
                      {cryptocurrencies
                        .filter((crypto) => crypto.id !== sellToken.id)
                        .map((crypto) => (
                          <SelectItem
                            key={crypto.id}
                            value={crypto.id}
                            className="text-white hover:bg-gray-600"
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-6 h-6 rounded-full ${crypto.color} flex items-center justify-center text-white text-xs font-bold`}
                              >
                                {crypto.icon}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {crypto.symbol}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {crypto.name}
                                </div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent> */}
                  </Select>
                </div>
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <Button className="w-full font-semibold py-3 rounded-xl">Swap</Button>
        </CardContent>
      </Card>
    </div>
  );
}
