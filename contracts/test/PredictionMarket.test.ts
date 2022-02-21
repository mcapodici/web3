import { config, expect, use } from 'chai';
import { Contract } from 'ethers';
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
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
const userinfoCID1 = CID.parse('QmSYuMAoJTNwDvH6pHCgHEgR5RvPr6fV7h6QDVHbdSGrGq');
const userinfoMultihash1 = getMultihashForContract(userinfoCID1);
const userinfoCID2 = CID.parse('QmbWqxBEKC3P8tqsKc98xmWNzrzDtRLMiMPL8wBuTGsMnR');
const userinfoMultihash2 = getMultihashForContract(userinfoCID2);

describe('PredictionMarket contract', () => {

  describe('cid encoding', () => {
    it('works - proof of concept', () => {
      // Prove that we can go back from userinfoMultihash1 to the CID
      const mutlihashBytes = Uint8Array.from(Buffer.from(userinfoMultihash1.substr(2), 'hex'));
      const headerBytes = Uint8Array.from([0x12, 0x20]);
      const bytes = new Uint8Array(34);
      bytes.set(headerBytes);
      bytes.set(mutlihashBytes, 2);
      const userinfoMultihash1FromStoredData = CID.decode(bytes);
      expect(userinfoMultihash1FromStoredData.toString()).to.equal(userinfoCID1.toString());
    })
  })

  describe('user registration', () => {
    const [wallet, wallet2] = new MockProvider().getWallets();
    let predictionMarket: Contract;

    beforeEach(async () => {
      predictionMarket = await deployContract(wallet, PredictionMarket, []);
    });

    it('allows registration', async () => {
      await predictionMarket.register(username1, userinfoMultihash1);

      const userFromCall = await predictionMarket.users(wallet.address);
      expect(userFromCall.username, 'username').to.equal(username1);
      expect(userFromCall.balance.toString()).to.equal('1000' + '000000000000000000'); // 1000 Tokens
      expect(userFromCall.userinfoMultihash).to.equal(userinfoMultihash1);

      const addressFromCall = await predictionMarket.usernames(username1);
      expect(addressFromCall).to.equal(wallet.address);
    });

    it('forbids registering the same address again', async () => {
      await predictionMarket.register(username1, userinfoMultihash1);
      await expect(predictionMarket.register(username1, userinfoMultihash1)).to.be.reverted;
    });

    it('forbids registering the same username again', async () => {
      await predictionMarket.register(username1, userinfoMultihash1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await expect(predictionMarketW2.register(username1, userinfoMultihash1)).to.be.reverted;
    });

    it('allows registration of another user if just username is different', async () => {
      await predictionMarket.register(username1, userinfoMultihash1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await expect(predictionMarketW2.register(username2, userinfoMultihash1)).to.not.be.reverted;
    });

    it('forbids registering with zero username', async () => {
      await expect(predictionMarket.register('0x0000000000000000000000000000000000000000000000000000000000000000', userinfoMultihash1)).to.be.reverted;
    });

    it('emits registration events', async () => {
      await predictionMarket.register(username1, userinfoMultihash1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await predictionMarketW2.register(username2, userinfoMultihash1);
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
      await predictionMarket.register(username1, userinfoMultihash1);
      await predictionMarket.updateUserInfo(userinfoMultihash2);
      const userFromCall = await predictionMarket.users(wallet.address);
      expect(userFromCall.userinfoMultihash).to.equal(userinfoMultihash2);
    });

    it('fails for a userless account', async () => {
      await expect(predictionMarket.updateUserInfo(userinfoMultihash2)).to.be.reverted;
    });
  });
});