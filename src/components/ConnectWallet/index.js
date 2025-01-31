import React from 'react';
import Button from 'react-bootstrap/Button';
import { connectMetaMask } from '../../utils/metamask';

const ConnectWallet = ({ handleConnect, isConnected, walletAddress }) => {
  const connectWallet = async () => {
    try {
      if (!isConnected) {
        const address = await connectMetaMask();
        handleConnect(true, address);
      } else {
        handleConnect(false, '');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Button 
      onClick={connectWallet}
      variant={isConnected ? "success" : "primary"}
      className="d-flex align-items-center gap-2"
    >
      {isConnected ? (
        <>
          <span>Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
          <span>(Disconnect)</span>
        </>
      ) : (
        "Connect MetaMask"
      )}
    </Button>
  );
};

export default ConnectWallet;



