// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title EnergyShare
 * @dev Tüketicilerin üreticilerden enerji almasını (token ile ödeme) sağlayan kontrat.
 */
contract EnergyShare {
    
    IERC20 public immutable token;
    uint256 public energyPrice;     

    event EnergyTransferred(
        address indexed consumer,    
        address indexed producer,    
        uint256 energyAmount,        
        uint256 tokenAmount          
    );

    /**
     * @dev Kontrat deploy edildiğinde çalışır.
     * @param tokenAddress Deploy ettiğimiz MyToken (SENRG) kontratının adresi.
     * @param price 1 birim enerjinin token bedeli.
     */
    constructor(address tokenAddress, uint256 price) {
        token = IERC20(tokenAddress); 
        energyPrice = price;          
    }

    /**
     * @dev Tüketicinin (msg.sender) üreticiden enerji almasını sağlar[cite: 17].
     * Bu fonksiyonun çalışması için, Tüketici'nin bu kontrata
     * (EnergyShare) önceden 'approve' (yetki) vermesi gerekir.
     * @param producer Enerjinin alınacağı üreticinin cüzdan adresi.
     * @param energyAmount Satın alınmak istenen enerji miktarı.
     */
    function transferEnergy(address producer, uint256 energyAmount) public {
        require(producer != address(0), "Uretici adresi gecersiz (0x0 olamaz)");
        require(energyAmount > 0, "Enerji miktari sifirdan buyuk olmali");

        uint256 tokenAmount = energyAmount * energyPrice;
        
        bool success = token.transferFrom(msg.sender, producer, tokenAmount);
        require(success, "Token transferi basarisiz! Yetersiz bakiye veya onay (allowance) yok.");

        emit EnergyTransferred(msg.sender, producer, energyAmount, tokenAmount);
    }
}