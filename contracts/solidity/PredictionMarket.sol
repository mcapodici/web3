// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract PredictionMarket {
  
    event AccountCreated(bytes32 indexed username, address originaladdress);

    uint constant tokenToBalance = 1000000000000000000; // 18 DP.
    uint constant freeTokensOnRegistration = 10;
    uint constant freeBalanceOnRegistration = tokenToBalance * freeTokensOnRegistration;
  
    struct User {
      bytes32 username; // Username encoded in ascii maybe?
      uint balance; // Balances are implied 18 decimals
      bytes32 userinfoMultihash; // Link to find this on IPFS      
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

        User memory user;
        user.username = username;
        user.userinfoMultihash = userinfoMultihash;
        user.balance = freeBalanceOnRegistration;
        users[msg.sender] = user;
        usernames[username] = msg.sender;

        emit AccountCreated(username, msg.sender);
    }
}