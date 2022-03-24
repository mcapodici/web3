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
};

export const sum = <TNum>(context: NumericContext<TNum>, values: TNum[]) =>
  values.reduce(context.add, context.zero);

export function createMarketCommonValidation<TNum>(
  context: NumericContext<TNum>,
  outcomes: string[],
  probabilities: TNum[],
  liquidity: number
) {
  if (!outcomes) return "outcomes is required";
  if (!probabilities) return "probabilities is required";
  if (!liquidity) return "liquidity is required";

  if (outcomes.length < 2) return "at least 2 outcomes are required";
  if (outcomes.length != probabilities.length)
    return "outcome and probability vectors need to be the same length";
  if (liquidity < 0) return "liquidity must be positive";
  if (!context.equals(sum<TNum>(context, probabilities), context.one))
    return "probabilities must add to 1";
}

export interface PredictionMarketInstance {}

export interface PredictionMarket<TNum> {
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
  ): PredictionMarketInstance;
}
