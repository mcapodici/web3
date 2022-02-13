import Web3 from "web3";
import { getEthereumProvider } from "./ethereumProvider";

let web3: Web3 | undefined = undefined;

export function getWeb3() {
  if (!web3) {
    const ep: any = getEthereumProvider();

    if (ep) {
      ep.request({ method: "eth_requestAccounts" });
      web3 = new Web3(ep);
    }
  }

  return web3;
}

export async function getWeb3WithAccounts() {
  const web3 = getWeb3();
  let accounts: string[] = [];

  if (!web3) {
    return { web3, accounts };
  }

  accounts = await web3.eth.getAccounts();
  console.log(web3.defaultAccount);
  return { web3, accounts };
}
