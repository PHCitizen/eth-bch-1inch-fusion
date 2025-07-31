import {
  encodePrivateKeyWif,
  generatePrivateKey,
  publicKeyToP2pkhCashAddress,
  publicKeyToP2pkhLockingBytecode,
} from "@bitauth/libauth";
import { SignatureTemplate } from "cashscript";

type Network = "testnet" | "mainnet";

export class Wallet {
  template: SignatureTemplate;
  network: Network;

  static random(network: Network) {
    const priv = generatePrivateKey();
    const wif = encodePrivateKeyWif(priv, network);
    return new Wallet(wif, network);
  }

  constructor(wif: string, network: Network) {
    this.template = new SignatureTemplate(wif);
    this.network = network;
  }

  get address() {
    const publicKey = this.template.getPublicKey();
    return publicKeyToP2pkhCashAddress({
      publicKey,
      prefix: "bchtest",
      tokenSupport: false,
    }).address;
  }

  get tokenAddress() {
    const publicKey = this.template.getPublicKey();
    return publicKeyToP2pkhCashAddress({
      publicKey,
      prefix: "bchtest",
      tokenSupport: true,
    }).address;
  }

  get lockingScript() {
    const publicKey = this.template.getPublicKey();
    return publicKeyToP2pkhLockingBytecode({ publicKey });
  }

  get unlockP2PKH() {
    return this.template.unlockP2PKH;
  }
}
