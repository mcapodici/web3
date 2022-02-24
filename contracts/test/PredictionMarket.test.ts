import { config, expect, use } from 'chai';
import { Contract } from 'ethers';
import { BigNumber } from 'ethers';
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import { utils } from 'ethers';
import chaiSubset from 'chai-subset';
import PredictionMarket from '../build/PredictionMarket.json';
import { CID } from 'multiformats/cid';
import * as RefM from './ReferenceMarket';

use(chaiSubset);
use(solidity);

config.truncateThreshold = 0;

const username1 = '0x0000000000000000000000000000000000000000000000000000000074657374';
const username2 = '0x0000000000000000000000000000000000000000000000000000000074657375';

// Not strictly necessary fo the tests to use CID, but like to keep it here as a 'proof' that the contract
// can interact with a CID
const getMultihashForContract = (cid: CID) => '0x' + Buffer.from(cid.multihash.digest).toString('hex');
const testCID1 = CID.parse('QmSYuMAoJTNwDvH6pHCgHEgR5RvPr6fV7h6QDVHbdSGrGq');
const testCIDMultihash1 = getMultihashForContract(testCID1);
const testCID2 = CID.parse('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
const testCIDMultihash2 = getMultihashForContract(testCID2);

describe('PredictionMarket contract', () => {

  describe('cid encoding', () => {
    it('works - proof of concept', () => {
      // Prove that we can go back from testCIDMultihash1 to the CID
      const mutlihashBytes = Uint8Array.from(Buffer.from(testCIDMultihash1.substr(2), 'hex'));
      const headerBytes = Uint8Array.from([0x12, 0x20]);
      const bytes = new Uint8Array(34);
      bytes.set(headerBytes);
      bytes.set(mutlihashBytes, 2);
      const testCIDMultihash1FromStoredData = CID.decode(bytes);
      expect(testCIDMultihash1FromStoredData.toString()).to.equal(testCID1.toString());
    })
  })

  describe('user registration', () => {
    const [wallet, wallet2] = new MockProvider().getWallets();
    let predictionMarket: Contract;

    beforeEach(async () => {
      predictionMarket = await deployContract(wallet, PredictionMarket, []);
    });

    it('allows registration', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);

      const userFromCall = await predictionMarket.users(wallet.address);
      expect(userFromCall.username, 'username').to.equal(username1);
      expect(userFromCall.balance.toString()).to.equal('1000' + '000000000000000000'); // 1000 Tokens
      expect(userFromCall.userinfoMultihash).to.equal(testCIDMultihash1);

      const addressFromCall = await predictionMarket.usernames(username1);
      expect(addressFromCall).to.equal(wallet.address);
    });

    it('forbids registering the same address again', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await expect(predictionMarket.register(username1, testCIDMultihash1)).to.be.reverted;
    });

    it('forbids registering the same username again', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await expect(predictionMarketW2.register(username1, testCIDMultihash1)).to.be.reverted;
    });

    it('allows registration of another user if just username is different', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await expect(predictionMarketW2.register(username2, testCIDMultihash1)).to.not.be.reverted;
    });

    it('forbids registering with zero username', async () => {
      await expect(predictionMarket.register('0x0000000000000000000000000000000000000000000000000000000000000000', testCIDMultihash1)).to.be.reverted;
    });

    it('emits registration events', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await predictionMarketW2.register(username2, testCIDMultihash1);
      const events = await predictionMarketW2.queryFilter({});
      expect(events).to.be.length(2);
      expect(events[0].args).to.containSubset({ username: username1, originaladdress: wallet.address });
      expect(events[1].args).to.containSubset({ username: username2, originaladdress: wallet2.address });
    });
  });

  describe('updateUserInfo', () => {
    const [wallet] = new MockProvider().getWallets();
    let predictionMarket: Contract;

    beforeEach(async () => {
      predictionMarket = await deployContract(wallet, PredictionMarket, []);
    });

    it('works for an existing user', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await predictionMarket.updateUserInfo(testCIDMultihash2);
      const userFromCall = await predictionMarket.users(wallet.address);
      expect(userFromCall.userinfoMultihash).to.equal(testCIDMultihash2);
    });

    it('fails for a userless account', async () => {
      await expect(predictionMarket.updateUserInfo(testCIDMultihash2)).to.be.reverted;
    });
  });

  describe('market creation', () => {
    const [wallet, wallet2] = new MockProvider().getWallets();
    let predictionMarket: Contract;

    beforeEach(async () => {
      predictionMarket = await deployContract(wallet, PredictionMarket, []);
    });

    it('successful for registered user', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await predictionMarket.createMarket(testCIDMultihash2, '300' + '000000000000000000', '50');
      const market = await predictionMarket.getMarket(wallet.address, 0);
      expect(market.pool).to.equal('300' + '000000000000000000');
      expect(market.prob).to.equal(50);
      expect(market.infoMultihash).to.equal(testCIDMultihash2);
      const userFromCall = await predictionMarket.users(wallet.address);
      expect(userFromCall.numberOfMarkets).to.equal('1');
      expect(userFromCall.balance.toString()).to.equal('700' + '000000000000000000'); // 700 Tokens left, having sent 300 to this pool
    });

    it('indexes correctly for second market for a user', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await predictionMarket.createMarket(testCIDMultihash2, '20' + '000000000000000000', '50');
      await predictionMarket.createMarket(testCIDMultihash2, '30' + '000000000000000000', '40');
      const market1 = await predictionMarket.getMarket(wallet.address, 0);
      expect(market1.pool).to.equal('20' + '000000000000000000');
      expect(market1.prob).to.equal(50);
      const market2 = await predictionMarket.getMarket(wallet.address, 1);
      expect(market2.pool).to.equal('30' + '000000000000000000');
      expect(market2.prob).to.equal(40);
      const userFromCall = await predictionMarket.users(wallet.address);
      expect(userFromCall.numberOfMarkets).to.equal('2');
      expect(userFromCall.balance.toString()).to.equal('950' + '000000000000000000'); // 950 Tokens left, having sent 50 to these pools
    });

    it('unsuccessful for address without user', async () => {
      await expect(predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000000', '50')).to.be.reverted;
    });

    it('unsuccessful if pool size is more than their balance', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await expect(predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000001', '50')).to.be.reverted;
    });

    it('unsuccessful if pool size is too small', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await expect(predictionMarket.createMarket(testCIDMultihash2, '9' + '900000000000000000', '50')).to.be.reverted;
    });

    it('unsuccessful if probability out of range 1 - 99', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await expect(predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000000', '0')).to.be.reverted;
      await expect(predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000000', '100')).to.be.reverted;
    });

    it('emits market created events', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000000', '50');
      const events = await predictionMarket.queryFilter({ topics: [utils.id("MarketCreated(address,uint256)")] });
      expect(events).to.be.length(1);
      expect(events[0].args.useraddress).to.equal(wallet.address);
      expect(events[0].args.index).to.equal('0');
    });
  });

  describe('bet creation', () => {
    const [wallet, wallet2] = new MockProvider().getWallets();
    let predictionMarket: Contract;
    const marketWalletAddress = wallet.address;
    let refPool: RefM.Pool;

    beforeEach(async () => {
      predictionMarket = await deployContract(wallet, PredictionMarket, []);
      await predictionMarket.register(username1, testCIDMultihash1);
      await predictionMarket.createMarket(testCIDMultihash2, '300' + '000000000000000000', '50');
      refPool = RefM.initPool(300, 0.5);
    });

    it('successful with correct parameters', async () => {
      await predictionMarket.makeBet(marketWalletAddress, 0, '10' + '000000000000000000', 0);
      const bet = await predictionMarket.getBet(wallet.address, 0, 0);
      expect(bet.useraddress).to.equal(wallet.address);
      expect(bet.betsize).to.equal('10' + '000000000000000000');
      expect(bet.numberOfShares).to.equal('13966410658722218550');
      expect(bet.outcome).to.equal(0);
      const userFromCall = await predictionMarket.users(wallet.address);
      expect(userFromCall.balance.toString()).to.equal('690' + '000000000000000000'); // 690 Tokens left, having put 300 in the pool, and 10 on the bet.
      const market = await predictionMarket.getMarket(wallet.address, 0);
      expect(market.numberOfBets).to.equal(1);
    });


    it('gives you less on the subsequent bets', async () => {
      await predictionMarket.makeBet(marketWalletAddress, 0, '10' + '000000000000000000', 0);
      await predictionMarket.makeBet(marketWalletAddress, 0, '10' + '000000000000000000', 0);
      await predictionMarket.makeBet(marketWalletAddress, 0, '10' + '000000000000000000', 0);
      const bet1 = await predictionMarket.getBet(wallet.address, 0, 0);
      const bet2 = await predictionMarket.getBet(wallet.address, 0, 1);
      const bet3 = await predictionMarket.getBet(wallet.address, 0, 2);
      expect(bet1.numberOfShares).to.equal('13966410658722218550');
      expect(bet2.numberOfShares).to.equal('13119426187550909100');
      expect(bet3.numberOfShares).to.equal('12369324028795941150');
      
      // Sanity check hard coded numbers against reference implementation
      RefM.bet(refPool, 'trader', 0, 10);
      RefM.bet(refPool, 'trader', 0, 10);
      RefM.bet(refPool, 'trader', 0, 10);
      expect(bet1.numberOfShares).to.be.closeTo(Math.floor(refPool.bets[0].shares * 10 ** 18).toString(), 10000);
      expect(bet2.numberOfShares).to.be.closeTo(Math.floor(refPool.bets[1].shares * 10 ** 18).toString(), 10000);
      expect(bet3.numberOfShares).to.be.closeTo(Math.floor(refPool.bets[2].shares * 10 ** 18).toString(), 10000);
    });

    it('passes gas usage regression test', async () => {
      const before = await wallet.getBalance();
      await predictionMarket.makeBet(marketWalletAddress, 0, '10' + '000000000000000000', 0);
      const after = await wallet.getBalance();
      const gasEth = before.sub(after);
      expect(gasEth).to.be.lt(BigNumber.from('400000000000000')); // 0.0004 ETH
    });

    it('unsuccessful for address without user', async () => {
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await expect(predictionMarket.makeBet(predictionMarketW2, 0, '1000' + '000000000000000000', 0)).to.be.reverted;
    });

    it('unsuccessful if pool size is more than their balance', async () => {
      await expect(predictionMarket.makeBet(marketWalletAddress, 0, '1000' + '000000000000000001', 0)).to.be.reverted;
    });

    it('unsuccessful if pool size is too small', async () => {
      await expect(predictionMarket.makeBet(marketWalletAddress, 0, '9' + '90000000000000000', 0)).to.be.reverted;
    });

    it('unsuccessful if outcome is out of bounds (should be 0 or 1)', async () => {
      await expect(predictionMarket.makeBet(marketWalletAddress, 0, '10' + '000000000000000000', 2)).to.be.reverted;
    });

    it('unsuccessful if market user does not exist', async () => {
      await expect(predictionMarket.makeBet(wallet2.address, 1, '10' + '000000000000000000', 0)).to.be.reverted;
    });

    it('unsuccessful if market does not exist for legit user', async () => {
      await expect(predictionMarket.makeBet(marketWalletAddress, 1, '10' + '000000000000000000', 2)).to.be.reverted;
    });

    it('emits bet created events', async () => {
      await predictionMarket.makeBet(marketWalletAddress, 0, '10' + '000000000000000000', 0);
      const events = await predictionMarket.queryFilter({ topics: [utils.id("BetMade(address,uint256,uint256)")] });
      expect(events).to.be.length(1);
      expect(events[0].args.marketCreatorAddress).to.equal(wallet.address);
      expect(events[0].args.marketIndex).to.equal('0');
      expect(events[0].args.betIndex).to.equal('0');
    });
  });
});