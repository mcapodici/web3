import Web3 from "web3";
import { AbiItem } from "web3-utils";
import contractJson from "./PredictionMarket.json";
import siteWideData from "sitewide/SiteWideData.json";
import { asciiBytes32ToString, stringToAsciiBytes32 } from "util/Bytes";
import * as IPFS from "sitewide/IPFS";
import BN from "bn.js";
import { rawListeners } from "process";
import { contractMultiHashToCID } from "sitewide/IPFS";
import { sum, sumBN } from "util/Array";

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

  let multihash = zero32Byte;
  if (bio && bio.length) {
    const payload = { bio };
    const ipfsResult = await IPFS.addText(JSON.stringify(payload));
    multihash = IPFS.getMultihashForContract(ipfsResult);
  }

  const contract = makeContractObject(web3);
  await contract.methods
    .register(stringToAsciiBytes32(username), multihash)
    .send({ from: address });
}

export interface UserInfo {
  balance: BN;
  numberOfMarkets: string;
  userinfoMultihash: string;
  username: string;
}

const userNameCache: { [username: string]: string } = {};

export async function getUserNameWithCache(web3: Web3, address: string) {
  if (!userNameCache[address]) {
    const ui = await getUserInfo(web3, address);
    userNameCache[address] = ui.username;
  }
  return userNameCache[address];
}

export async function getUserInfo(
  web3: Web3,
  address: string
): Promise<UserInfo> {
  const contract = makeContractObject(web3);
  const result = await contract.methods.getUser(address).call();
  result.username = asciiBytes32ToString(result.username);
  result.balance = web3.utils.toBN(web3.utils.fromWei(result.balance, "ether")); // We use the same token ratios as Ether.
  return result;
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

export async function createMarket(
  web3: Web3,
  address: string,
  title: string,
  description: string,
  prob: number,
  pool: BN
) {
  const contract = makeContractObject(web3);
  const payload = { title, description };
  const ipfsResult = await IPFS.addText(JSON.stringify(payload));
  const multihash = IPFS.getMultihashForContract(ipfsResult);

  await contract.methods
    .createMarket(
      multihash,
      pool,
      prob,
      Math.floor(Date.now() / 1000) + 10000000
    )
    .send({ from: address });
}

// Market is return result of getMarket call
async function getBets(web3: Web3, market: any) {
  const contract = makeContractObject(web3);
  const bets = await Promise.all(
    Array(0).map((_, i) =>
      contract.methods.getBet(market.useraddress, market.index, i).call()
    )
  );

  return {
    poolsize: new BN(market.pool).add(sumBN(bets.map((b) => b.betsize))),
    bets: bets,
  };
}

export async function getMarket(
  web3: Web3,
  useraddress: string,
  index: string
) {
  const m = await getMarketInternal(web3, useraddress, index);
  m.blockNumber = 0;
  m.timestamp = new Date(); // TODO query to get the event to fill these in
  return m;
}

async function getMarketInternal(
  web3: Web3,
  useraddress: string,
  index: string
) {
  const contract = makeContractObject(web3);
  const m = await contract.methods.getMarket(useraddress, index).call();
  const username = await getUserNameWithCache(web3, useraddress);

  const cid = IPFS.contractMultiHashToCID(m.infoMultihash);
  const marketInfo = JSON.parse(await IPFS.fetchText(cid));

  let result: any = {
    useraddress: useraddress,
    username: username,
    index: index,
    pool: m.pool,
    prob: m.prob,
    infoMultihash: m.infoMultihash,
    numberOfBets: m.numberOfBets,
    closesAt: new Date(m.closesAt * 1000),
    title: marketInfo.title,
    description: marketInfo.description,
  };

  const more = await getBets(web3, result);
  result = { ...result, ...more };

  return result;
}

export async function getMarkets(web3: Web3) {
  const contract = makeContractObject(web3);
  const events = await contract.getPastEvents("MarketCreated", {
    filter: {},
    fromBlock: 1,
  });

  const result = await Promise.all(
    events.map(async (ev) => {
      const m = await getMarketInternal(
        web3,
        ev.returnValues.useraddress,
        ev.returnValues.index
      );
      const block = await web3.eth.getBlock(ev.blockNumber);

      m.blockNumber = ev.blockNumber;
      m.timestamp = new Date(Number(block.timestamp) * 1000);
      return m;
    })
  );

  return result;
}
