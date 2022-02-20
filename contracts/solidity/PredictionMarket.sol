// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract PredictionMarket {
  
    event AccountCreated(bytes32 indexed username, address originaladdress);

    uint constant tokenToBalance = 1000000000000000000; // 18 DP.
    uint constant freeTokensOnRegistration = 10;
    uint constant freeBalanceOnRegistration = tokenToBalance * freeTokensOnRegistration;
    
    struct Multihash {
      bytes32 hash;
      uint8 hash_function;
      uint8 size;
    }

    struct User {
      bytes32 username; // Username encoded in ascii maybe?
      uint balance; // Balances are implied 18 decimals
      Multihash userinfo; // Link to find this on IPFS      
    }

    mapping(address => User) public users;
    mapping(bytes32 => address) public userNames;

    function register(bytes32 username, Multihash calldata userinfo) public {
        require(username != 0);
        require(userNames[username] == address(0));
        require(users[msg.sender].username == 0);

        User memory user;
        user.username = username;
        user.userinfo = userinfo;
        user.balance = freeBalanceOnRegistration;
        users[msg.sender] = user;
        userNames[username] = msg.sender;

        emit AccountCreated(username, msg.sender);
    }
}