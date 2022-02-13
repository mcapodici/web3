import Web3 from "web3";
import { AbiItem } from "web3-utils";
import contractJson from "./BankAccount.json";

function makeContractObject(web3: Web3) {
  return new web3.eth.Contract(contractJson.abi as AbiItem[]);
}

export async function deployContract(web3: Web3, address: string, initialDespoitWei: string) {
  const contract = makeContractObject(web3);
  return await contract
    .deploy({ data: contractJson.evm.bytecode.object })
    .send({ from: address, gas: 2000000, value: initialDespoitWei });
}
