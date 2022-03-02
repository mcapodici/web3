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

export const UsernameRegex = /^[A-Za-z_\-]+$/;

export async function register(
  web3: Web3,
  address: string,
  username: string,
  bio: string
) {
  if (!UsernameRegex.test(username)) throw Error("Invalid username");

  // TODO encode the bio as JSON using the IPFS and send it's hash along
  const contract = makeContractObject(web3);
  await contract.methods
    .register(stringToAsciiBytes32(username), stringToAsciiBytes32(''))
    .send({ from: address });
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
  return await contract.methods.getUser(address).call();x``
}

const zeroAddress = '0x0000000000000000000000000000000000000000';

export async function getAccountForUsername(
  web3: Web3,
  username: string): Promise<string | undefined> {
    const contract = makeContractObject(web3);
    const res = await contract.methods.usernames(stringToAsciiBytes32(username)).call();
    return res === zeroAddress ? undefined : res;
  }
