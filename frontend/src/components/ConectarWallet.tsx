import { useState } from 'react';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const ConectarWallet = () => {
  const [endereco, setEndereco] = useState<string | null>(null);
  const [conectando, setConectando] = useState(false);

  const formatarEndereco = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleConectar = async () => {
    if (!window.ethereum) {
      alert('MetaMask não instalado! Instale em https://metamask.io');
      window.open('https://metamask.io', '_blank');
      return;
    }

    setConectando(true);
    try {
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      if (accounts.length > 0) {
        setEndereco(accounts[0]);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      alert('Erro ao conectar com MetaMask. Tente novamente.');
    } finally {
      setConectando(false);
    }
  };

  return (
    <button
      onClick={handleConectar}
      disabled={conectando}
      className="bg-white text-[#6C48DB] px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center space-x-2 disabled:opacity-50 font-medium"
    >
      <span className="text-lg">🦊</span>
      <span>
        {conectando ? 'Conectando...' : (endereco ? formatarEndereco(endereco) : 'Conectar MetaMask')}
      </span>
    </button>
  );
};

export default ConectarWallet;