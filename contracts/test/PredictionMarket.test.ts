import { config, expect, use } from 'chai';
import { Contract } from 'ethers';
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import { utils } from 'ethers';
import chaiSubset from 'chai-subset';
import PredictionMarket from '../build/PredictionMarket.json';
import BN from 'bn.js';
import { CID, MultihashDigest } from 'multiformats/cid';
import * as  Digest from 'multiformats/hashes/digest'

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

    it('succesful for registered user', async () => {
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

    it('unsuccesful for address without user', async () => {
      await expect(predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000000', '50')).to.be.reverted;
    });

    it('unsuccesful if pool size is more than their balance', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await expect(predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000001', '50')).to.be.reverted;
    });

    it('unsuccesful if pool size is too small', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await expect(predictionMarket.createMarket(testCIDMultihash2, '9' + '900000000000000000', '50')).to.be.reverted;
    });

    it('unsuccesful if probability out of range 1 - 99', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await expect(predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000000', '0')).to.be.reverted;
      await expect(predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000000', '100')).to.be.reverted;
    });

    it('emits market created events', async () => {
      await predictionMarket.register(username1, testCIDMultihash1);
      await predictionMarket.createMarket(testCIDMultihash2, '1000' + '000000000000000000', '50');
      const events = await predictionMarket.queryFilter({topics:[utils.id("MarketCreated(address,uint256)")]});
      expect(events).to.be.length(1);
      expect(events[0].args.useraddress).to.equal(wallet.address);
      expect(events[0].args.index).to.equal('0');
    });
  });
});