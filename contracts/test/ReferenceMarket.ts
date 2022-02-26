import lambertw from './lambertw';

const requiredPrecision = 10 ** 18;

// This code provides a reference implementation in JS so that I can compare
// this to what the smart contract returns. This has some advantages - one I can
// quickly generate more test cases, and another is that 

export interface Bet {
  who: string;
  outcome: number; // 0 or 1 for A or B
  shares: number; // Number of shares allocated
  money: number; // Money placed for given shares
}

export interface Pool {
  initialMoney: number; // Initial pool
  initialProb: number; // Initial probability
  bets: Bet[];
}

export function initPool(money: number, prob: number): Pool {
  return {
    initialMoney: money,
    initialProb: prob,
    bets: [],
  };
}

export function sum(nums: number[]) {
  return nums.reduce((p, c) => p + c, 0);
}

export function poolInfo(pool: Pool): any {
  const result: any = {
    poolSize: pool.initialMoney + sum(pool.bets.map((b) => b.money)),
    moneyOnA:
      pool.initialMoney * pool.initialProb +
      sum(pool.bets.filter((b) => b.outcome === 0).map((b) => b.money)),
    moneyOnB:
      pool.initialMoney * (1 - pool.initialProb) +
      sum(pool.bets.filter((b) => b.outcome === 1).map((b) => b.money)),
    sharesOfA:
      1 + sum(pool.bets.filter((b) => b.outcome === 0).map((b) => b.shares)),
    sharesOfB:
      1 + sum(pool.bets.filter((b) => b.outcome === 1).map((b) => b.shares)),
  };

  result.totalMoney = result.moneyOnA + result.moneyOnB;
  result.impliedProb = result.moneyOnA / result.totalMoney;

  result.bets = pool.bets.map((b) => {
    let profitOnWin =
      b.shares *
      (b.outcome === 0
        ? result.moneyOnB / result.sharesOfA
        : result.moneyOnA / result.sharesOfB);
    return {
      ...b,
      profitOnWin,
      returnOnWin: b.money + profitOnWin,
      betIPForChosenOutcome: b.money / (b.money + profitOnWin),
    };
  });

  return result;
}

export function resolve(pool: Pool, outcome: number) {
  const result: any = {};

  const pi = poolInfo(pool);
  const losingPot = outcome == 0 ? pi.moneyOnB : pi.moneyOnA;
  const winningShares = outcome == 0 ? pi.sharesOfA : pi.sharesOfB;

  pool.bets.filter(b=>b.outcome ==outcome).map(b =>result[b.who] = (result[b.who] || 0) + (losingPot * b.shares / winningShares));
  pool.bets.filter(b=>b.outcome !=outcome).map(b =>result[b.who] = (result[b.who] || 0) - (b.money));

  const net = sum(Object.values(pi));
  result ['creator'] = net + pool.initialMoney;
  return result;
}

export function calculateSharesForBetAmount(pool: Pool, outcome: number, betAmount: number) {
  const pi = poolInfo(pool);  
  const moneyOnOutcome = outcome === 0 ? pi.moneyOnA : pi.moneyOnB;
  const sharesOfOther = outcome === 0 ? pi.sharesOfB : pi.sharesOfA;
  return  lambertw.gsl_sf_lambert_W0(betAmount / moneyOnOutcome) *  sharesOfOther;
}

export function getCost(pool: Pool, outcome: number, numberOfShares: number) {
  const pi = poolInfo(pool);

  const moneyOnOutcome = outcome === 0 ? pi.moneyOnA : pi.moneyOnB;
  const sharesOfOther = outcome === 0 ? pi.sharesOfB : pi.sharesOfA;

  // http://dpennock.com/papers/pennock-ec-2004-dynamic-parimutuel.pdf 4.2.1 (7)
  //
  // p = price per share, n = number of shares, N2 = number of shares of losing side, M1 = money on winning side
  //
  // Pennock: (tcost / n) = M1/N2 * exp(n / N2)
  //
  // e ^ ( a * b) (e ^ a) ^ b
  //
  //  W(x) * e ^ W(X) = x\
  // 
  // tcost = M1/N2 * n * exp(n / N2)
  //
  // tcost = M1 * (n / N2) * exp(n / N2)
  // tcost/M1 =(n / N2) * exp(n / N2)
  // n/N2 = W(tcost/M1)
  // n = N2 * W(tcost/M1)
  
  const cost = (moneyOnOutcome / sharesOfOther) * numberOfShares * Math.exp(numberOfShares / sharesOfOther);
  if (!isFinite(cost))
    throw 'Cost would be infinite';
  return cost;
}

export function bet(pool: Pool, who: string, outcome: number, numberOfShares: number) {
  pool.bets.push({
    who,
    money: getCost(pool, outcome, numberOfShares),
    shares: numberOfShares,
    outcome,
  });
}