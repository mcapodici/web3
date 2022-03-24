import { expect } from "chai";
import {
  numberContext as ctx,
  createMarketCommonValidation as vali,
} from "../Interfaces";

describe("asNumeric", () => {
  it("maths correctly", () => {
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
    expect(ctx.lt(1, 1)).to.be.false;
    expect(ctx.lt(1, 1.0001)).to.be.true;
  });
});

describe("createMarketCommonValidation", () => {
  it("validates correctly", () => {
    expect(vali(ctx, undefined as any, undefined as any, undefined as any)).to.be.eq("outcomes is required");
    expect(vali(ctx, [], undefined as any, undefined as any)).to.be.eq("at least 2 outcomes are required");
    expect(vali(ctx, ["foo"], undefined as any, undefined as any)).to.be.eq("at least 2 outcomes are required");
    expect(vali(ctx, ["foo", "bah"], undefined as any, undefined as any)).to.be.eq("probabilities is required");
    expect(vali(ctx, ["foo", "bah"], [], undefined as any)).to.be.eq("outcome and probability vectors need to be the same length");
    expect(vali(ctx, ["foo", "bah"], [1,2], undefined as any)).to.be.eq("probabilities must add to 1");
    expect(vali(ctx, ["foo", "bah"], [-1,2], undefined as any)).to.be.eq("probabilities must all be non-negative");
    expect(vali(ctx, ["foo", "bah"], [.5,.5], undefined as any)).to.be.eq("liquidity is required");
    expect(vali(ctx, ["foo", "bah"], [.5,.5], 0)).to.be.eq("liquidity is required");
    expect(vali(ctx, ["foo", "bah"], [.5,.5], -3)).to.be.eq("liquidity must be positive");
    expect(vali(ctx, ["foo", "bah"], [.5,.5], 3)).to.be.undefined;
    expect(vali(ctx, ["foo", "bah", "baz"], [.5,.3,.2], 5)).to.be.undefined;
    expect(vali(ctx, ["foo", "bah", "baz"], [.5,.5,0 ], 5)).to.be.undefined;
  });
});
