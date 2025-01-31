export const connectMetaMask = async () => {
  if (typeof window.ethereum === 'undefined') {
    throw new Error('MetaMask is not installed');
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    // Get the connected wallet address
    const address = accounts[0];
    
    // Setup event listeners for account changes
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        // Handle disconnection
        return null;
      }
      // Handle new account
      return accounts[0];
    });

    return address;
  } catch (error) {
    throw new Error('Failed to connect to MetaMask');
  }
}; 
