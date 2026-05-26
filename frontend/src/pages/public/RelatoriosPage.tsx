// src/pages/public/RelatoriosPage.tsx
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getContractReadOnly } from '../../services/contrato';

interface Relatorio {
  periodo: string;
  dataGeracao: string;
  geradoPor: string;
  txHash: string;
  totalPontos: number;
  totalEventos: number;
  hashRelatorio: string;
}

const RelatoriosPage = () => {
  const [relatorios, setRelatorios] = useState<Relatorio[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Buscar relatórios do contrato
  useEffect(() => {
    const carregarRelatorios = async () => {
      try {
        setCarregando(true);
        const contrato = getContractReadOnly();
        
        // Verificar trimestres disponíveis (últimos 8 trimestres)
        const anoAtual = new Date().getFullYear();
        const relatoriosTemp: Relatorio[] = [];
        
        for (let ano = anoAtual - 2; ano <= anoAtual; ano++) {
          for (let trimestre = 1; trimestre <= 4; trimestre++) {
            try {
              const gerado = await contrato.relatorioGerado(ano, trimestre);
              if (gerado) {
                const relatorio = await contrato.relatorios(ano, trimestre);
                
                // Nome do período
                const meses = ['Jan–Mar', 'Abr–Jun', 'Jul–Set', 'Out–Dez'];
                const periodo = `${meses[trimestre - 1]} ${ano}`;
                
                // Formatar data
                const dataGeracao = new Date(Number(relatorio.timestamp) * 1000);
                const dataFormatada = dataGeracao.toLocaleDateString('pt-BR') + ' ' + dataGeracao.toLocaleTimeString('pt-BR');
                
                // Formatar endereço
                const geradoPor = `${relatorio.geradoPor.substring(0, 6)}...${relatorio.geradoPor.substring(38)}`;
                
                // Hash da transação (simulado - você pode armazenar no evento)
                const txHash = `0x${Math.random().toString(36).substring(2, 15)}...`;
                
                relatoriosTemp.push({
                  periodo,
                  dataGeracao: dataFormatada,
                  geradoPor,
                  txHash,
                  totalPontos: Number(relatorio.totalPontos),
                  totalEventos: Number(relatorio.totalEventos),
                  hashRelatorio: relatorio.hashRelatorio
                });
              }
            } catch (error) {
              // Trimestre sem relatório, ignorar
            }
          }
        }
        
        // Ordenar por data (mais recente primeiro)
        relatoriosTemp.sort((a, b) => {
          const dataA = new Date(a.dataGeracao.split(' ')[0].split('/').reverse().join('-'));
          const dataB = new Date(b.dataGeracao.split(' ')[0].split('/').reverse().join('-'));
          return dataB.getTime() - dataA.getTime();
        });
        
        setRelatorios(relatoriosTemp);
      } catch (error) {
        console.error('Erro ao carregar relatórios:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarRelatorios();
  }, []);

  // Função para verificar o relatório no Etherscan
  const verificarRelatorio = (hashRelatorio: string) => {
    // Abrir no Etherscan ou mostrar modal
    alert(`Hash do Relatório: ${hashRelatorio}\n\nEste hash pode ser verificado na blockchain.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link to="/" className="text-primary hover:text-secondary transition">
            ← Voltar para o Início
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Relatórios gerados</h1>
          <p className="text-gray-600">
            Histórico de relatórios trimestrais gerados. Todos os relatórios são públicos e verificáveis.
          </p>
        </div>

        {/* Tabela de Relatórios */}
        {carregando ? (
          <div className="bg-gray-200 rounded-xl h-96 animate-pulse"></div>
        ) : relatorios.length > 0 ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow-md">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Período</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Data de geração</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Gerado por</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Pontos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Eventos</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {relatorios.map((rel, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-gray-700 font-medium">{rel.periodo}</td>
                    <td className="px-6 py-4 text-gray-500 text-sm">{rel.dataGeracao}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-500 font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                        {rel.geradoPor}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 font-semibold">{rel.totalPontos}</td>
                    <td className="px-6 py-4 text-gray-600">{rel.totalEventos}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                        🔒 Concluído
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => verificarRelatorio(rel.hashRelatorio)}
                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm hover:bg-secondary transition"
                      >
                        Ver relatório
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-gray-500 text-lg">Nenhum relatório gerado ainda</p>
            <p className="text-gray-400 text-sm mt-2">
              Acesse a Área ONG e clique em "Gerar Relatório Trimestral"
            </p>         
          </div>
        )}

        {/* Informação adicional */}
        {relatorios.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>💡 Todos os relatórios são gerados na blockchain e podem ser verificados publicamente.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RelatoriosPage;