import {
  Bet,
  createMarketCommonValidation,
  NumericContext,
  PredictionMarket,
  PredictionMarketFactory,
  sum,
} from "./Interfaces";

function createMarket<TNum>(
  context: NumericContext<TNum>,
  outcomes: string[],
  probabilities: TNum[],
  liquidity: TNum
) {
  const failure = createMarketCommonValidation(
    context,
    outcomes,
    probabilities,
    liquidity
  );
  if (failure) throw new Error(failure);
  return new Market<TNum>(context, outcomes, probabilities, liquidity);
}

class Market<TNum> implements PredictionMarket<TNum> {
  private context: NumericContext<TNum>;
  private outcomes: string[];
  private pools: TNum[];
  private bets: Bet<TNum>[];

  constructor(
    context: NumericContext<TNum>,
    outcomes: string[],
    probabilities: TNum[],
    liquidity: TNum
  ) {
    let allocated = context.zero;
    let maxPoolSize = context.zero;
    let maxPoolIndex = 0;
    this.pools = Array(probabilities.length);
    for (let i = 0; i < probabilities.length; i++) {
      const poolSize = context.multiply(liquidity, probabilities[i]);
      this.pools[i] = poolSize;
      allocated = context.add(allocated, poolSize);
      if (context.lt(maxPoolSize, poolSize)) {
        maxPoolSize = poolSize;
        maxPoolIndex = i;
      }
    }

    // Make sure all of the pools add up to liquidity
    const overAllocation = context.subtract(allocated, liquidity);
    this.pools[maxPoolIndex] = context.subtract(
      this.pools[maxPoolIndex],
      overAllocation
    );

    if (!context.equals(sum(context, this.pools), liquidity))
      throw new Error("Couldn't get pools to sum correctly.");

    this.context = context;
    this.outcomes = outcomes;
    this.bets = [];
  }

  bet(bet: Bet<TNum>) {
    this.bets.push(bet);
    return this.bets.length - 1; // Can't sell bets anyway;
  }

  getBets() {
    return this.bets;
  }

  sellBet(betId: number) {
    throw new Error("sellBet not supported for parimutuel");
    return this.context.zero; // Because typescript
  }

  betValue(betId: number) {
    const tps = this.totalPoolsSize();
    const bet = this.bets[betId];

    return {
      onSale: this.context.zero,
      onWin: this.context.multiply(
        tps,
        this.context.divide(bet.amount, this.poolSizeWithBets(bet.outcomeIndex))
      ),
    };
  }

  private totalPoolsSize() {
    return sum(this.context, this.poolSizeWithBetsAll());
  }

  private poolSizeWithBetsAll() {
    return this.pools.map((_, i) => this.poolSizeWithBets(i));
  }

  private poolSizeWithBets(index: number) {
    const betsOnPool = sum(
      this.context,
      this.bets.filter((b) => b.outcomeIndex === index).map((x) => x.amount)
    );
    return this.context.add(betsOnPool, this.pools[index]);
  }

  probs() {
    const tps = this.totalPoolsSize();
    return this.poolSizeWithBetsAll().map((p) => this.context.divide(p, tps));
  }

  resolve(outcomeIndices: number[]) {
    if (outcomeIndices.length !== 1)
      throw new Error("Only supports single outcome");

    const result: { [player: string]: TNum } = {};

    const winningBets = this.bets
      .map((b, betId) => ({ ...b, index: betId }))
      .filter((b) => b.outcomeIndex === outcomeIndices[0]);
    for (let bet of winningBets) {
      result[bet.player] = result[bet.player] || this.context.zero;
      result[bet.player] = this.context.add(
        result[bet.player],
        this.betValue(bet.index).onWin
      );
    }

    return result;
  }

  addOutcome(outcome: string) {
    throw new Error("addOutcome not supported for parimutuel");
    return 0; // Because typescript
  }

  canSellBet = false;
  canAddOutcome = false;
  
  stats() {
    const stats = this.poolSizeWithBetsAll().map((size, index) => ({name: `Pool Size - ${this.outcomes[index]}`, value:size}));
    stats.push({name:'Total Pool', value:this.totalPoolsSize()});
    return stats;
  }
}

export const parimutuel = {
  create: createMarket,
} as PredictionMarketFactory;
