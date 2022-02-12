import path from 'path';
import solc from 'solc';
import fs from 'fs-extra';

const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

const contractPath = path.resolve(__dirname, 'solidity', 'BankAccount.sol');
const source = fs.readFileSync(contractPath).toString('utf-8');

var input = {
    language: 'Solidity',
    sources: {
        'BankAccount.sol': {
            content: source
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

fs.ensureDirSync(buildPath);

const contracts = output.contracts['BankAccount.sol'];
for (let contract in contracts) {
    fs.outputJSONSync(
        path.resolve(buildPath, contract + '.json'),
        contracts[contract]
    )
}
