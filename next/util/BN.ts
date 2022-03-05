import BN from 'bn.js';

export function toNumberOfTokens(raw: BN) {
    return raw.div(new BN('1000000000000000000'))
}

/**
 * Convenience for creating a new BN
 * @param n THe number to convert
 * @returns A BN instance
 */
export function b(n: number | string | number[] | Uint8Array | Buffer | BN) {
    return new BN(n);
}