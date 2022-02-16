import Web3 from "web3";
import { AbiItem } from "web3-utils";
import factoryContractJson from "./BankAccountFactory.json";

export function makeFactoryContractObject(web3: Web3, bankAccountFactoryAddress: string) {
  return new web3.eth.Contract(factoryContractJson.abi as AbiItem[], bankAccountFactoryAddress);
}
export async function getExistingAccounts(web3: Web3, bankAccountFactoryAddress: string, ownerAddress: string) {
  const factoryContract = makeFactoryContractObject(
    web3,
    bankAccountFactoryAddress
  );
  const events = await factoryContract.getPastEvents("AccountCreated", {
    filter: { sender: [ownerAddress] },
    fromBlock: 1,
  });
  return events;
}

export async function createAccount(web3: Web3, bankAccountFactoryAddress: string, ownerAddress: string, initialDespoitEther: string) {
  const initialDespoitWei = web3.utils.toWei(initialDespoitEther, "ether");
  const factoryContract = makeFactoryContractObject(web3, bankAccountFactoryAddress);
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
