import BN from "bn.js";

/**
 * Convenience for creating a new BN
 * @param n THe number to convert
 * @returns A BN instance
 */
export function b(n: number | string | number[] | Uint8Array | Buffer | BN) {
  return new BN(n);
}

/**
 * Convenience for creating a new BNToken
 * @param sand THe number to convert
 * @returns A BN instance
 */
export function bt(
  sand: number | string | number[] | Uint8Array | Buffer | BN
) {
  return BNToken.fromSand(new BN(sand));
}

function isString(s: any) {
  return typeof s === "string" || s instanceof String;
}

/**
 * Converts a string representation of a decimal number into an integer representation to the given
 * precision. When precicion is 18 this is an ether to wei converter.
 * @param value The string value to convert e.g. '1.3'
 * @param decimals The number of decimals represented in the BN. Typically 18, for example for wei.
 * @returns A BN integer representing the passed in decimal value.
 */
export function toBaseUnit(value: string, decimals: number) {
  if (!isString(value)) {
    throw new Error("Pass strings to prevent floating point precision issues.");
  }
  const ten = new BN(10);
  const base = ten.pow(new BN(decimals));

  // Is it negative?
  let negative = value.substring(0, 1) === "-";
  if (negative) {
    value = value.substring(1);
  }

  if (value === ".") {
    throw new Error(
      `Invalid value ${value} cannot be converted to` +
        ` base unit with ${decimals} decimals.`
    );
  }

  // Split it into a whole and fractional part
  let comps = value.split(".");
  if (comps.length > 2) {
    throw new Error("Too many decimal points");
  }

  let whole = comps[0],
    fraction = comps[1];

  if (!whole) {
    whole = "0";
  }
  if (!fraction) {
    fraction = "0";
  }
  if (fraction.length > decimals) {
    // Truncate
    fraction = fraction.slice(0, decimals);
  }

  while (fraction.length < decimals) {
    fraction += "0";
  }

  const wholeBN = new BN(whole);
  const fractionBN = new BN(fraction);
  let wei = wholeBN.mul(base).add(fractionBN);

  if (negative) {
    wei = wei.mul(new BN("-1"));
  }

  return new BN(wei.toString(10), 10);
}

/** A wrapper for BN to denote that this BN represents
 * a single piece of sand (10**-18) of a token. Numbers
 * of this format are used by the contract calls for token
 * amounts.
 */
export class BNToken {
  private sand: BN;
  private static NUM_DECIMALS = 18;

  private constructor(sand: BN) {
    this.sand = sand;
  }

  /** Create an instance from the human representation, for example
   * passing in 1 creates an instance representing 1 token.
   */
  static fromNumTokens(numTokens: string): BNToken {
    return new BNToken(toBaseUnit(numTokens, BNToken.NUM_DECIMALS));
  }

  /** Create an instance from the contract representation, for example
   * passing in 1000000000000000000 creates an instance representing 1 oken.
   */
  static fromSand(sand: BN): BNToken {
    return new BNToken(sand);
  }

  /** Returns the human representation, for example 1 token will be 1 */
  toNumTokens(numDecimals: number = BNToken.NUM_DECIMALS) {
    const sandString = this.sand
      .toString()
      .padStart(BNToken.NUM_DECIMALS + 1, "0");

    return (
      sandString.slice(0, sandString.length - BNToken.NUM_DECIMALS) +
      "." +
      sandString.slice(
        sandString.length - BNToken.NUM_DECIMALS,
        sandString.length - BNToken.NUM_DECIMALS + numDecimals
      )
    );
  }

  /** Returns the representation needed for contract interaction. For example
   * 1 token will be 1000000000000000000 sand.
   */
  asSand() {
    return this.sand;
  }
}
