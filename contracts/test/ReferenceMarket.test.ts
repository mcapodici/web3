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
        const shares = RM.calculateSharesForBetAmount(pool,  outcome, targetcost);
        RM.bet(pool, 'x', outcome, shares);
        const actualcost = pool.bets[0].money;
        c.log("Actual cost:" + actualcost.toString());
        return getError(targetcost, actualcost) < 0.001;
      })
    );
  });
  
  it("Cost per share increases as people bet on the same thing", () => {
    fc.assert(
      fc.property(positiveNumberProp, fc.context(), (targetcost, c) => {
        const outcome = 0;
        const pool = RM.initPool(1000, 0.1);
        const shares = RM.calculateSharesForBetAmount(pool,  outcome, targetcost);
        RM.bet(pool, "x", outcome, shares);
        RM.bet(pool, "x", outcome, shares);
        c.log(JSON.stringify(pool.bets));
        return pool.bets[0].money < pool.bets[1].money;
      })
    );
  });
});
