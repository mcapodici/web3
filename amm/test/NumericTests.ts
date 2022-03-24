import { expect } from "chai";
import { asNumeric as n } from "../Interfaces";

describe("asNumeric", () => {
  it("wraps numbers correctly", () => {
    const wrapped = n(1.4);
    expect(wrapped.unwrap()).to.be.eq(1.4);
    expect(wrapped.add(n(1)).unwrap()).to.be.eq(2.4);
    expect(wrapped.negate().unwrap()).to.be.eq(-1.4);
    expect(wrapped.multiply(n(2)).unwrap()).to.be.eq(2.8);
    expect(wrapped.divide(n(2)).unwrap()).to.be.eq(0.7);
    expect(wrapped.exp(n(2)).unwrap()).to.be.approximately(4.055, 0.001);
    expect(wrapped.ln(n(2)).unwrap()).to.be.approximately(0.336, 0.001);
  });
});
