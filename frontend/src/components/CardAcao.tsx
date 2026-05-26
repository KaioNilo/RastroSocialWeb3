interface CardAcaoProps {
  tipo: string;
  pontos: number;
  local: string;
  data: string;
  hash: string;
  icone: string;
  cor: string;
  linkEvidencia?: string;
  linkTx?: string;
}

const CardAcao = ({ tipo, pontos, local, data, hash, icone, cor, linkEvidencia, linkTx }: CardAcaoProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 hover:shadow-lg transition border border-gray-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 ${cor} rounded-full flex items-center justify-center text-white text-xl`}>
            {icone}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{tipo}</h3>
            <span className="text-sm font-semibold text-primary">{pontos} PONTO{pontos > 1 ? 'S' : ''}</span>
          </div>
        </div>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600">
        <p className="flex items-center space-x-2">
          <span className="text-gray-400">📍</span>
          <span>{local}</span>
        </p>
        <p className="flex items-center space-x-2">
          <span className="text-gray-400">📅</span>
          <span>{data}</span>
        </p>
        
        {/* Link para Evidência (IPFS) */}
        {linkEvidencia && (
          <p className="flex items-center space-x-2">
            <span className="text-gray-400">📎</span>
            <a 
              href={linkEvidencia} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:underline text-sm truncate max-w-[200px]"
            >
              Ver Evidência
            </a>
          </p>
        )}
        
        {/* Link para Transação na Blockchain */}
        {linkTx && (
          <p className="flex items-center space-x-2">
            <span className="text-gray-400">🔗</span>
            <a 
              href={linkTx} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-blue-500 hover:underline text-sm"
            >
              Ver na Blockchain
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

export default CardAcao;