import { createContext, MutableRefObject } from "react";
import Web3 from "web3";
import { Alert } from "./alerts/AlertPanel";
import NotConnectedReason from "./NotConnectedReason";

type Web3Enabled = {
  type: "enabled";
  web3Ref: MutableRefObject<Web3>;
  firstAccount: string;
};

type Web3Disabled = {
  type: "disabled";
  notConnectedReason: NotConnectedReason;
};

export type Web3Status = Web3Enabled | Web3Disabled;

export interface IContext {
  web3Status: Web3Status;
  alerts: Alert[];
  addAlert: (alert: Alert) => void;
  dismissAlert: (uniqueId: string) => void;
  web3Init: () => void;
}

const Context = createContext<IContext>(<IContext>(<any>undefined)); // Hack because I will never use the default anywhere

export { Context };
