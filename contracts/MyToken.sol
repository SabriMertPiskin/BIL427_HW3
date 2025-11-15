// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MyToken
 * @dev Kendi ERC-20 token'ımızı oluşturan kontrat.
 * OpenZeppelin'in ERC20 kontratından kalıtım alır.
 */
contract MyToken is ERC20 {

    /**
     * @dev Kontrat deploy edildiğinde bir kereliğine çalışır.
     * Token'ın adını, sembolünü ve başlangıç arzını belirler.
     */
    constructor() ERC20("Sabri Energy", "SENRG") { // Token Adı ve Sembolü
        
        uint256 initialSupply = 1000000;        
        _mint(msg.sender, initialSupply * (10**decimals()));
    }
}