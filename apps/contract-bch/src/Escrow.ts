import Sdk, { EvmAddress } from "@1inch/cross-chain-sdk";
import {
  Contract,
  NetworkProvider,
  TransactionBuilder as TXBuilder,
  Utxo,
} from "cashscript";
import { TransactionBuilderOptions } from "cashscript/dist/TransactionBuilder.js";
import { binToHex, decodeTransactionBch, hexToBin } from "@bitauth/libauth";

import EscrowSrcAbi from "../artifacts/EscrowSrc.artifact.js";
import EscrowDstAbi from "../artifacts/EscrowDst.artifact.js";

import { Wallet } from "./Wallet.js";
import { evmAddressToBch, evmAddressToBchPubkHash } from "./Address";
import { assert, bytecodeToScript, isValidContract } from "./utils.js";

class TransactionBuilder extends TXBuilder {
  constructor(params: TransactionBuilderOptions) {
    super(params);
    this.setMaxFee(50_000n);
  }
}

export class BchEscrowContract {
  constructor(
    private provider: NetworkProvider,
    private order: Sdk.EvmCrossChainOrder,
    private immutables: Sdk.Immutables<EvmAddress>,
    private tokenCategory: string
  ) {}

  calcSrcContract() {
    const timelock = this.immutables.timeLocks.toSrcTimeLocks();
    return new Contract(
      EscrowSrcAbi,
      [
        timelock.publicWithdrawal,
        timelock.privateCancellation,
        timelock.publicCancellation,
        this.order.makingAmount,
        this.tokenCategory,
        this.order.srcSafetyDeposit,
        this.order.hashLock.toString(),
        evmAddressToBchPubkHash(this.immutables.taker),
        evmAddressToBchPubkHash(this.order.maker),
      ],
      { provider: this.provider }
    );
  }

  calcDstContract() {
    const timelock = this.immutables.timeLocks.toDstTimeLocks();
    return new Contract(
      EscrowDstAbi,
      [
        timelock.publicWithdrawal,
        timelock.privateCancellation,
        this.immutables.amount,
        this.tokenCategory,
        this.order.dstSafetyDeposit,
        this.order.hashLock.toString(),
        evmAddressToBchPubkHash(this.immutables.taker),
        evmAddressToBchPubkHash(this.order.maker),
      ],
      { provider: this.provider }
    );
  }

  deploySrc(safetyDepositUtxo: Utxo, signer: Wallet) {
    const { srcSafetyDeposit } = this.order.escrowExtension;
    const contract = this.calcSrcContract();

    return new TransactionBuilder({ provider: this.provider })
      .addInput(safetyDepositUtxo, signer.unlockP2PKH())
      .addOutput({
        to: contract.address,
        amount: srcSafetyDeposit,
      })
      .addOutput({
        to: signer.address,
        amount: safetyDepositUtxo.satoshis - srcSafetyDeposit - 1000n,
      });
  }

  private validateDstFunding(broadcastedTx: string) {
    const { order, immutables, tokenCategory } = this;
    const timelock = immutables.timeLocks.toSrcTimeLocks();

    const tx = decodeTransactionBch(hexToBin(broadcastedTx));
    assert(typeof tx !== "string", `Invalid transaction: ${tx}`);

    const unlockingBytecode = bytecodeToScript(tx.inputs[0].unlockingBytecode);
    assert(unlockingBytecode.length === 2, "Must be funding function");
    assert(typeof unlockingBytecode[0] !== "number", "");
    assert(unlockingBytecode[0].length === 0, "Must be funding function");
    const contract = unlockingBytecode[1] as Uint8Array;

    assert(
      isValidContract(EscrowDstAbi, contract, [
        timelock.publicWithdrawal,
        timelock.privateCancellation,
        immutables.amount,
        tokenCategory,
        order.dstSafetyDeposit,
        order.hashLock.toString(),
        null,
        binToHex(evmAddressToBchPubkHash(order.maker)),
      ]),
      "Invalid broadcasted contract"
    );
  }

