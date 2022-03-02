import Web3 from "web3";
import { AbiItem } from "web3-utils";
import contractJson from "./PredictionMarket.json";
import siteWideData from "sitewide/SiteWideData.json";
import { stringToAsciiBytes32 } from "util/Bytes";
import * as IPFS from "sitewide/IPFS";

export function makeContractObject(web3: Web3) {
  return new web3.eth.Contract(
    contractJson.abi as AbiItem[],
    siteWideData.deployedContractAddresses.predictionMarketsAddress
  );
}

export const UsernameRegex = /^[A-Za-z_\-]+$/;

export class IPFSError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IPFSError";
  }
}

export async function register(
  web3: Web3,
  address: string,
  username: string,
  bio: string
) {
  if (!UsernameRegex.test(username)) throw Error("Invalid username");

  let multihash = zero32Byte;
  if (bio && bio.length) {
    try {
      const payload = { bio };
      const ipfsResult = await IPFS.addText(JSON.stringify(payload));
      multihash = IPFS.getMultihashForContract(ipfsResult);
    } catch (ex: any) {
      throw new IPFSError(ex.message);
    }
  }

  const contract = makeContractObject(web3);
  await contract.methods
    .register(stringToAsciiBytes32(username), multihash)
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
  return await contract.methods.getUser(address).call();
}

const zeroAddress = "0x0000000000000000000000000000000000000000";
const zero32Byte =
  "0x0000000000000000000000000000000000000000000000000000000000000000";

export async function getAccountForUsername(
  web3: Web3,
  username: string
): Promise<string | undefined> {
  const contract = makeContractObject(web3);
  const res = await contract.methods
    .usernames(stringToAsciiBytes32(username))
    .call();
  return res === zeroAddress ? undefined : res;
}
