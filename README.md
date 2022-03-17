# web3

Web 3 is my collection of examples where a website connects to the Ethereum network.

You can see this live here: https://web3-mcapodici.vercel.app._

## Notes

### Node version

As this is deployed on Vercel, I use Node v14 locally for compatiability with that.

### Initial creation of project

The project was created using [next.js](https://nextjs.org/docs/getting-started), initiated with the command: `npx create-next-app@latest --typescript`

TODO:

* Smart contract - allow a 0.5 min bet so that a bet of 1 with LambertW fuzzyness goes through OK every time. Also need to store the resolution of a market, and expose that in the event and the getMarket method.
* Spinner at all points where you are waiting on a contract call.
* Refresh data after making a bet, after making a market, and resolving a market.
* When you load and metamask is locked you get console error "Already processing eth_requestAccounts. Please wait." and the UI says 'checking provider'
		* one thing to do is to detect that the ep has been found in web3.ts and then we know it is more likely to be a 'you gotta login' ard report that to the user
		* see what we can do regarding the error message (https://github.com/MetaMask/metamask-extension/issues/10085)
* Some kind of consistent waiting UI when you are creating a bank account or deposit etc. Maybe a neutral message with a spinner in it?
* Nice animation effect for changed balances