  private validateSrcFunding(broadcastedTx: string) {
    const { order, immutables, tokenCategory } = this;
    const timelock = immutables.timeLocks.toSrcTimeLocks();

    const tx = decodeTransactionBch(hexToBin(broadcastedTx));
    assert(typeof tx !== "string", `Invalid transaction: ${tx}`);

    const unlockingBytecode = bytecodeToScript(tx.inputs[0].unlockingBytecode);
    assert(unlockingBytecode.length === 2, "Must be funding function");
    assert(typeof unlockingBytecode[0] !== "number", "");
    assert(unlockingBytecode[0].length === 0, "Must be funding function");
    const contract = unlockingBytecode[1] as Uint8Array;

    assert(
      isValidContract(EscrowSrcAbi, contract, [
        timelock.publicWithdrawal,
        timelock.privateCancellation,
        timelock.publicCancellation,
        order.makingAmount,
        tokenCategory,
        order.srcSafetyDeposit,
        order.hashLock.toString(),
        null,
        binToHex(evmAddressToBchPubkHash(order.maker)),
      ]),
      "Invalid broadcasted contract"
    );
  }

  fundSrcSafetyDeposit(escrowUtxo: Utxo, depositUtxo: Utxo, signer: Wallet) {
    assert(escrowUtxo.token === undefined, "already funded by maker");

    const contract = this.calcSrcContract();
    const safetyDeposit = this.order.srcSafetyDeposit;

    return new TransactionBuilder({ provider: this.provider })
      .addInput(escrowUtxo, contract.unlock.fundSafetyDeposit())
      .addInput(depositUtxo, signer.unlockP2PKH())
      .addOutput({
        to: contract.address,
        amount: safetyDeposit,
      })
      .addOutput({
        to: signer.address,
        amount: depositUtxo.satoshis - safetyDeposit - 1000n,
      });
  }

  fundDstSafetyDepositAndToken(
    escrowUtxo: Utxo,
    depositUtxo: Utxo,
    signer: Wallet
  ) {
    const { tokenCategory, immutables, order } = this;
    const tokenDeposit = immutables.amount;
    const safetyDeposit = order.srcSafetyDeposit;

    assert(escrowUtxo.token === undefined, "already funded");
    assert(depositUtxo.token !== undefined, "no deposit token");
    assert(depositUtxo.token.category === tokenCategory, "Wrong tokens");
    assert(depositUtxo.token.amount === tokenDeposit, "Wrong amount");

    const contract = this.calcSrcContract();

    return new TransactionBuilder({ provider: this.provider })
      .addInput(escrowUtxo, contract.unlock.fundSafetyDeposit())
      .addInput(depositUtxo, signer.unlockP2PKH())
      .addOutput({
        to: contract.address,
        amount: safetyDeposit,
        token: {
          amount: immutables.amount,
          category: tokenCategory,
        },
      })
      .addOutput({
        to: signer.address,
        amount: depositUtxo.satoshis - safetyDeposit - 1000n,
        token: {
          category: this.tokenCategory,
          amount: depositUtxo.token.amount - immutables.amount,
        },
      });
  }

  fundSrcTokens(
    escrowUtxo: Utxo,
    tokenUtxo: Utxo,
    tokenUtxoSigner: Wallet,
    broadcastedTx: string
  ) {
    const deposit = this.order.makingAmount;

    assert(tokenUtxo.token !== undefined, "Must have a token");
    assert(
      tokenUtxo.token.category === this.tokenCategory,
      "tokenCategory not the same"
    );
    assert(tokenUtxo.token.amount >= deposit, "Not enough tokens");

    this.validateSrcFunding(broadcastedTx);

    const contract = this.calcSrcContract();

    return new TransactionBuilder({ provider: this.provider })
      .addInput(escrowUtxo, contract.unlock.lockMakerTokens())
      .addInput(tokenUtxo, tokenUtxoSigner.unlockP2PKH())
      .addOutput({
        to: contract.address,
        amount: escrowUtxo.satoshis,
        token: {
          category: this.tokenCategory,
          amount: deposit,
        },
      })
      .addOutput({
        to: tokenUtxoSigner.tokenAddress,
        amount: tokenUtxo.satoshis - 1000n,
        token: {
          category: tokenUtxo.token.category,
          amount: tokenUtxo.token.amount - deposit,
        },
      });
  }

  deployDst(utxo: Utxo, signer: Wallet) {
    assert(utxo.token === undefined, "Utxo must not have tokens");

    const contract = this.calcDstContract();
    return new TransactionBuilder({ provider: this.provider })
      .addInput(utxo, signer.unlockP2PKH())
      .addOutput({
        to: contract.address,
        amount: 1000n,
      })
      .addOutput({
        to: signer.address,
        amount: utxo.satoshis - 1000n,
      });
  }

