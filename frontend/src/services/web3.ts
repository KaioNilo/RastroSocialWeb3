import { ethers } from 'ethers';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export const conectarWallet = async () => {
  if (!window.ethereum) {
    alert('MetaMask não instalado! Instale em https://metamask.io');
    return null;
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send('eth_requestAccounts', []);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    
    return { provider, signer, address };
  } catch (error) {
    console.error('Erro ao conectar:', error);
    return null;
  }
};

export const getProvider = () => {
  if (window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum);
  }
  return null;
};