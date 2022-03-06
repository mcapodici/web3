declare module 'bn-chai'

declare module Chai 
{
    type BN = import('bn.js');

    export interface Equal 
    {
        BN(value: BN, message?: string): Assertion;
    }
}