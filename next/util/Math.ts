import lambertw from "./LambertW";
import { BNToken } from "./BN";

/** Convenience function to convert a BNToken into a Number for the number of tokens */
const t = (x: BNToken) => Number(x.toNumTokens());

export function calculateSharesForBetAmount(
  moneyOn0: BNToken,
  moneyOn1: BNToken,
  sharesOf0: BNToken,
  sharesOf1: BNToken,
  outcome: number,
  betAmount: BNToken
) {
  // For now just convert the BN to decimal, but if there are edge cases
  // we might need to change lambert to use BN all the way through.
  const moneyOnOutcome = outcome === 0 ? moneyOn0 : moneyOn1;
  const sharesOfOther = outcome === 0 ? sharesOf1 : sharesOf0;

  const intermediate = (
    lambertw.gsl_sf_lambert_W0(t(betAmount) / t(moneyOnOutcome)) *
    t(sharesOfOther)
  ).toFixed(18);
  return BNToken.fromNumTokens(intermediate);
}

export function payout(
  moneyOn0: BNToken,
  moneyOn1: BNToken,
  sharesOf0: BNToken,
  sharesOf1: BNToken,
  outcome: number,
  numberOfShares: BNToken,
  betAmount: BNToken
) {
  const moneyOnLoser = outcome === 0 ? moneyOn1 : moneyOn0;
  const sharesOfWinner = outcome === 0 ? sharesOf0 : sharesOf1;
  const intermediate =
    (t(numberOfShares) / t(sharesOfWinner)) * t(moneyOnLoser) + t(betAmount);

  return BNToken.fromNumTokens(intermediate.toFixed(18));
}
