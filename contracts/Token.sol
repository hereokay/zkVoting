// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Token is ERC20 {

    address public owner;
    constructor()
        ERC20("Token", "VOTE")
    {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) public Ownable {
        _mint(to, amount);
    }

    function setOwner(address newOwner) public Ownable {
        owner = newOwner;
    }
    
      
    modifier Ownable()
    {
        require(msg.sender == owner, "Sender not authorized.");
        _;
    }

}