  withdrawSrc(
    escrowUtxo: Utxo,
    feeUtxo: Utxo,
    signer: Wallet,
    type: "resolver" | "public",
    secret: string
  ) {
    const { order, immutables, tokenCategory } = this;

    const safetyDeposit = order.srcSafetyDeposit;
    const tokenAmount = this.immutables.amount;

    const contract = this.calcSrcContract();
    const tx = new TransactionBuilder({ provider: this.provider })
      .addInput(escrowUtxo, contract.unlock.unlock(type === "resolver", secret))
      .addInput(feeUtxo, signer.unlockP2PKH())
      .addOutput({
        to: evmAddressToBch(immutables.taker),
        amount: type === "resolver" ? safetyDeposit : 1000n,
        token: {
          category: tokenCategory,
          amount: tokenAmount,
        },
      });

    tx.addOutput({
      to: signer.address,
      amount:
        feeUtxo.satoshis - 1000n + type === "resolver"
          ? 0n
          : order.srcSafetyDeposit,
    });

    return tx;
  }

  withdrawDst(
    escrowUtxo: Utxo,
    feeUtxo: Utxo,
    signer: Wallet,
    type: "resolver" | "public",
    secret: string
  ) {
    const { order, immutables, tokenCategory } = this;

    const { takingAmount, dstSafetyDeposit } = order;

    const contract = this.calcDstContract();
    const tx = new TransactionBuilder({ provider: this.provider })
      .addInput(escrowUtxo, contract.unlock.unlock(type === "resolver", secret))
      .addInput(feeUtxo, signer.unlockP2PKH())
      .addOutput({
        to: evmAddressToBch(order.maker),
        amount: 1000n,
        token: {
          category: tokenCategory,
          amount: takingAmount,
        },
      });

    if (type === "resolver") {
      tx.addOutput({
        to: evmAddressToBch(immutables.taker),
        amount: dstSafetyDeposit,
      }).addOutput({
        to: signer.address,
        amount: feeUtxo.satoshis - 1000n,
      });
    } else {
      tx.addOutput({
        to: signer.address,
        amount: dstSafetyDeposit + feeUtxo.satoshis - 1000n,
      });
    }

    return tx;
  }

  cancelSrc(
    escrowUtxo: Utxo,
    feeUtxo: Utxo,
    signer: Wallet,
    type: "resolver" | "public"
  ) {
    const { order, immutables, tokenCategory } = this;

    const { maker, makingAmount, srcSafetyDeposit } = order;

    const contract = this.calcSrcContract();
    const tx = new TransactionBuilder({ provider: this.provider })
      .addInput(escrowUtxo, contract.unlock.cancel(type === "resolver"))
      .addInput(feeUtxo, signer.unlockP2PKH())
      .addOutput({
        to: evmAddressToBch(maker),
        amount: 1000n,
        token: {
          category: tokenCategory,
          amount: makingAmount,
        },
      });

    if (type === "resolver") {
      tx.addOutput({
        to: evmAddressToBch(immutables.taker),
        amount: srcSafetyDeposit,
      }).addOutput({
        to: signer.address,
        amount: feeUtxo.satoshis - 1000n,
      });
    } else {
      tx.addOutput({
        to: signer.address,
        amount: srcSafetyDeposit + feeUtxo.satoshis - 1000n,
      });
    }

    return tx;
  }

  cancelDst(escrowUtxo: Utxo, feeUtxo: Utxo, signer: Wallet) {
    const { order, immutables, tokenCategory } = this;

    const { dstSafetyDeposit } = order;

    const contract = this.calcDstContract();
    return new TransactionBuilder({ provider: this.provider })
      .addInput(escrowUtxo, contract.unlock.cancel())
      .addInput(feeUtxo, signer.unlockP2PKH())
      .addOutput({
        to: evmAddressToBch(immutables.taker),
        amount: dstSafetyDeposit,
        token: {
          category: tokenCategory,
          amount: immutables.amount,
        },
      })
      .addOutput({
        to: signer.address,
        amount: feeUtxo.satoshis - 1000n,
      });
  }
}
