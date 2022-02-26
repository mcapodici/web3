import lambertw from "./lambertw";

export function calculateSharesForBetAmount(
  moneyOn0: number,
  moneyOn1: number,
  sharesOf0: number,
  sharesOf1: number,
  outcome: number,
  betAmount: number
) {
  const moneyOnOutcome = outcome === 0 ? moneyOn0 : moneyOn1;
  const sharesOfOther = outcome === 0 ? sharesOf1 : sharesOf0;
  return lambertw.gsl_sf_lambert_W0(betAmount / moneyOnOutcome) * sharesOfOther;
}
