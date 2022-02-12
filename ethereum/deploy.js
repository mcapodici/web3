var solc = require('solc');
var fs = require('fs');
var path = require('path');
var Web3 = require('web3');
var HDWalletProvider = require('@truffle/hdwallet-provider');

[_, __, mnemonic_phrase, provider_url] = process.argv;

// Example calling script:
//
// [localscripts/deploy.sh]
// node ../ethereum/deploy.js "buffalo buffalo buffalo buffalo buffalo buffalo buffalo buffalo buffalo buffalo buffalo buffalo" "https://rinkeby.infura.io/v3/0111111111111111111111111111111"

(async () => {

    var contractsSource = fs.readFileSync(path.join(__dirname, 'contracts', 'BankAccount.sol')).toString('utf8');

    var input = {
        language: 'Solidity',
        sources: {
            'BankAccount.sol': {
                content: contractsSource
            }
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*']
                }
            }
        }
    };

    var output = JSON.parse(solc.compile(JSON.stringify(input)));

    var contractObject = output.contracts['BankAccount.sol']['BankAccount'];
    var bytecode = contractObject.evm.bytecode.object;
    var abi = contractObject.abi;
    
    let provider = new HDWalletProvider({
        mnemonic: {
            phrase: mnemonic_phrase
        },
        providerOrUrl: provider_url
    });

    const web3 = new Web3(provider);
    const addresses = await web3.eth.getAccounts();
    const contract = new web3.eth.Contract(abi);

    const deployedContract = await contract.deploy({data: bytecode}).send({from: addresses[0], gas:'2000000'});
    console.log('abi');
    console.log(abi);
    console.log('deployed to ' + deployedContract.options.address);

})().catch(console.error);

