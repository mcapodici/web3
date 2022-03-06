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
import { calculateSharesForBetAmount } from "util/Math";
import { b, BNToken, bt } from "util/BN";

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
  balance: string;
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

export async function calculateNumbeOfSharesForMarket(
  web3: Web3,
  marketAddress: string,
  marketIndex: number,
  betAmount: BNToken,
  isYes: boolean
) {
  const market = await getMarket(web3, marketAddress, marketIndex);

  let moneyOn0 = market.pool.asSand().mul(b(100).sub(market.prob));
  let moneyOn1 = market.pool.asSand().mul(market.prob);
  let sharesOf0 = BNToken.fromNumTokens('1').asSand();
  let sharesOf1 = BNToken.fromNumTokens('1').asSand();
  let outcome = isYes ? 1 : 0;

  for (let bet of market.bets) {
    moneyOn0 = moneyOn0.add(bet.outcome.eq(b(0)) ? bet.betsize.asSand() : b(0));
    moneyOn1 = moneyOn1.add(bet.outcome.eq(b(1)) ? bet.betsize.asSand() : b(0));
    sharesOf0 = sharesOf0.add(
      bet.outcome.eq(b(0)) ? bet.numberOfShares.asSand() : b(0)
    );
    sharesOf1 = sharesOf1.add(
      bet.outcome.eq(b(1)) ? bet.numberOfShares.asSand() : b(0)
    );
  }

  // What is the convention as to what kind of numbers - e.g. contract format (1 = 10 ** 18). I think it shold be that
  // way. We should have a convention / naeme for anything stored this way on the front end as there is a mix ( probably)
  // have this convention in the contract too. Might need to change calculateSharesForBetAmount to work with BN??
  return calculateSharesForBetAmount(
    BNToken.fromSand(moneyOn0),
    BNToken.fromSand(moneyOn1),
    BNToken.fromSand(sharesOf0),
    BNToken.fromSand(sharesOf1),
    outcome,
    betAmount
  );
}

export async function makeBet(
  web3: Web3,
  bettorAddess: string,
  marketAddress: string,
  marketIndex: number,
  numberOfShares: BN,
  isYes: boolean
) {
//  console.log({a:marketAddress, b:marketIndex, c:numberOfShares.toString(), d:isYes ? 1 : 0, e:bettorAddess});
  const contract = makeContractObject(web3);
  await contract.methods
    .makeBet(marketAddress, marketIndex, numberOfShares, isYes ?'1' :'0')
    .send({ from: bettorAddess });
}

export async function getUserInfo(
  web3: Web3,
  address: string
): Promise<UserInfo> {
  const contract = makeContractObject(web3);
  const result = await contract.methods.getUser(address).call();

  return {
   username: asciiBytes32ToString(result.username),
   balance: BNToken.fromSand(new BN(result.balance)).toNumTokens(4),
   numberOfMarkets: result.numberOfMarkets,
   userinfoMultihash: result.userinfoMultihash
  }
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
async function getBets(
  web3: Web3,
  market: IMarketInfo
): Promise<{ poolsize: BNToken; bets: Bet[] }> {
  const contract = makeContractObject(web3);
  const bets = await Promise.all(
    Array(market.numberOfBets).map((_, i) =>
      contract.methods.getBet(market.useraddress, market.index, i).call()
    )
  );

  const betsWithUsername = await Promise.all(bets.map(async bet => {
    const username = await getUserNameWithCache(web3, bet.useraddress);
    return { ...bet, username };
  }))

  return {
    poolsize: BNToken.fromSand(
      market.pool.asSand().add(sumBN(bets.map((b) => new BN(b.betsize))))
    ),
    bets: betsWithUsername.map((bet) => ({
      useraddress: bet.useraddress,
      username: bet.username,
      betsize: bt(bet.betsize),
      numberOfShares: bt(bet.numberOfShares),
      outcome: b(bet.outcome),
    })),
  };
}

export async function getMarket(
  web3: Web3,
  marketaddress: string,
  index: number
) {
  const m = await getMarketInternal(web3, marketaddress, index);

  const contract = makeContractObject(web3);
  const events = await contract.getPastEvents("MarketCreated", {
    filter: { useraddress: marketaddress, index },
    fromBlock: 1,
  });
  const ev = events[0];
  const block = await web3.eth.getBlock(ev.blockNumber);
  m.blockNumber = ev.blockNumber;
  m.timestamp = new Date(Number(block.timestamp) * 1000);
  return m;
}

export interface Bet {
  useraddress: string;
  username: string;
  betsize: BNToken;
  numberOfShares: BNToken;
  outcome: BN;
}

export interface IMarketInfo {
  useraddress: string;
  username: string;
  index: BN;
  pool: BNToken;
  prob: BN;
  infoMultihash: string;
  numberOfBets: BN;
  closesAt: Date;
  title: string;
  description: string;
  poolsize: BNToken;
  bets: Bet[];
  blockNumber: number;
  timestamp: Date;
}

async function getMarketInternal(
  web3: Web3,
  marketaddress: string,
  index: number
) {
  const contract = makeContractObject(web3);
  const m = await contract.methods.getMarket(marketaddress, index).call();
  const username = await getUserNameWithCache(web3, marketaddress);

  const cid = IPFS.contractMultiHashToCID(m.infoMultihash);
  const marketInfo = JSON.parse(await IPFS.fetchText(cid));

  let result: IMarketInfo = {
    useraddress: marketaddress,
    username: username,
    index: b(index),
    pool: bt(m.pool),
    prob: b(m.prob),
    infoMultihash: m.infoMultihash,
    numberOfBets: m.numberOfBets,
    closesAt: new Date(m.closesAt * 1000),
    title: marketInfo.title,
    description: marketInfo.description,
    poolsize: bt(0), // Filled in after
    bets: [], // Filled in after
    blockNumber: 0, // Filled in after
    timestamp: new Date(0), // Filled in lfter
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
