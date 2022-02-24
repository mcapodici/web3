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
      (pool.initialMoney * pool.initialProb) + sum(pool.bets.filter((b) => b.outcome === 0).map((b) => b.shares)),
    sharesOfB:
      (pool.initialMoney * (1 - pool.initialProb)) + sum(pool.bets.filter((b) => b.outcome === 1).map((b) => b.shares)),
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

export function bet(pool: Pool, who: string, outcome: number, money: number) {
  const pi = poolInfo(pool);

  const moneyOnOutcome = outcome === 0 ? pi.moneyOnA : pi.moneyOnB;
  const sharesOfOther = outcome === 0 ? pi.sharesOfB : pi.sharesOfA;

  const shares = Math.log2(money / moneyOnOutcome + 1) * sharesOfOther;
  pool.bets.push({
    who,
    money,
    shares,
    outcome,
  });
}