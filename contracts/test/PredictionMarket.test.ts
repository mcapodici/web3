import { config, expect, use } from 'chai';
import { Contract } from 'ethers';
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import chaiSubset from 'chai-subset';
import PredictionMarket from '../build/PredictionMarket.json';
import BN from 'bn.js';

use(chaiSubset);
use(solidity);

config.truncateThreshold = 0;

const username1 = '0x0000000000000000000000000000000000000000000000000000000074657374';
const username2 = '0x0000000000000000000000000000000000000000000000000000000074657375';
const userInfo1 = { hash: '0x0000000000000000000000000000000000000000000000000000000000000000', hash_function: 0, size: 0 };

describe('PredictionMarket contract', () => {
  describe('user registration', () => {
    const [wallet, wallet2] = new MockProvider().getWallets();
    let predictionMarket: Contract;

    beforeEach(async () => {
      predictionMarket = await deployContract(wallet, PredictionMarket, []);
    });

    it('allows registration', async () => {
      await predictionMarket.register(username1, userInfo1);

      const userFromCall = await predictionMarket.users(wallet.address);
      expect(userFromCall.username, 'username').to.equal(username1);
      expect(userFromCall.balance.toString()).to.equal('10000000000000000000');
      expect(userFromCall.userinfo).to.containSubset(userInfo1);

      const addressFromCall = await predictionMarket.usernames(username1);
      expect(addressFromCall).to.equal(wallet.address);
    });

    it('forbids registering the same address again', async () => {
      await predictionMarket.register(username1, userInfo1);
      await expect(predictionMarket.register(username1, userInfo1)).to.be.reverted;
    });

    it('forbids registering the same username again', async () => {
      await predictionMarket.register(username1, userInfo1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await expect(predictionMarketW2.register(username1, userInfo1)).to.be.reverted;
    });

    it('allows registration of another user if just username is different', async () => {
      await predictionMarket.register(username1, userInfo1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await expect(predictionMarketW2.register(username2, userInfo1)).to.not.be.reverted;
    });

    it('forbids registering with zero username', async () => {
      await expect(predictionMarket.register('0x0000000000000000000000000000000000000000000000000000000000000000', userInfo1)).to.be.reverted;
    });

    it('emits registration events', async () => {
      await predictionMarket.register(username1, userInfo1);
      const predictionMarketW2 = predictionMarket.connect(wallet2);
      await predictionMarketW2.register(username2, userInfo1);
      const events = await predictionMarketW2.queryFilter({});
      expect(events).to.be.length(2);
      expect(events[0].args).to.containSubset({ username: username1, originaladdress: wallet.address });
      expect(events[1].args).to.containSubset({ username: username2, originaladdress: wallet2.address });
    });
  });
});