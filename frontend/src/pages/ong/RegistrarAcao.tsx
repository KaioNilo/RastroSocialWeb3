import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrowserProvider } from 'ethers';
import { getContract } from '../../services/contrato';
import { TIPOS_ACAO } from '../../constants/tiposAcao';

const RegistrarAcao = () => {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [formData, setFormData] = useState({
    tipoAcaoId: 1,
    latitude: '',
    longitude: '',
    hashEvidencia: '',
    participantes: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (!window.ethereum) {
        alert('MetaMask não instalado!');
        return;
      }

      const provider = new BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const contrato = await getContract(signer);

      const tx = await contrato.registrarImpacto(
        Number(formData.tipoAcaoId),
        formData.latitude,
        formData.longitude,
        formData.hashEvidencia || `QmTest${Date.now()}`,
        Number(formData.participantes)
      );

      await tx.wait();
      alert('✅ Ação registrada com sucesso!');
      navigate('/ong');

    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      
      if (error.message?.includes('user rejected')) {
        alert('❌ Transação rejeitada. Você cancelou a operação.');
      } else if (error.message?.includes('insufficient funds')) {
        alert('❌ Saldo insuficiente para pagar o gas.');
      } else {
        alert('❌ Erro ao registrar ação. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-8">
          <button
            onClick={() => navigate('/ong')}
            className="text-primary hover:text-secondary transition mb-4 flex items-center"
          >
            ← Voltar para o Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Registrar nova ação</h1>
          <p className="text-gray-600">Preencha os dados da ação de impacto.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Tipo de ação *</label>
            <select
              name="tipoAcaoId"
              value={formData.tipoAcaoId}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              {Object.entries(TIPOS_ACAO).map(([id, tipo]) => (
                <option key={id} value={id}>
                  {tipo.nome} - {tipo.pontos} pontos
                </option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Local (coordenadas) *</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="latitude"
                placeholder="Latitude (ex: -3.4653)"
                value={formData.latitude}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                name="longitude"
                placeholder="Longitude (ex: -62.2159)"
                value={formData.longitude}
                onChange={handleChange}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Dica: Use Google Maps para obter as coordenadas
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Número de participantes</label>
            <input
              type="number"
              name="participantes"
              placeholder="Quantas pessoas participaram?"
              value={formData.participantes}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              min="0"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Upload de evidência</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition">
              <p className="text-gray-500 mb-2">📎 Clique ou arraste arquivos</p>
              <p className="text-xs text-gray-400">(imagem, vídeo ou documento)</p>
              <input
                type="text"
                name="hashEvidencia"
                placeholder="Hash IPFS do arquivo (ex: Qm...)"
                value={formData.hashEvidencia}
                onChange={handleChange}
                className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              💡 Para testes, use um hash fictício como "QmTest123"
            </p>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-[#6C48DB] text-white py-3 rounded-lg font-semibold hover:bg-[#2322E3] transition disabled:opacity-50"
          >
            {carregando ? 'Registrando...' : 'Registrar ação'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegistrarAcao;