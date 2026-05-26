import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EstatisticasCard from '../../components/EstatisticasCard';
import CardAcao from '../../components/CardAcao';
import { getContractReadOnly } from '../../services/contrato';
import { TIPOS_ACAO } from '../../constants/tiposAcao';

interface Evento {
  id: string;
  tipoAcaoId: number;
  pontos: number;
  latitude: string;
  longitude: string;
  hashEvidencia: string;
  participantes: number;
  timestamp: number;
  autor: string;
}

const HomePage = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [estatisticasReais, setEstatisticasReais] = useState({
    totalEventos: 0,
    totalPontos: 0,
    territoriosAtivos: 0,
    evidencias: 0
  });

  // Buscar dados do contrato
  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const contrato = getContractReadOnly();
        
        // Buscar total de eventos
        const total = await contrato.obtertotalEventos();
        const totalEventos = Number(total);
        
        // Buscar detalhes de cada evento
        const eventosTemp: Evento[] = [];
        let totalPontos = 0;
        const territoriosSet = new Set<string>();
        
        for (let i = 1; i <= totalEventos; i++) {
          try {
            const evento = await contrato.obterEvento(i);
            const eventoData: Evento = {
              id: evento.id.toString(),
              tipoAcaoId: Number(evento.tipoAcaoId),
              pontos: Number(evento.pontos),
              latitude: evento.latitude,
              longitude: evento.longitude,
              hashEvidencia: evento.hashEvidencia,
              participantes: Number(evento.participantes),
              timestamp: Number(evento.timestamp),
              autor: evento.autor
            };
            
            eventosTemp.push(eventoData);
            totalPontos += eventoData.pontos;
            
            // Adicionar território (baseado nas coordenadas simplificadas)
            if (eventoData.latitude && eventoData.longitude) {
              const territorioKey = `${eventoData.latitude.substring(0, 5)}_${eventoData.longitude.substring(0, 5)}`;
              territoriosSet.add(territorioKey);
            }
          } catch (error) {
            console.error(`Erro ao buscar evento ${i}:`, error);
          }
        }
        
        // Ordenar por timestamp (mais recente primeiro)
        eventosTemp.sort((a, b) => b.timestamp - a.timestamp);
        
        setEventos(eventosTemp);
        setEstatisticasReais({
          totalEventos,
          totalPontos,
          territoriosAtivos: territoriosSet.size,
          evidencias: eventosTemp.filter(e => e.hashEvidencia && e.hashEvidencia.length > 0).length
        });
        
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregando(false);
      }
    };
    
    carregarDados();
  }, []);

  // Formatar data
  const formatarData = (timestamp: number) => {
    if (!timestamp) return 'Data não disponível';
    const data = new Date(timestamp * 1000);
    return data.toLocaleDateString('pt-BR');
  };

  // Pegar últimos 6 eventos para exibir
  const eventosRecentes = eventos.slice(0, 6);

  // Preparar dados para os cards de estatística
  const estatisticasCards = [
    { titulo: "Ações Executadas", valor: estatisticasReais.totalEventos, icone: "🤝", cor: "bg-green-600" },
    { titulo: "Territórios Ativos", valor: estatisticasReais.territoriosAtivos, icone: "🗺️", cor: "bg-orange-500" },
    { titulo: "Evidências Materiais", valor: estatisticasReais.evidencias, icone: "📎", cor: "bg-purple-600" },
    { titulo: "Pontuação Total", valor: estatisticasReais.totalPontos, icone: "⭐", cor: "bg-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-[#9A67FF] text-white py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-3xl font-bold mb-4">Transparência que gera impacto!</h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Acompanhe e verifique ações socioambientais registradas em blockchain com evidências públicas e auditáveis.
          </p>
        </div>
      </section>

      {/* Estatísticas */}
      <section className="container mx-auto px-4 py-12">
        {carregando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-32 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {estatisticasCards.map((stat, index) => (
              <EstatisticasCard key={index} {...stat} />
            ))}
          </div>
        )}
      </section>

      {/* Ações Recentes */}
      <section className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Ações recentes</h2>
          <Link to="/acoes" className="text-primary hover:text-secondary transition font-medium">
            Ver todas as ações →
          </Link>
        </div>
        
        {carregando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : eventosRecentes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosRecentes.map((evento, index) => {
              const tipoInfo = TIPOS_ACAO[evento.tipoAcaoId as keyof typeof TIPOS_ACAO];
              return (
                <CardAcao
                  key={index}
                  tipo={tipoInfo?.nome || `Tipo ${evento.tipoAcaoId}`}
                  pontos={evento.pontos}
                  local={`${evento.latitude || 'Coordenada'}, ${evento.longitude || 'não informada'}`}
                  data={formatarData(evento.timestamp)}
                  hash={`${evento.hashEvidencia.substring(0, 10)}...`}
                  icone={tipoInfo?.icone || "📌"}
                  cor={tipoInfo?.cor || "bg-gray-500"}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm">
            <p className="text-gray-500 text-lg">🤝 Nenhuma ação registrada ainda</p>
            <p className="text-gray-400 text-sm mt-2">Seja o primeiro a registrar uma ação!</p>
          </div>
        )}
      </section>

      {/* Relatório Trimestral */}
      <section className="bg-white py-12 border-t border-gray-200">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Relatório Trimestral</h2>
          {estatisticasReais.totalEventos > 0 ? (
            <>
              <p className="text-gray-600 mb-6">
                Total de ações registradas: <span className="font-semibold text-primary">{estatisticasReais.totalEventos}</span>
              </p>
              <button 
                onClick={() => window.location.href = '/relatorios'}
                className="bg-[#6C48DB] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#2322E3] transition shadow-md"
              >
                Gerar Relatório Agora
              </button>
            </>
          ) : (
            <p className="text-gray-500">Nenhum relatório disponível ainda. Registre ações para gerar relatórios.</p>
          )}
        </div>
      </section>

      {/* Tabela de Relatórios */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Relatórios gerados</h2>
          <Link to="/relatorios" className="text-primary hover:text-secondary transition text-sm">
            Ver histórico completo →
          </Link>
        </div>
        
        {carregando ? (
          <div className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
        ) : estatisticasReais.totalEventos > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-md overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Período</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Data de geração</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Gerado por</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Tx. da transação</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    📊 Nenhum relatório trimestral gerado ainda
                    <p className="text-sm text-gray-400 mt-1">Clique em "Gerar Relatório Agora" para criar o primeiro relatório</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-500">📭 Nenhum relatório disponível</p>
            <p className="text-gray-400 text-sm mt-2">Registre ações para gerar relatórios trimestrais</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;