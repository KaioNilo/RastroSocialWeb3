import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getContract } from '../../services/contrato';

declare global {
  interface Window {
    ethereum?: any;
  }
}

const GerarRelatorio = () => {
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(false);
  const [ano, setAno] = useState(new Date().getFullYear());
  const [trimestre, setTrimestre] = useState(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);

    try {
      if (!window.ethereum) {
        alert('MetaMask não instalado!');
        return;
      }

      const provider = new (window as any).ethereum();
      await provider.request({ method: 'eth_requestAccounts' });
      const signer = await new (window as any).ethereum.BrowserProvider(provider).getSigner();
      const contrato = await getContract(signer);

      const tx = await contrato.gerarRelatorioTrimestral(ano, trimestre);
      await tx.wait();

      alert('✅ Relatório gerado com sucesso!');
      navigate('/ong/relatorios');

    } catch (error: any) {
      console.error('Erro ao gerar relatório:', error);
      if (error.message?.includes('trimestre em andamento')) {
        alert('❌ O trimestre ainda não terminou. Aguarde o fim do trimestre para gerar o relatório.');
      } else if (error.message?.includes('ja gerado')) {
        alert('❌ Relatório já foi gerado para este trimestre.');
      } else {
        alert('❌ Erro ao gerar relatório. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  };

  const trimestres = [
    { id: 1, nome: 'Primeiro Trimestre (Jan - Mar)', meses: 'Janeiro, Fevereiro, Março' },
    { id: 2, nome: 'Segundo Trimestre (Abr - Jun)', meses: 'Abril, Maio, Junho' },
    { id: 3, nome: 'Terceiro Trimestre (Jul - Set)', meses: 'Julho, Agosto, Setembro' },
    { id: 4, nome: 'Quarto Trimestre (Out - Dez)', meses: 'Outubro, Novembro, Dezembro' },
  ];

  const anoAtual = new Date().getFullYear();
  const anos = [anoAtual - 1, anoAtual, anoAtual + 1];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-6">
          <button
            onClick={() => navigate('/ong/relatorios')}
            className="text-primary hover:text-secondary transition flex items-center"
          >
            ← Voltar para Relatórios
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Gerar Relatório Trimestral</h1>
          <p className="text-gray-600">
            Selecione o período para gerar um relatório oficial na blockchain.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6">
          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Ano</label>
            <select
              value={ano}
              onChange={(e) => setAno(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {anos.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 font-semibold mb-2">Trimestre</label>
            <div className="space-y-3">
              {trimestres.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${trimestre === t.id ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <input
                    type="radio"
                    name="trimestre"
                    value={t.id}
                    checked={trimestre === t.id}
                    onChange={(e) => setTrimestre(Number(e.target.value))}
                    className="mr-3 text-primary"
                  />
                  <div>
                    <p className="font-semibold text-gray-800">{t.nome}</p>
                    <p className="text-sm text-gray-500">{t.meses}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Atenção:</strong> O relatório só pode ser gerado APÓS o fim do trimestre selecionado.
              Após gerado, o relatório fica registrado permanentemente na blockchain.
            </p>
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-secondary transition disabled:opacity-50"
          >
            {carregando ? 'Gerando relatório...' : 'Confirmar e Gerar Relatório'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default GerarRelatorio;