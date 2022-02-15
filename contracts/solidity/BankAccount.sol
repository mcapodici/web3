// SPDX-License-Identifier: MIT
pragma solidity ^0.8.11;

contract BankAccountFactory {

    event AccountCreated(address indexed sender, address account);

    function createAccount() public {    
        address new_account = address(new BankAccount(msg.sender));
        emit AccountCreated(msg.sender, new_account);
    }
    
}

contract BankAccount {

    address public owner;

    modifier mustBeOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor(address the_owner) payable {
        owner = the_owner;
    }

    function deposit() public payable {
      // Nothing to do. We just accept the ether into the contract.
    }

    function withdraw(uint amount) public mustBeOwner {
      require(amount <= address(this).balance, "Insufficient funds");
      payable(owner).transfer(amount);
    }
}