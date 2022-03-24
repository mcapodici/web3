/**
 * Two types of AMM
 *
 * 1) Prediction market, where you bet on an outcome ocurring and the selected outcome(s) share the pools. E.g. Manifold Markets
 * 2) Swap market, where you are trading A for B via an AMM, and it needs to determin how much of B to give you for A. E.g. Uniswap.
 */

/**
 * There are so many big number types out there, I will let you BYO number type.
 */
export interface Numeric<TNum> {
  unwrap(): TNum;
  add(n: Numeric<TNum>): Numeric<TNum>;
  negate(): Numeric<TNum>;
  multiply(n: Numeric<TNum>): Numeric<TNum>;
  divide(n: Numeric<TNum>): Numeric<TNum>;
  exp(n: Numeric<TNum>): Numeric<TNum>;
  ln(n: Numeric<TNum>): Numeric<TNum>;
}

export function asNumeric(n: number): Numeric<number> {
  return {
    unwrap: () => n,
    add: (x) => asNumeric(n + x.unwrap()),
    negate: () => asNumeric(-n),
    multiply: (x) => asNumeric(n * x.unwrap()),
    divide: (x) => asNumeric(n / x.unwrap()),
    exp: () => asNumeric(Math.exp(n)),
    ln: () => asNumeric(Math.log(n)),
  };
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
    outcomes: string[],
    probabilities: Numeric<TNum>[],
    liquidity: number
  ): PredictionMarketInstance;
}
