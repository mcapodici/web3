import { createContext, MutableRefObject } from "react";
import Web3 from "web3";

type Web3Enabled = {
  type: "enabled";
  web3Ref: MutableRefObject<Web3>;
  firstAccount: string;
}

type Web3Disabled = {
  type: "disabled";
}

export type Web3Status = Web3Enabled | Web3Disabled;

export interface IContext {
  web3Status: Web3Status;
}

const Context = createContext<IContext>(<IContext> <any> undefined); // Hack because I will never use the default anywhere

export {Context}

