import BN from 'bn.js';

export const sum = (vals: number[]) => vals.reduce((p, c) => p + c, 0);
export const sumBN = (vals: BN[]) => vals.reduce((p, c) => p.add(c), new BN(0));
