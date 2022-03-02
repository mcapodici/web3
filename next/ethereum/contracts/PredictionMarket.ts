import Web3 from "web3";
import { AbiItem } from "web3-utils";
import contractJson from "./PredictionMarket.json";
import siteWideData from "sitewide/SiteWideData.json";
import { stringToAsciiBytes32 } from "util/Bytes";

export function makeContractObject(web3: Web3) {
  return new web3.eth.Contract(
    contractJson.abi as AbiItem[],
    siteWideData.deployedContractAddresses.predictionMarketsAddress
  );
}

export async function register(web3: Web3, username: string) {
  const contract = makeContractObject(web3);
  // TODO also encode the hash
  await contract.methods.register(stringToAsciiBytes32(username), 0);
}

export interface UserInfo {
  balance: string;
  numberOfMarkets: string;
  userinfoMultihash: string;
  username: string;
}

export async function getUserInfo(
  web3: Web3,
  address: string
): Promise<UserInfo> {
  const contract = makeContractObject(web3);
  return await contract.methods.getUser(address).call();
}
