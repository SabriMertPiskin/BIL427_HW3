const MyToken = artifacts.require("MyToken");
const EnergyShare = artifacts.require("EnergyShare");

module.exports = async function(deployer, network, accounts) {
    
    const taxWallet = accounts[2];//tax account belirler 

    await deployer.deploy(MyToken, taxWallet); 
    
    const token = await MyToken.deployed();
    console.log("MyToken deployed to:", token.address);
    console.log("Tax Wallet set to:", taxWallet);

    const energyPrice = "10000000000000000000";//energy price belirler
    
    await deployer.deploy(EnergyShare, token.address, energyPrice);
    
    const energyShare = await EnergyShare.deployed();
    console.log("EnergyShare deployed to:", energyShare.address);
};