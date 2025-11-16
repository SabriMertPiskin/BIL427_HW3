// frontend/src/App.js

import './App.css';
import { useState, useEffect } from 'react';
import { ethers } from 'ethers'; 

// ABIs
import MyTokenABI from './abis/MyToken.json';
import EnergyShareABI from './abis/EnergyShare.json';

const MY_TOKEN_ADDRESS = "0x7a988B158Bd66dd3925a91f27072b3f06Fa9bB83";
const ENERGY_SHARE_ADDRESS = "0x929FE2db42F9C95a8369e95e5a62309AfCFA205F";
// --------------------------

function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [shareContract, setShareContract] = useState(null);
  
  const [balance, setBalance] = useState("0");
  const [statusMessage, setStatusMessage] = useState("");
  const [energyPrice, setEnergyPrice] = useState("0"); 

  const [transferTo, setTransferTo] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [producer, setProducer] = useState("");
  const [energyAmount, setEnergyAmount] = useState("");

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner(); 
        const userAddress = await signer.getAddress();
        
        setAccount(userAddress);
        setSigner(signer);

        const token = new ethers.Contract(MY_TOKEN_ADDRESS, MyTokenABI.abi, signer);
        setTokenContract(token);

        const share = new ethers.Contract(ENERGY_SHARE_ADDRESS, EnergyShareABI.abi, signer);
        setShareContract(share);

        const price = await share.energyPrice();
        setEnergyPrice(price.toString());

      } catch (error) {
        console.error("Cüzdan bağlantı hatası:", error);
        setStatusMessage("Cüzdan bağlantı hatası!");
      }
    } else {
      alert("Lütfen MetaMask kurun!");
    }
  };

  const getBalance = async () => {
    if (tokenContract && account) {
      try {
        const userBalance = await tokenContract.balanceOf(account);
        setBalance(ethers.formatUnits(userBalance, 18)); // 18 decimal
      } catch (error) {
        console.error("Bakiye alınamadı:", error);
      }
    }
  };

  useEffect(() => {
    if (tokenContract && account) {
      getBalance();
    }
  }, [tokenContract, account, balance]); 


  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!tokenContract || !transferTo || !transferAmount) {
      alert("Tüm alanlar zorunludur.");
      return;
    }

    try {
      setStatusMessage(`Transfer ediliyor: ${transferAmount} SENRG -> ${transferTo}...`);
      const amountToSend = ethers.parseUnits(transferAmount, 18);
      
      const tx = await tokenContract.transfer(transferTo, amountToSend);
      await tx.wait();
      
      setStatusMessage("Transfer başarılı!");
      await getBalance();
      setTransferAmount("");
      setTransferTo("");
    } catch (error) {
      console.error("Transfer hatası:", error);
      setStatusMessage("Transfer hatası!");
    }
  };

  const handleBuyEnergy = async (e) => {
    e.preventDefault();
    if (!shareContract || !tokenContract || !producer || !energyAmount) {
      alert("Tüm alanlar zorunludur.");
      return;
    }

    try {
      const pricePerEnergy = ethers.parseUnits(energyPrice, "wei"); 
      const totalTokenAmount = pricePerEnergy * BigInt(energyAmount); 
      setStatusMessage(`Toplam Ödenecek: ${ethers.formatUnits(totalTokenAmount, 18)} SENRG`);

      setStatusMessage("Yetki veriliyor (Approve)...");
      const approveTx = await tokenContract.approve(ENERGY_SHARE_ADDRESS, totalTokenAmount);
      await approveTx.wait();
      setStatusMessage("Yetki verildi. Şimdi enerji transferi yapılıyor...");

      const buyTx = await shareContract.transferEnergy(producer, energyAmount); 
      await buyTx.wait();
      
      setStatusMessage("Enerji başarıyla satın alındı!");
      await getBalance(); 
      setProducer("");
      setEnergyAmount("");
    } catch (error) {
      console.error("Enerji satın alma hatası:", error);
      setStatusMessage("Enerji satın alma hatası!");
    }
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>Enerji Paylaşım (SENRG) DApp</h1>
        
        {account ? (
          <div>
            <p><strong>Cüzdan Adresiniz:</strong> {account}</p>
            <p><strong>SENRG Bakiyeniz:</strong> {parseFloat(balance).toFixed(4)} SENRG</p>
          </div>
        ) : (
          <button onClick={connectWallet}>MetaMask Cüzdanını Bağla</button>
        )}

        <hr />
        
        {/* BÖLÜM 1: STANDART TRANSFER */}
        <div className="card">
          <h2>1. SENRG Token Transferi</h2>
          <form onSubmit={handleTransfer}>
            <div>
              <label>Alıcı Adresi:</label>
              <input 
                type="text" 
                value={transferTo} 
                onChange={(e) => setTransferTo(e.target.value)} 
                placeholder="0x..."
              />
            </div>
            <div>
              <label>Miktar (SENRG):</label>
              <input 
                type="text" 
                value={transferAmount} 
                onChange={(e) => setTransferAmount(e.target.value)} 
                placeholder="100"
              />
            </div>
            <button type="submit">Gönder</button>
          </form>
        </div>

        {/* BÖLÜM 2: ENERJİ TRANSFERİ */}
        <div className="card">
          <h2>2. Enerji Satın Al</h2>
          <form onSubmit={handleBuyEnergy}>
            <div>
              <label>Üretici Adresi:</label>
              <input 
                type="text" 
                value={producer} 
                onChange={(e) => setProducer(e.target.value)} 
                placeholder="0x..."
              />
            </div>
            <div>
              <label>Enerji Miktarı (Birim):</label>
              <input 
                type="text" 
                value={energyAmount} 
                onChange={(e) => setEnergyAmount(e.target.value)} 
                placeholder="5"
              />
            </div>
            <p><i>1 Birim Enerji = {ethers.formatUnits(energyPrice, 18)} SENRG</i></p>
            <button type="submit">Enerji Satın Al (Approve + Transfer)</button>
          </form>
        </div>
        
        {statusMessage && <p className="status">{statusMessage}</p>}

      </header>
    </div>
  );
}

export default App;