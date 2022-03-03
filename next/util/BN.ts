import BN from 'bn.js';

export function toNumberOfTokens(raw: BN) {
    return raw.div(new BN('1000000000000000000'))
}