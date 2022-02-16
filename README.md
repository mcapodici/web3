# web3

Web 3 is my collection of examples where a website connects to the Ethereum network.

## Notes

### Initial creation of project

The project was created using [next.js](https://nextjs.org/docs/getting-started), initiated with the command: `npx create-next-app@latest --typescript`

TODO:

* Discriminate between no plugin vs. locked/ no accounts in no provider message.
* Add a link to try again.
* A neater way to display messages
* Detect if not on Rinkby since I don't want to deploy to all testnets or mainnet
* Detect when account has been changed on meta mask, or any meta-mask changes. It should go into lock status as soon as you log out for example.