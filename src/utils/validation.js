import { ethers } from "ethers";

export const validateEthereumAddress = (address) => {
  try {
    const checksumAddress = ethers.getAddress(address);
    return checksumAddress;
  } catch {
    return false;
  }
};

export const validateAndProcessAddresses = (addresses) => {
  const validAddresses = new Set();
  const errors = [];
  let lineNumber = 1;

  addresses.forEach((address) => {
    // Remove whitespace and check if empty
    const cleanAddress = address.trim();
    if (!cleanAddress) {
      errors.push(`Line ${lineNumber}: Empty address`);
    } else {
      const validAddress = validateEthereumAddress(cleanAddress);
      if (validAddress) {
        if (validAddresses.has(validAddress)) {
          errors.push(`Line ${lineNumber}: Duplicate address - ${cleanAddress}`);
        } else {
          validAddresses.add(validAddress);
        }
      } else {
        errors.push(`Line ${lineNumber}: Invalid Ethereum address - ${cleanAddress}`);
      }
    }
    lineNumber++;
  });

  return {
    validAddresses: Array.from(validAddresses),
    errors,
    totalProcessed: lineNumber - 1,
    validCount: validAddresses.size
  };
}; 