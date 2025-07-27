import {
  SDK,
  HttpProviderConnector,
  NetworkEnum,
} from "@1inch/cross-chain-sdk";
import axios from "axios";

class Logger implements HttpProviderConnector {
  async get<T>(url: string): Promise<T> {
    console.log(url);
    return await axios.get(url);
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    console.log(url, data);
    return await axios.post(url, { data });
  }
}

export const bchSdk = new SDK({
  url:
    process.env.NEXT_PUBLIC_FUSION_URL || "http://localhost:3001/fusion-plus",
  httpProvider: new Logger(),
});
