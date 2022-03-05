import lambertw from "./LambertW";
import BN from "bn.js";

export function calculateSharesForBetAmount(
  moneyOn0: BN,
  moneyOn1: BN,
  sharesOf0: BN,
  sharesOf1: BN,
  outcome: number,
  betAmount: BN
) {
  // For now just convert the BN to decimal, but if there are edge cases
  // we might need to change lambert to use BN all the way through.
  const moneyOnOutcome = outcome === 0 ? moneyOn0 : moneyOn1;
  const sharesOfOther = outcome === 0 ? sharesOf1 : sharesOf0;
  return new BN(lambertw.gsl_sf_lambert_W0(betAmount.toNumber() / moneyOnOutcome.toNumber()) * sharesOfOther.toNumber());
}
