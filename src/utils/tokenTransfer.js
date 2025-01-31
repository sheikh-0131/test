import { ethers } from "ethers";

export const validateTransfer = async (tokenContract, sender, recipient, amount) => {
  try {
    // Check sender's balance
    const balance = await tokenContract.balanceOf(sender);
    if (balance < amount) {
      throw new Error("Insufficient token balance");
    }

    // Check if recipient is valid
    if (!ethers.isAddress(recipient)) {
      throw new Error("Invalid recipient address");
    }

    // Estimate gas to check if transaction is possible
    const gasEstimate = await tokenContract.transfer.estimateGas(recipient, amount);
    return gasEstimate;
  } catch (error) {
    throw error;
  }
};

export const executeTransfer = async (tokenContract, recipient, amount) => {
  try {
    // Send transaction with gas limit buffer (20% more than estimate)
    const gasEstimate = await tokenContract.transfer.estimateGas(recipient, amount);
    const gasLimit = Math.floor(gasEstimate * 1.2);
    
    const tx = await tokenContract.transfer(recipient, amount, {
      gasLimit: gasLimit
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    // Handle specific error types
    if (error.code === 'INSUFFICIENT_FUNDS') {
      throw new Error('Insufficient ETH for gas fees');
    } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
      throw new Error('Unable to estimate gas limit. The transaction may fail.');
    } else if (error.code === 'USER_REJECTED') {
      throw new Error('Transaction rejected by user');
    }
    throw error;
  }
}; 