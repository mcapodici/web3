import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import { AbiItem } from 'web3-utils';
import dotEnv from 'dotenv';

dotEnv.config();
const args = process.argv.slice(2);

if (!args[0]) {
    console.log('Usage: deploy CONTRACTNAME');
    process.exit(1);
}

const metaData = require(`./build/${args[0]}.json`)
const mnemonic_phrase = process.env.MNEMONIC_PHRASE;
const provider_url = process.env.PROVIDER_URL;

(async () => {
    
    let provider = new HDWalletProvider({
        mnemonic: {
            phrase: mnemonic_phrase
        },
        providerOrUrl: provider_url
    });

    const web3 = new Web3(provider);
    const addresses = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(metaData.abi as AbiItem[]);

    const deployedContract = await contract.deploy({data: metaData.evm.bytecode.object}).send({from: addresses[0], gas: 3000000});
    console.log('deployed to ' + deployedContract.options.address);

})().catch(console.error);

