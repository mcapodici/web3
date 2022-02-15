import Web3 from "web3";
import { AbiItem } from "web3-utils";
import factoryContractJson from "./BankAccountFactory.json";

function makeFactoryContractObject(web3: Web3, address: string) {
  return new web3.eth.Contract(factoryContractJson.abi as AbiItem[], address);
}

export async function createAccount(web3: Web3, factoryContractAddress: string, ownerAddress: string, initialDespoitWei: string) {
  const factoryContract = makeFactoryContractObject(web3, factoryContractAddress);
  return new Promise<string>((resolve) => {
    factoryContract.methods
      .createAccount()
      .send({ from: ownerAddress, gas: 2000000, value: initialDespoitWei })
      .on('receipt', (receipt: any) => {
        const accountAddress = receipt.events.AccountCreated.returnValues.account;
        resolve(accountAddress);
      });
  });
}
