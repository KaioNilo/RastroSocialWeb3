import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/public/HomePage';
import AcoesPage from './pages/public/AcoesPage';
import RelatoriosPage from './pages/public/RelatoriosPage';

// Área ONG
import LayoutOng from './components/LayoutOng';
import DashboardOng from './pages/ong/DashboardOng';
import AcoesOng from './pages/ong/AcoesOng';
import RegistrarAcao from './pages/ong/RegistrarAcao';
import RelatoriosOng from './pages/ong/RelatoriosOng';
import GerarRelatorio from './pages/ong/GerarRelatorio';

// Endereço autorizado (sua carteira)
const ENDERECO_AUTORIZADO = '0x6707e22489528Cc355892c5F5aC927C247ee6CF2';

function App() {
  const [autenticado, setAutenticado] = useState(false);
  const [enderecoWallet, setEnderecoWallet] = useState('');

  // Verificar se o endereço é o autorizado
  const handleLogin = (endereco: string) => {
    // Verifica se o endereço conectado é o autorizado
    if (endereco.toLowerCase() === ENDERECO_AUTORIZADO.toLowerCase()) {
      setAutenticado(true);
      setEnderecoWallet(endereco);
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('walletAddress', endereco);
    } else {
      alert('Acesso negado! Apenas a carteira autorizada pode acessar a área ONG.');
    }
  };

  const handleLogout = () => {
    setAutenticado(false);
    setEnderecoWallet('');
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
  };

  // Verificar autenticação ao carregar
  useEffect(() => {
    const savedAuth = localStorage.getItem('walletConnected');
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAuth === 'true' && savedAddress) {
      if (savedAddress.toLowerCase() === ENDERECO_AUTORIZADO.toLowerCase()) {
        setAutenticado(true);
        setEnderecoWallet(savedAddress);
      } else {
        localStorage.removeItem('walletConnected');
        localStorage.removeItem('walletAddress');
      }
    }
  }, []);

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        {!autenticado ? (
          <>
            <Navbar onLogin={handleLogin} />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/acoes" element={<AcoesPage />} />
                <Route path="/relatorios" element={<RelatoriosPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
            <Footer />
          </>
        ) : (
          <Routes>
            <Route element={<LayoutOng endereco={enderecoWallet} onDesconectar={handleLogout} />}>
              <Route path="/ong" element={<DashboardOng />} />
              <Route path="/ong/acoes" element={<AcoesOng />} />
              <Route path="/ong/registrar" element={<RegistrarAcao />} />
              <Route path="/ong/relatorios" element={<RelatoriosOng />} />
              <Route path="/ong/gerar-relatorio" element={<GerarRelatorio />} />
            </Route>
            <Route path="*" element={<Navigate to="/ong" />} />
          </Routes>
        )}
      </div>
    </Router>
  );
}

export default App;