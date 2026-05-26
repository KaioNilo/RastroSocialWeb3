import { useState, useEffect } from 'react';

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
      const provider = new (window as any).ethereum();
      await provider.request({ method: 'eth_requestAccounts' });
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        setEndereco(accounts[0]);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
    } finally {
      setConectando(false);
    }
  };

  return (
    <button
      onClick={handleConectar}
      disabled={conectando}
      className="bg-[#00C04A] text-white px-4 py-2 rounded-lg hover:bg-[#0F7B38] transition flex items-center space-x-2 disabled:opacity-50"
    >
      <span className="text-lg">🦊</span>
      <span>
        {conectando ? 'Conectando...' : (endereco ? formatarEndereco(endereco) : 'Conectar MetaMask')}
      </span>
    </button>
  );
};

export default ConectarWallet;