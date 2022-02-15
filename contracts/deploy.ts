import Web3 from 'web3';
import HDWalletProvider from '@truffle/hdwallet-provider';
import bankAccountFactoryMetaData from './build/BankAccountFactory.json';
import { AbiItem } from 'web3-utils';
import dotEnv from 'dotenv';

dotEnv.config();
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
    const contract = new web3.eth.Contract(bankAccountFactoryMetaData.abi as AbiItem[]);

    const deployedContract = await contract.deploy({data: bankAccountFactoryMetaData.evm.bytecode.object}).send({from: addresses[0], gas: 2000000});
    console.log('deployed to ' + deployedContract.options.address);

})().catch(console.error);

