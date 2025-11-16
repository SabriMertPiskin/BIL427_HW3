// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol"; 

contract MyToken is ERC20, ERC20Burnable, Ownable {//in order standart, burn, mint

    address private _taxWallet;

    constructor(address taxWalletAddress) 
        ERC20("Sabri Energy", "SENRG") 
    {
        require(taxWalletAddress != address(0), "Tax wallet cannot start with 0x0 ");
        _taxWallet = taxWalletAddress;
        
        uint256 initialSupply = 1000000;
        _mint(msg.sender, initialSupply * (10**decimals()));
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
    
    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal override {
        if (to == _taxWallet || from == _taxWallet) {
            super._transfer(from, to, amount);
            return;
        }

        uint256 taxAmount = (amount * 1) / 100;
        uint256 transferAmount = amount - taxAmount;

        super._transfer(from, to, transferAmount);
        
        if (taxAmount > 0) {
            super._transfer(from, _taxWallet, taxAmount);
        }
    }
}