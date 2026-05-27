import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import EstatisticasCard from '../../components/EstatisticasCard';
import CardAcao from '../../components/CardAcao';
import { getContractReadOnly } from '../../services/contrato';
import { TIPOS_ACAO } from '../../constants/tiposAcao';
import { EventLog } from 'ethers';

interface EventoCompleto {
  id: string;
  tipoAcaoId: number;
  pontos: number;
  latitude: string;
  longitude: string;
  hashEvidencia: string;
  participantes: number;
  timestamp: number;
  autor: string;
  txHash: string;
}

const DashboardOng = () => {
  const [eventos, setEventos] = useState<EventoCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [estatisticas, setEstatisticas] = useState({
    totalEventos: 0,
    totalPontos: 0,
    territoriosAtivos: 0,
    evidencias: 0
  });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const contrato = getContractReadOnly();

        const filter = contrato.filters.EventoRegistrado();
        const logs = await contrato.queryFilter(filter);

        const eventosTemp: EventoCompleto[] = [];
        let totalPontos = 0;
        const territoriosSet = new Set<string>();

        for (const log of logs) {
          if (!('args' in log)) continue;
          const eventLog = log as EventLog;
          const txHash = eventLog.transactionHash;
          const id = Number(eventLog.args?.[0]);

          try {
            const evento = await contrato.obterEvento(id);
            const pontos = Number(evento.pontos);

            eventosTemp.push({
              id: evento.id.toString(),
              tipoAcaoId: Number(evento.tipoAcaoId),
              pontos: pontos,
              latitude: evento.latitude,
              longitude: evento.longitude,
              hashEvidencia: evento.hashEvidencia,
              participantes: Number(evento.participantes),
              timestamp: Number(evento.timestamp),
              autor: evento.autor,
              txHash: txHash
            });

            totalPontos += pontos;

            if (evento.latitude && evento.longitude) {
              const territorioKey = `${evento.latitude.substring(0, 5)}_${evento.longitude.substring(0, 5)}`;
              territoriosSet.add(territorioKey);
            }
          } catch (error) {
            console.error(`Erro ao buscar evento ${id}:`, error);
          }
        }

        eventosTemp.sort((a, b) => b.timestamp - a.timestamp);
        setEventos(eventosTemp);
        setEstatisticas({
          totalEventos: eventosTemp.length,
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

  const formatarData = (timestamp: number) => {
    if (!timestamp) return 'Data não disponível';
    const data = new Date(timestamp * 1000);
    return data.toLocaleDateString('pt-BR');
  };

  const eventosRecentes = eventos.slice(0, 6);

  const estatisticasCards = [
    { titulo: "Ações Executadas", valor: estatisticas.totalEventos, icone: "🌱", cor: "bg-green-600" },
    { titulo: "Territórios Ativos", valor: estatisticas.territoriosAtivos, icone: "🗺️", cor: "bg-orange-500" },
    { titulo: "Evidências Materiais", valor: estatisticas.evidencias, icone: "📎", cor: "bg-purple-600" },
    { titulo: "Pontuação Total", valor: estatisticas.totalPontos, icone: "⭐", cor: "bg-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Olá, Equipe ONG!</h1>
          <p className="text-gray-600">Bem vindo a área da sua ONG.</p>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {estatisticasCards.map((stat, index) => (
            <EstatisticasCard key={index} {...stat} />
          ))}
        </div>

        {/* Ações Recentes */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Ações recentes</h2>
            <Link to="/ong/acoes" className="text-primary hover:text-secondary transition font-medium">
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
                const linkIPFS = `https://gateway.pinata.cloud/ipfs/${evento.hashEvidencia}`;
                const linkTx = `https://sepolia.etherscan.io/tx/${evento.txHash}`;
                
                return (
                  <CardAcao
                    key={index}
                    tipo={tipoInfo?.nome || `Tipo ${evento.tipoAcaoId}`}
                    pontos={evento.pontos}
                    local={`${evento.latitude || 'Coordenada'}, ${evento.longitude || 'não informada'}`}
                    data={formatarData(evento.timestamp)}
                    icone={tipoInfo?.icone || "📌"}
                    cor={tipoInfo?.cor || "bg-gray-500"}
                    linkEvidencia={linkIPFS}
                    linkTx={linkTx}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <p className="text-gray-500 text-lg">🌱 Nenhuma ação registrada ainda</p>
              <p className="text-gray-400 text-sm mt-2">Clique em "Registrar Ação" para começar</p>
            </div>
          )}
        </div>

        {/* Botão Registrar Ação */}
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Registrar nova ação</h2>
          <p className="text-gray-600 mb-6">Adicione uma nova ação de impacto à blockchain</p>
          <Link
            to="/ong/registrar"
            className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary transition shadow-md inline-block"
          >
            + Registrar Ação
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardOng;