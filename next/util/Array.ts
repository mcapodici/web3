import BN from "bn.js";

export const sum = (vals: number[]) => vals.reduce((p, c) => p + c, 0);
export const sumBN = (vals: BN[]) => vals.reduce((p, c) => p.add(c), new BN(0));
export const sortACopy = <T>(arr: T[], compareFn: (a: T, b: T) => number) =>
  [...arr].sort(compareFn);

declare global {
  interface Array<T> {
    sortACopy(compareFn: (a: T, b: T) => number): Array<T>;
  }
}

Array.prototype.sortACopy = function <T>(compareFn: (a: T, b: T) => number) {
  return sortACopy<T>(this, compareFn);
};
