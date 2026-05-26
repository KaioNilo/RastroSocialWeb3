import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Footer from '../components/Footer';

interface LayoutOngProps {
  endereco: string;
  onDesconectar: () => void;
}

const LayoutOng = ({ endereco, onDesconectar }: LayoutOngProps) => {
  const navigate = useNavigate();
  const [saldo, setSaldo] = useState<string>('0');
  const [carregandoSaldo, setCarregandoSaldo] = useState(true);

  useEffect(() => {
    const carregarSaldo = async () => {
      try {
        if (window.ethereum && endereco) {
          const balance = await window.ethereum.request({
            method: 'eth_getBalance',
            params: [endereco, 'latest']
          });
          const ethBalance = (parseInt(balance) / 1e18).toFixed(4);
          setSaldo(ethBalance);
        }
      } catch (error) {
        console.error('Erro ao carregar saldo:', error);
      } finally {
        setCarregandoSaldo(false);
      }
    };
    if (endereco) carregarSaldo();
  }, [endereco]);

  const formatarEndereco = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar da Área ONG */}
      <nav className="bg-[#6C48DB] shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          {/* Logo */}
          <Link to="/ong" className="flex items-center space-x-2 mb-3">
            <img 
              src="https://res.cloudinary.com/dbgkgdeex/image/upload/v1779811292/logoRastroSocial_ouw4aw.png" 
              alt="Rastro Social Logo"
              className="h-10"
            />
          </Link>

          {/* Menu Desktop */}
          <div className="hidden md:flex space-x-8">
            <Link to="/ong" className="text-white hover:text-gray-300 transition">Dashboard</Link>
            <Link to="/ong/acoes" className="text-white hover:text-gray-300 transition">Ações</Link>
            <Link to="/ong/registrar" className="text-white hover:text-gray-300 transition">Registrar Ação</Link>
            <Link to="/ong/relatorios" className="text-white hover:text-gray-300 transition">Relatórios</Link>
          </div>

          {/* Info da carteira e botão Sair */}
          <div className="flex items-center space-x-4">
            <div className="text-right hidden md:block">
              <div className="text-xs text-white/70">Saldo ETH</div>
              <div className="text-sm font-bold text-white">{carregandoSaldo ? '...' : saldo}</div>
            </div>
            <div className="bg-white/20 rounded-lg px-3 py-2">
              <span className="text-sm font-mono text-white">{formatarEndereco(endereco)}</span>
            </div>
            <button
              onClick={() => {
                onDesconectar();
                navigate('/');
              }}
              className="bg-white text-[#6C48DB] px-4 py-2 rounded-lg hover:bg-[#02E057] transition hover:text-whitefont-medium"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      {/* Conteúdo da página */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer*/}
      <Footer />
    </div>
  );
};

export default LayoutOng;