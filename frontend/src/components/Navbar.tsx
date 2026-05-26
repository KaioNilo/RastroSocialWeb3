import { Link } from 'react-router-dom';
import { useState } from 'react';

interface NavbarProps {
  onLogin?: (endereco: string) => void;
}

const Navbar = ({ onLogin }: NavbarProps) => {
  const [conectando, setConectando] = useState(false);

  const handleConectar = async () => {
    if (!window.ethereum) {
      alert('MetaMask não instalado! Instale em https://metamask.io');
      window.open('https://metamask.io', '_blank');
      return;
    }

    setConectando(true);
    try {
      const provider = (window as any).ethereum;
      await provider.request({ method: 'eth_requestAccounts' });
      const accounts = await provider.request({ method: 'eth_accounts' });
      if (accounts.length > 0 && onLogin) {
        onLogin(accounts[0]);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
      alert('Erro ao conectar com MetaMask. Tente novamente.');
    } finally {
      setConectando(false);
    }
  };

  return (
    <nav className="bg-[#6C48DB] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 mb-3">
          <img 
            src="https://res.cloudinary.com/dbgkgdeex/image/upload/v1779811292/logoRastroSocial_ouw4aw.png" 
            alt="Rastro Social Logo"
            className="h-10"
          />
        </Link>

        {/* Menu Desktop */}
        <div className="hidden md:flex space-x-8">
          <Link to="/" className="text-white hover:text-gray-300 transition">Início</Link>
          <Link to="/acoes" className="text-white hover:text-gray-300 transition">Ações</Link>
          <Link to="/relatorios" className="text-white hover:text-gray-300 transition">Relatórios</Link>
        </div>

        {/* Conectar Wallet */}
        <div className='flex space-x-5 items-center'>
          <p className="text-white">Área ONG</p>
          <button
            onClick={handleConectar}
            disabled={conectando}
            className="bg-white text-[#6C48DB] px-4 py-2 rounded-lg hover:bg-[#02E057] transition hover:text-white flex items-center space-x-2 disabled:opacity-50 font-medium"
          >
            <span className="text-lg">🦊</span>
            <span>{conectando ? 'Conectando...' : 'Conectar MetaMask'}</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;