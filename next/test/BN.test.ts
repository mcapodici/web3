import { BNTokenSand, toBaseUnit } from "../util/BN";
import BN from "bn.js";
import fc from "fast-check";
import chai, { expect } from "chai";
import bnChai from "bn-chai";
chai.use(bnChai(BN));

const examplesOfBetAmounts = fc
  .integer({ min: 1 })
  .map((x) => new BN(x / 10 ** 4));

const examplesOfRawTokenAmounts = fc
  .bigUintN(128)
  .map((x) => new BN(x.toString()));

describe("toBaseUnit", () => {
    it("works", () => {
       expect(toBaseUnit('1000', 2)).to.be.eq.BN(new BN('100000'));
       expect(toBaseUnit('1000.666', 2)).to.be.eq.BN(new BN('100066'), 'truncation');       
       expect(toBaseUnit('0.01', 2)).to.be.eq.BN(new BN('1'), 'smallest');       
       expect(toBaseUnit('0', 2)).to.be.eq.BN(new BN('0'), 'zero');              
       expect(toBaseUnit('0.5', 2)).to.be.eq.BN(new BN('50'), 'partial dp');       
       expect(toBaseUnit('1000000000000000000000000000000000000000000000.01', 2)).to.be.eq.BN(new BN('100000000000000000000000000000000000000000000001'), 'big no');
    });
});

describe("BNTokenSand", () => {
  it("round trip human values", () => {
    fc.assert(
      fc.property(examplesOfBetAmounts, (amt) => {
        const roundTrip = BNTokenSand.fromNumTokens(
          amt.toString()
        ).toNumTokens();
        return Number(roundTrip) === amt.toNumber();
      })
    );
  });
  it("round trip contract values", () => {
    fc.assert(
      fc.property(examplesOfRawTokenAmounts, (amt) => {
        const roundTrip = BNTokenSand.fromSand(amt).asSand();
        return roundTrip.eq(amt);
      })
    );
  });
  it("converts from sand to human", () => {
    const tester = (tokens: string, sand: string) =>
      expect(BNTokenSand.fromSand(new BN(sand)).toNumTokens()).to.equal(tokens);

    tester("2.000000000000000000", "2000000000000000000");
    tester("2.100000000000000000", "2100000000000000000");
    tester("20000000000.000000000000000000", "20000000000000000000000000000");
    tester("0.000000000000000001", "1");
  });
  it("converts from human to sand", () => {
    const tester = (tokens: string, sand: string) =>
      expect(BNTokenSand.fromNumTokens(tokens).asSand()).to.eq.BN(new BN(sand));

    tester("2", "2000000000000000000");
    tester("2.1", "2100000000000000000");
    tester("20000000000", "20000000000000000000000000000");
    tester("0.000000000000000001", "1");
  });
});
