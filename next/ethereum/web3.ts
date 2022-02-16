import detectEthereumProvider from "@metamask/detect-provider";
import Web3 from "web3";

async function getWeb3() {
  const ep: any = await detectEthereumProvider();

  if (ep) {
    await ep.request({ method: "eth_requestAccounts" });
    return new Web3(ep);
  }
}

export async function getWeb3WithAccounts() {
  const web3 = await getWeb3();
  let accounts: string[] = [];

  if (!web3) {
    return { web3, accounts };
  }

  accounts = await web3.eth.getAccounts();
  return { web3, accounts };
}
