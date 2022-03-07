import { b, BNToken, roundToNearest10x, toBaseUnit } from "../util/BN";
import BN from "bn.js";
import fc from "fast-check";
import chai, { expect } from "chai";
import bnChai from "bn-chai";
chai.use(bnChai(BN));

const examplesOfBetAmounts = fc
  .integer({ min: 1 })
  .map((x) => b(x / 10 ** 4));

const examplesOfRawTokenAmounts = fc
  .bigUintN(128)
  .map((x) => b(x.toString()));

describe("toBaseUnit", () => {
    it("works", () => {
       expect(toBaseUnit('1000', 2)).to.be.eq.BN(b('100000'));
       expect(toBaseUnit('1000.666', 2)).to.be.eq.BN(b('100066'), 'truncation');       
       expect(toBaseUnit('0.01', 2)).to.be.eq.BN(b('1'), 'smallest');       
       expect(toBaseUnit('0', 2)).to.be.eq.BN(b('0'), 'zero');              
       expect(toBaseUnit('0.5', 2)).to.be.eq.BN(b('50'), 'partial dp');       
       expect(toBaseUnit('1000000000000000000000000000000000000000000000.01', 2)).to.be.eq.BN(b('100000000000000000000000000000000000000000000001'), 'big no');
    });
});

describe("roundToNearest10x", () => {
  it('works', () => {
    expect(roundToNearest10x(b('12344'), 1)).to.be.eq.BN(b('12340'));
    expect(roundToNearest10x(b('12345'), 1)).to.be.eq.BN(b('12350'));
    expect(roundToNearest10x(b('12340'), 1)).to.be.eq.BN(b('12340'));
    expect(roundToNearest10x(b('12340'), 2)).to.be.eq.BN(b('12300'));
    expect(roundToNearest10x(b('12350'), 2)).to.be.eq.BN(b('12400'));
  });
})

describe("BNTokenSand", () => {
  it("round trip human values", () => {
    fc.assert(
      fc.property(examplesOfBetAmounts, fc.context(), (amt, ctx) => {
        const roundTrip = BNToken.fromNumTokens(
          amt.toString()
        ).toNumTokens();
        ctx.log(roundTrip);
        ctx.log(amt.toNumber().toString());
        return Number(roundTrip) === amt.toNumber();
      })
    );
  });
  it("round trip contract values", () => {
    fc.assert(
      fc.property(examplesOfRawTokenAmounts, (amt) => {
        const roundTrip = BNToken.fromSand(amt).asSand();
        return roundTrip.eq(amt);
      })
    );
  });
  it("converts from sand to human", () => {
    const tester = (tokens: string, sand: string) =>
      expect(BNToken.fromSand(b(sand)).toNumTokens()).to.equal(tokens);

    tester("2.000000000000000000", "2000000000000000000");
    tester("2.100000000000000000", "2100000000000000000");
    tester("20000000000.000000000000000000", "20000000000000000000000000000");
    tester("0.000000000000000001", "1");
  });
  it("rounds", () => {
    const tester = (tokens: string, sand: string) =>
      expect(BNToken.fromSand(b(sand)).toNumTokens(4)).to.equal(tokens);

    tester("2.5556", "2555550000000000000");
    tester("2.5555", "2555549000000000000");
  });
  it("converts from human to sand", () => {
    const tester = (tokens: string, sand: string) =>
      expect(BNToken.fromNumTokens(tokens).asSand()).to.eq.BN(b(sand));

    tester("2", "2000000000000000000");
    tester("2.1", "2100000000000000000");
    tester("20000000000", "20000000000000000000000000000");
    tester("0.000000000000000001", "1");
  });
});
