// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

import "prb-math/contracts/PRBMathUD60x18.sol";

contract PredictionMarket {
    using PRBMathUD60x18  for uint256;
  
    event AccountCreated(bytes32 indexed username, address originaladdress);
    event MarketCreated(address indexed useraddress, uint index);
    event MarketResolved(address indexed useraddress, uint index);
    event BetMade(address indexed marketCreatorAddress, uint indexed marketIndex, uint betIndex);
    // event Debug(string msg, uint val);

    uint constant tokenToBalance = 1e18; // And this has to match the math library!
    uint constant freeBalanceOnRegistration = tokenToBalance * 1000;
    uint constant minBalanceForPool = tokenToBalance * 10;
    uint constant minBetsize = tokenToBalance * 1;
  
    struct User {
      bytes32 username; // Username encoded in ascii maybe?
      uint balance; // Balances are implied 18 decimals
      bytes32 userinfoMultihash; // Link to find this on IPFS
      uint numberOfMarkets;
      mapping(uint => Market) markets; // Markets created by this user  
    }

    struct Market {
      uint pool;
      uint8 prob;
      bytes32 infoMultihash;
      uint numberOfBets;
      uint closesAt;
      bool resolved;
      mapping(uint => Bet) bets; // Bets placed on this market by any user
    }

    struct Bet {
      address useraddress;
      uint betsize;
      uint numberOfShares;
      uint8 outcome;
    }

    mapping(address => User) public users;
    mapping(bytes32 => address) public usernames;

    /// @notice User self-registration
    /// @param username ASCII encoded username
    /// @param userinfoMultihash The multihash for user profile content, using a v0 CID.
    /// @dev Further information on CIDS: https://docs.ipfs.io/concepts/content-addressing/#identifier-formats
    /// @dev Application-defined interpretation of how to make use of the data stored at the CID address.
    function register(bytes32 username, bytes32 userinfoMultihash) public {
        require(username != 0, "username required");
        require(usernames[username] == address(0), "username taken");
        require(users[msg.sender].username == 0, "already registered");

        User storage user = users[msg.sender];
        user.username = username;
        user.userinfoMultihash = userinfoMultihash;
        user.balance = freeBalanceOnRegistration;
        usernames[username] = msg.sender;

        emit AccountCreated(username, msg.sender);
    }

    /// @notice User existing user's info.
    /// @param userinfoMultihash The multihash for user profile content, using a v0 CID.
    /// @dev see "register()" dev notes about userinfoMultihash
    function updateUserInfo(bytes32 userinfoMultihash) public {
        User storage user = users[msg.sender];
        require(user.username != 0, "no user for this account"); // Yes they registered before (otherwise they should use register).
        user.userinfoMultihash = userinfoMultihash;
    }

    function getUser(address userAddress) public view returns (bytes32 username, uint balance, bytes32 userinfoMultihash, uint numberOfMarkets) {
      User storage user = users[userAddress];
      return (user.username, user.balance, user.userinfoMultihash, user.numberOfMarkets);      
    }

    function getMarket(address userAddress, uint index) public view returns (uint pool, uint8 prob, bytes32 infoMultihash, uint numberOfBets, uint closesAt) {
      Market storage market = users[userAddress].markets[index];
      return (market.pool, market.prob, market.infoMultihash, market.numberOfBets, market.closesAt);
    }

    function getBet(address userAddress, uint marketIndex, uint betIndex) public view returns (Bet memory) {
      Bet storage bet = users[userAddress].markets[marketIndex].bets[betIndex];
      return bet;
    }

    /// @notice creates a new market
    /// @param infoMultihash The multihash for market title and initial description, using a v0 CID.
    /// @param pool Amount of money to initialise the pool with
    /// @dev further commentary is handled off contract to be gas-efficient. Unfortunately IPNS seems so slow that it might
    /// @param closesAt the time (in EVM format, seconds since epoch) to stop taking bets on the market
    /// just have to be centralized for now.
    function createMarket(bytes32 infoMultihash, uint pool, uint8 prob, uint closesAt) public {
        User storage user = users[msg.sender];
        require(user.username != 0, "no user for this account");

        require(pool >= minBalanceForPool, "pool too small");
        require(prob >= 1 && prob <= 99, "prob out of range");
        require(user.balance >= pool, "insufficient balance");

        // Set up Market
        // =============
        Market storage market = user.markets[user.numberOfMarkets];
        user.numberOfMarkets ++;

        // Transaction >>>
        user.balance -= pool;        
        market.pool = pool;
        // <<< Transaction

        market.prob = prob;
        market.infoMultihash = infoMultihash;
        market.closesAt = closesAt;

        emit MarketCreated(msg.sender, user.numberOfMarkets - 1);
    }

    /// @notice place a bet on a market
    /// @param marketCreatorAddress the address of the user who created the market
    /// @param marketIndex the index of the market for the user who created it
    /// @param numberOfShares the number of shares to purchase (fixed 18 point)
    /// @param outcome currently only supports 0 = NO and 1 = YES
    function makeBet(address marketCreatorAddress, uint marketIndex, uint numberOfShares, uint8 outcome) public {
        User storage user = users[msg.sender];
        require(user.username != 0, "no user for this account");

        require(numberOfShares > 0, "number of shares invalid");
        require(outcome == 0 || outcome == 1, "outcome invalid");

        User storage markercreator = users[marketCreatorAddress];
        require(markercreator.username != 0, "invalid market");
        Market storage market =  markercreator.markets[marketIndex];
        require(market.pool != 0, "invalid market"); // 0 if market doesn't exist, if index is out of bounds.
        require(!market.resolved, "market resolved");
        require(market.closesAt > block.timestamp, "market closed");

        // Cost of shares Calculation >>
        uint sharesOfOther = tokenToBalance; // pool creator's share considered "1"
        uint moneyOnOutcome = 0;

        if (outcome == 0) {
          moneyOnOutcome = market.pool * market.prob / 100;
        } else {
          moneyOnOutcome = market.pool * (100 - market.prob) / 100;
        }

        for (uint i=0; i<market.numberOfBets; i++) {
          Bet storage betForAgg = market.bets[i];

          if (betForAgg.outcome == outcome) {
            moneyOnOutcome += betForAgg.betsize;
          } else {
            sharesOfOther += betForAgg.numberOfShares;
          }
        }

        // Based on http://dpennock.com/papers/pennock-ec-2004-dynamic-parimutuel.pdf 4.2.1 (7)
        uint betsize = moneyOnOutcome.div(sharesOfOther).mul(numberOfShares).mul(numberOfShares.div(sharesOfOther).exp());

        require(betsize >= minBetsize, "bet size too small");
        require(user.balance >= betsize, "insufficient balance");

        // << Cost of shares Calculation

        Bet memory bet;

        bet.useraddress = msg.sender;

        // Transaction >>>
        user.balance -= betsize;            
        bet.betsize = betsize;
        // <<< Transaction

        bet.numberOfShares = numberOfShares;
        bet.outcome = outcome;

        market.bets[market.numberOfBets] = bet;
        market.numberOfBets ++;

        emit BetMade(marketCreatorAddress, marketIndex, market.numberOfBets - 1);
    }

    /// @notice resolves a market
    /// @param marketIndex the index for the sending user of the market to resolve
    /// @param outcome the chosen outcome, 0 or 1
    function resolve(uint marketIndex, uint8 outcome) public {
        User storage user = users[msg.sender];
        require(user.username != 0, "no user for this account");

        Market storage market =  user.markets[marketIndex];
        require(market.pool != 0, "invalid market"); // 0 if market doesn't exist, if index is out of bounds.
        require(!market.resolved, "market resolved");

        uint sharesOfWinner = tokenToBalance;
        uint losingSideTotal = 0;
        uint poolTotal = market.pool;
        if (outcome == 0) {
          // emit Debug("market.pool", market.pool);
          // emit Debug("market.prob", market.prob);
          losingSideTotal = (market.pool * market.prob) / 100;
        } else {
          losingSideTotal = (market.pool * (100-market.prob)) / 100; 
        }

        // emit Debug("losingSideTotal", losingSideTotal);

        for (uint i=0; i < market.numberOfBets; i++) {
          Bet storage betForAgg = market.bets[i];
          // emit Debug("i", i);
          // emit Debug("betForAgg.numberOfShares", betForAgg.numberOfShares);
          // emit Debug("betForAgg.betsize", betForAgg.betsize);
          poolTotal += betForAgg.betsize;

          if (betForAgg.outcome == outcome) {
            // emit Debug("betForAgg.outcome == outcome", 1);
            sharesOfWinner += betForAgg.numberOfShares;
          } else {
            // emit Debug("betForAgg.outcome == outcome", 0);
            losingSideTotal + betForAgg.betsize;
          }
        }
        
        // emit Debug("losingSideTotal", losingSideTotal);
        // emit Debug("sharesOfWinner", sharesOfWinner);
        // emit Debug("poolTotal", poolTotal);

        uint paidOut = 0;

        // Perform payouts
        for (uint i=0; i<market.numberOfBets; i++) {
          Bet storage betForAgg = market.bets[i];

          if (betForAgg.outcome == outcome) {
            // emit Debug("i", i);
            // emit Debug("betForAgg.numberOfShares", betForAgg.numberOfShares);
            // emit Debug("betForAgg.numberOfShares.div(sharesOfWinner)", betForAgg.numberOfShares.div(sharesOfWinner));
            uint payout = betForAgg.numberOfShares.div(sharesOfWinner).mul(losingSideTotal) + betForAgg.betsize; // Return their bet, and a proportion of the losing pool
            // emit Debug("payout", payout);
            users[betForAgg.useraddress].balance += payout; // We don't do a transactional here, because it's a waste of gas. The market is set as resolved anyway.
            paidOut += payout;
            poolTotal -= payout;
          }
        }

        // Calculate the balance change using the remainder so that we don't create/destroy money because of rounding issues
        users[msg.sender].balance += poolTotal;

        market.resolved = true;

        emit MarketResolved(msg.sender, marketIndex);
    }
}