import * as RM from "./ReferenceMarket";
import fc from "fast-check";
import lambertw from "./lambertw"; // https://github.com/protobi/lambertw

const getError = (expected: number, actual: number) =>
  Math.abs(expected - actual) / expected;

const positiveNumberProp = fc.integer({ min: 1 }).map((x) => x / 10 ** 4);

describe("In the reference market, ", () => {
  it("Is possible for NR to converge on our formula", () => {
    fc.assert(
      fc.property(positiveNumberProp, fc.context(), (targetcost, c) => {
        const outcome = 0;
        const pool = RM.initPool(1000, 0.1);
        const pi = RM.poolInfo(pool);
        const moneyOnOutcome = outcome === 0 ? pi.moneyOnA : pi.moneyOnB;
        const sharesOfOther = outcome === 0 ? pi.sharesOfB : pi.sharesOfA;
        const shares =
          lambertw.gsl_sf_lambert_W0(targetcost / moneyOnOutcome) *
          sharesOfOther;

        const cost =
          (moneyOnOutcome / sharesOfOther) *
          shares *
          Math.exp(shares / sharesOfOther);
        c.log("Actual cost:" + cost.toString());
        return getError(targetcost, cost) < 0.001;
      })
    );
  });
  
  it("Cost per share increases as people bet on the same thing", () => {
    fc.assert(
      fc.property(positiveNumberProp, (n) => {
        const pool = RM.initPool(1000, 0.1);
        RM.bet(pool, "x", 0, n);
        RM.bet(pool, "x", 0, n);
        return pool.bets[0].money < pool.bets[1].money;
      })
    );
  });
});
