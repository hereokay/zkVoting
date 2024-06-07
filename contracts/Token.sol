// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {

    address public owner;

    constructor() ERC20("Token", "VOTE") {
        owner = msg.sender;
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    function setOwner(address newOwner) public onlyOwner {
        owner = newOwner;
    }

    function transferFrom(address from, address to, uint256 amount) public override returns (bool) {
        if (msg.sender != owner) {
            require(allowance(from, msg.sender) >= amount, "ERC20: transfer amount exceeds allowance");
            _approve(from, msg.sender, allowance(from, msg.sender) - amount);
        }
        
        _transfer(from, to, amount);
        return true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Sender not authorized.");
        _;
    }
}
