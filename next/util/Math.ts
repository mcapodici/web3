import lambertw from "./LambertW";
import { BNToken } from "./BN";

export function calculateSharesForBetAmount(
  moneyOn0: BNToken,
  moneyOn1: BNToken,
  sharesOf0: BNToken,
  sharesOf1: BNToken,
  outcome: number,
  betAmount: BNToken
) {
  const t = (x: BNToken) => Number(x.toNumTokens());
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
