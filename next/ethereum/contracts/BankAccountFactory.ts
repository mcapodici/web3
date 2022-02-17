import Web3 from "web3";
import { AbiItem } from "web3-utils";
import factoryContractJson from "./BankAccountFactory.json";
import contractJson from "./BankAccount.json";

export function makeFactoryContractObject(
  web3: Web3,
  bankAccountFactoryAddress: string
) {
  return new web3.eth.Contract(
    factoryContractJson.abi as AbiItem[],
    bankAccountFactoryAddress
  );
}

export function makeContractObject(web3: Web3, bankAccountAddress: string) {
  return new web3.eth.Contract(
    contractJson.abi as AbiItem[],
    bankAccountAddress
  );
}

export async function deposit(
  web3: Web3,
  bankAccountContractAddress: string,
  despoitEther: string,
  ownerAddress: string
) {
  const despoitWei = web3.utils.toWei(despoitEther, "ether");
  const contract = makeContractObject(web3, bankAccountContractAddress);
  await contract.methods
    .deposit()
    .send({ from: ownerAddress, gas: 2000000, value: despoitWei });
}

export async function withdraw(
  web3: Web3,
  bankAccountContractAddress: string,
  despoitEther: string,
  ownerAddress: string
) {
  const despoitWei = web3.utils.toWei(despoitEther, "ether");
  const contract = makeContractObject(web3, bankAccountContractAddress);
  await contract.methods
    .withdraw(despoitWei)
    .send({ from: ownerAddress, gas: 2000000 });
}

export async function getExistingAccounts(
  web3: Web3,
  bankAccountFactoryContractAddress: string,
  ownerAddress: string
) {
  const factoryContract = makeFactoryContractObject(
    web3,
    bankAccountFactoryContractAddress
  );
  const events = await factoryContract.getPastEvents("AccountCreated", {
    filter: { sender: [ownerAddress] },
    fromBlock: 1,
  });
  return events;
}

export async function createAccount(
  web3: Web3,
  bankAccountFactoryContractAddress: string,
  ownerAddress: string,
  initialDespoitEther: string
) {
  const initialDespoitWei = web3.utils.toWei(initialDespoitEther, "ether");
  const factoryContract = makeFactoryContractObject(
    web3,
    bankAccountFactoryContractAddress
  );
  return new Promise<string>((resolve) => {
    factoryContract.methods
      .createAccount()
      .send({ from: ownerAddress, gas: 2000000, value: initialDespoitWei })
      .on("receipt", (receipt: any) => {
        const accountAddress =
          receipt.events.AccountCreated.returnValues.account;
        resolve(accountAddress);
      });
  });
}
