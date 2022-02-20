# web3

Web 3 is my collection of examples where a website connects to the Ethereum network.

You can see this live here: https://web3-mcapodici.vercel.app._

## Notes

### Initial creation of project

The project was created using [next.js](https://nextjs.org/docs/getting-started), initiated with the command: `npx create-next-app@latest --typescript`

TODO:

* Discriminate between no plugin vs. locked/ no accounts in no provider message.
* Add a link to try again.
* Detect if not on Rinkby since I don't want to deploy to all testnets or mainnet
* When you load and metamask is locked you get console error "Already processing eth_requestAccounts. Please wait." and the UI says 'checking provider'
		* one thing to do is to detect that the ep has been found in web3.ts and then we know it is more likely to be a 'you gotta login' ard report that to the user
		* see what we can do regarding the error message (https://github.com/MetaMask/metamask-extension/issues/10085)
* Some kind of consistent waiting UI when you are creating a bank account or deposit etc. Maybe a neutral message with a spinner in it?
* Nice animation effect for changed balances