// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract BankAccount {

    address public owner;

    modifier mustBeOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function deposit() public payable {
      // Nothing to do. We just accept the ether into the contract.
    }

    function withdraw(uint amount) public mustBeOwner {
      require(amount <= address(this).balance, "Insufficient funds");
      payable(owner).transfer(amount);
    }
}