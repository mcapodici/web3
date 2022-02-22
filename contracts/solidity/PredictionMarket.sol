// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract PredictionMarket {
  
    event AccountCreated(bytes32 indexed username, address originaladdress);
    event MarketCreated(address indexed useraddress, uint index);

    uint constant tokenToBalance = 1000000000000000000; // 18 DP.
    uint constant freeBalanceOnRegistration = tokenToBalance * 1000;
    uint constant minBalanceForPool = tokenToBalance * 10;
  
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
    }

    mapping(address => User) public users;
    mapping(bytes32 => address) public usernames;

    /// @notice User self-registration
    /// @param username ASCII encoded username
    /// @param userinfoMultihash The multihash for user profile content, using a v0 CID.
    /// @dev Further information on CIDS: https://docs.ipfs.io/concepts/content-addressing/#identifier-formats
    /// @dev Application-defined interpretation of how to make use of the data stored at the CID address.
    function register(bytes32 username, bytes32 userinfoMultihash) public {
        require(username != 0);
        require(usernames[username] == address(0));
        require(users[msg.sender].username == 0);

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
        require(user.username != 0); // Yes they registered before (otherwise they should use register).
        user.userinfoMultihash = userinfoMultihash;
    }

    function getMarket(address userAddress, uint index) public view returns (Market memory) {
      return users[userAddress].markets[index];
    }

    /// @notice creates a new market
    /// @param infoMultihash The multihash for market title and initial description, using a v0 CID.
    /// @param pool Amount of money to initialise the pool with
    /// @dev further commentary is handled off contract to be gas-efficient. Unfortunately IPNS seems so slow that it might
    /// just have to be centralized for now.
    function createMarket(bytes32 infoMultihash, uint pool, uint8 prob) public {
        User storage user = users[msg.sender];
        require(user.username != 0);

        require(pool >= minBalanceForPool);
        require(prob >= 1 && prob <= 99);
        require(user.balance >= pool);

        // Set up Market
        // =============
        Market memory market;

        // Transaction >>>
        user.balance -= pool;        
        market.pool = pool;
        // <<< Transaction
        market.prob = prob;
        market.infoMultihash = infoMultihash;

        user.markets[user.numberOfMarkets] = market;
        user.numberOfMarkets ++;

        emit MarketCreated(msg.sender, user.numberOfMarkets - 1);
    }

}