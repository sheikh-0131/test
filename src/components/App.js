import "./App.css";
import Nav from "./Nav/Nav";
import TokenPart from "./Token/Token";
import SenderTable from "./Table";
import Transfer from "./Transfer/Transfer";
import ConnectWallet from "./ConnectWallet";
import Fee from "./Fee";
import Airdrop from "./Airdrop";
import "bootstrap/dist/css/bootstrap.min.css";
import { Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { RPC_URL, SECRET_KEY } from "./config";

// Replace the provider and senderWallet declarations with state variables
const [provider, setProvider] = useState(null);
const [signer, setSigner] = useState(null);

function App() {
  // State variables
  const [isConnected, setIsConnected] = useState(false); // Connection state
  const [tokenAddress, setTokenAddress] = useState("0xdAC17F958D2ee523a2206206994597C13D831ec7"); // ERC-20 token contract address
  const [wallets, setWallets] = useState([]); // List of recipient addresses
  const [walletAddress, setWalletAddress] = useState("");
  const [quantity, setQuantity] = useState(0); // Tokens to send per wallet
  const [fee, setFee] = useState(0); // Gas fee per transaction (not actively used for Ethereum)
  const [loading, setLoading] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState(0); // Sender's token balance

  // Fetch token balance of the sender's wallet
  useEffect(() => {
    if (tokenAddress) {
      getTokenBalance();
    }
  }, [tokenAddress]);

  const getTokenBalance = async () => {
    if (!provider || !walletAddress) {
      return;
    }

    try {
      const erc20ABI = [
        "function balanceOf(address account) external view returns (uint256)",
        "function decimals() view returns (uint8)",
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, provider);
      const decimals = await tokenContract.decimals();
      const balance = await tokenContract.balanceOf(walletAddress);
      setBalanceAmount(Number(ethers.formatUnits(balance, decimals)));
    } catch (error) {
      console.error("Error fetching token balance:", error);
      alert("Failed to fetch token balance. Check the token address and try again.");
    }
  };

  const handleConnect = async (connectionState, address) => {
    setIsConnected(connectionState);
    setWalletAddress(address);
    
    if (connectionState) {
      // Initialize ethers provider with MetaMask
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      const web3Signer = await web3Provider.getSigner();
      setSigner(web3Signer);
    } else {
      // Reset provider and signer when disconnected
      setProvider(null);
      setSigner(null);
    }
  };

  // Airdrop logic
  const handleAirdrop = async () => {
    if (!tokenAddress || wallets.length === 0 || quantity <= 0) {
      alert("Please fill in all parameters correctly!");
      return;
    }
    
    if (!signer) {
      alert("Please connect your wallet first!");
      return;
    }

    setLoading(true);
    try {
      const erc20ABI = [
        "function transfer(address to, uint256 value) public returns (bool)",
        "function decimals() view returns (uint8)",
      ];
      const tokenContract = new ethers.Contract(tokenAddress, erc20ABI, signer);
      const decimals = await tokenContract.decimals();
      const amount = ethers.parseUnits(quantity.toString(), decimals);

      for (let i = 0; i < wallets.length; i++) {
        const recipient = wallets[i];
        console.log(`Transferring ${quantity} tokens to ${recipient}...`);
        const tx = await tokenContract.transfer(recipient, amount);
        await tx.wait();
        console.log(`Successfully sent to ${recipient}`);
      }
      alert("Airdrop completed successfully!");
    } catch (error) {
      console.error("Airdrop failed:", error);
      alert("Airdrop failed! Check the console for more details.");
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          handleConnect(true, accounts[0]);
        }
      }
    };
    
    checkConnection();
  }, []);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          handleConnect(false, '');
        } else {
          handleConnect(true, accounts[0]);
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleConnect);
      }
    };
  }, []);

  return (
    <div className="App">
      <Nav />
      <div style={{ opacity: loading ? 0.5 : 1 }}>
        {loading && (
          <div className="d-flex justify-content-center align-items-center custom-loading">
            <Spinner animation="border" variant="primary" role="status" />
          </div>
        )}
        <div className="connectWallet">
          <ConnectWallet
            handleConnect={handleConnect}
            isConnected={isConnected}
            walletAddress={walletAddress}
          />
        </div>
        <div className="event">
          <SenderTable wallets={wallets} setWallets={setWallets} isConnected = {isConnected}/>
        </div>
        <div className="main">
          <TokenPart
            tokenaddress={tokenAddress}
            setTokenAddress={setTokenAddress}
            balanceAmount={balanceAmount}
          />
          <Transfer
            quantity={quantity}
            setQuantity={setQuantity}
            totalQuantity={wallets?.length ? wallets.length * quantity : 0}
            balanceAmount={balanceAmount}
          />
          <Fee
            fee={fee}
            setFee={setFee}
            totalFee={wallets?.length ? wallets.length * fee : 0}
          />
        </div>
        <div className="airdrop">
          <Airdrop
            isConnected={
              isConnected && wallets?.length
                ? wallets.length * quantity < balanceAmount
                : 0
            }
            handleAirdrop={handleAirdrop}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

export const checkAndSwitchNetwork = async (chainId) => {
  if (!window.ethereum) return;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error) {
    if (error.code === 4902) {
      // Chain not added, implement addChain logic here
      alert('Please add this network to your MetaMask');
    }
  }
};