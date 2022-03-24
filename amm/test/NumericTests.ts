import { expect } from "chai";
import { numberContext as ctx } from "../Interfaces";

describe("asNumeric", () => {
  it("wraps numbers correctly", () => {
    expect(ctx.zero).to.be.eq(0);
    expect(ctx.one).to.be.eq(1);
    expect(ctx.add(1, 2.5)).to.be.eq(3.5);
    expect(ctx.subtract(1, 2.5)).to.be.eq(-1.5);
    expect(ctx.multiply(2, 2.5)).to.be.eq(5);
    expect(ctx.divide(2.8, 2)).to.be.eq(1.4);
    expect(ctx.exp(1.4)).to.be.approximately(4.055, 0.001);
    expect(ctx.ln(1.4)).to.be.approximately(0.336, 0.001);
    expect(ctx.equals(1, 1)).to.be.true;
    expect(ctx.equals(1, 1.0001)).to.be.false;
  });
});
