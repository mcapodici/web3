/**
 * Two types of AMM
 *
 * 1) Prediction market, where you bet on an outcome ocurring and the selected outcome(s) share the pools. E.g. Manifold Markets
 * 2) Swap market, where you are trading A for B via an AMM, and it needs to determin how much of B to give you for A. E.g. Uniswap.
 */

/**
 * There are so many big number types out there, I will let you BYO number type.
 */
export interface NumericContext<TNum> {
  zero: TNum;
  one: TNum;
  add(a: TNum, b: TNum): TNum;
  subtract(a: TNum, b: TNum): TNum;
  multiply(a: TNum, b: TNum): TNum;
  divide(a: TNum, b: TNum): TNum;
  exp(n: TNum): TNum;
  ln(n: TNum): TNum;
  equals(a: TNum, b: TNum): boolean;
  lt(a: TNum, b: TNum): boolean;
}

export const numberContext: NumericContext<number> = {
  zero: 0,
  one: 1,
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => a / b,
  exp: (n) => Math.exp(n),
  ln: (n) => Math.log(n),
  equals: (a, b) => a === b,
  lt: (a, b) => a < b,
};

export const sum = <TNum>(context: NumericContext<TNum>, values: TNum[]) =>
  values.reduce(context.add, context.zero);

export function createMarketCommonValidation<TNum>(
  context: NumericContext<TNum>,
  outcomes: string[],
  probabilities: TNum[],
  liquidity: TNum
) {
  if (!outcomes) return "outcomes is required";
  if (outcomes.length < 2) return "at least 2 outcomes are required";
  if (new Set(outcomes).size < outcomes.length)
    return "outcomes must be unique";

  if (!probabilities) return "probabilities is required";
  if (outcomes.length != probabilities.length)
    return "outcome and probability vectors need to be the same length";
  if (probabilities.find((p) => context.lt(p, context.zero)))
    return "probabilities must all be non-negative";
  if (!context.equals(sum<TNum>(context, probabilities), context.one))
    return "probabilities must add to 1";

  if (!liquidity) return "liquidity is required";
  if (context.lt(liquidity, context.zero)) return "liquidity must be positive";

  return undefined;
}

/** Interface for interacting with a market */
export interface PredictionMarketInstance<TNum> {
  /** Place a bet. Returns a unique bet identifier */
  bet: (player: string, outcome: string, amount: TNum) => string;

  /** Sell a bet you have made, returns the amount returned (as a positive) for the sale */
  sellBet: (betId: string) => TNum;

  /** Returns the bet value if you win and if you sold the given bet */
  betValue: (betId: string) => { onSale: TNum; onWin: TNum };

  /** Returns the probabilities of the outcomes */
  probs: () => { outcome: string; prob: TNum }[];

  /** Resolves the prediction market and returns the winnings each player who won got */
  resolve: (outcomes: string[]) => { player: string; winnings: TNum }[];
}

/** Interface for a prediction market factory for a specific AMM algorithm */
export interface PredictionMarketFactory<TNum> {
  /**
   * Create a market
   *
   * @param outcomes Names of outcomes
   * @param probabilities Initial probabilities of each outcome. Needs to sum to 1.
   * @param liquidity
   */
  create(
    context: NumericContext<TNum>,
    outcomes: string[],
    probabilities: TNum[],
    liquidity: number
  ): PredictionMarketInstance<TNum>;
}
