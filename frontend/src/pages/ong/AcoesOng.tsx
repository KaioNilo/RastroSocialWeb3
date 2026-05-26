import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

const AcoesOng = () => {
  const [eventos, setEventos] = useState<EventoCompleto[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState('recente');

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setCarregando(true);
        const contrato = getContractReadOnly();

        const filter = contrato.filters.EventoRegistrado();
        const logs = await contrato.queryFilter(filter);

        const eventosTemp: EventoCompleto[] = [];

        for (const log of logs) {
          if (!('args' in log)) continue;
          const eventLog = log as EventLog;
          const txHash = eventLog.transactionHash;
          const id = Number(eventLog.args?.[0]);

          try {
            const evento = await contrato.obterEvento(id);
            eventosTemp.push({
              id: evento.id.toString(),
              tipoAcaoId: Number(evento.tipoAcaoId),
              pontos: Number(evento.pontos),
              latitude: evento.latitude,
              longitude: evento.longitude,
              hashEvidencia: evento.hashEvidencia,
              participantes: Number(evento.participantes),
              timestamp: Number(evento.timestamp),
              autor: evento.autor,
              txHash: txHash
            });
          } catch (error) {
            console.error(`Erro ao buscar evento ${id}:`, error);
          }
        }

        eventosTemp.sort((a, b) => b.timestamp - a.timestamp);
        setEventos(eventosTemp);

      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setCarregando(false);
      }
    };

    carregarDados();
  }, []);

  const eventosOrdenados = [...eventos];
  if (filtro === 'recente') {
    eventosOrdenados.sort((a, b) => b.timestamp - a.timestamp);
  } else if (filtro === 'antigo') {
    eventosOrdenados.sort((a, b) => a.timestamp - b.timestamp);
  } else if (filtro === 'pontos') {
    eventosOrdenados.sort((a, b) => b.pontos - a.pontos);
  }

  const formatarData = (timestamp: number) => {
    if (!timestamp) return 'Data não disponível';
    const data = new Date(timestamp * 1000);
    return data.toLocaleDateString('pt-BR');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link to="/ong" className="text-primary hover:text-secondary transition">
            ← Voltar para o Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Ações Registradas</h1>
          <p className="text-gray-600">Acompanhe e verifique ações socioambientais registradas.</p>
        </div>

        {/* Filtros */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setFiltro('recente')}
              className={`px-4 py-2 rounded-lg transition ${filtro === 'recente' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Mais Recente
            </button>
            <button
              onClick={() => setFiltro('antigo')}
              className={`px-4 py-2 rounded-lg transition ${filtro === 'antigo' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Mais Antigo
            </button>
            <button
              onClick={() => setFiltro('pontos')}
              className={`px-4 py-2 rounded-lg transition ${filtro === 'pontos' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
            >
              Mais Pontos
            </button>
          </div>
          <div className="text-sm text-gray-500">
            {carregando ? 'Carregando...' : `${eventosOrdenados.length} ação${eventosOrdenados.length !== 1 ? 'es' : ''}`}
          </div>
        </div>

        {/* Lista de ações */}
        {carregando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-64 animate-pulse"></div>
            ))}
          </div>
        ) : eventosOrdenados.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventosOrdenados.map((evento, index) => {
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
            <p className="text-gray-500 text-lg">🌱 Nenhuma ação registrada ainda</p>
            <p className="text-gray-400 text-sm mt-2">Clique em "Registrar Ação" para começar</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AcoesOng;