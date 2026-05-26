interface EstatisticasCardProps {
  titulo: string;
  valor: number;
  icone: string;
  cor: string;
}

const EstatisticasCard = ({ titulo, valor, icone, cor }: EstatisticasCardProps) => {
  return (
    <div className={`${cor} rounded-xl shadow-md p-6 text-white transition hover:scale-105`}>
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm opacity-90">{titulo}</p>
          <p className="text-3xl font-bold mt-2">{valor}</p>
        </div>
        <span className="text-4xl opacity-80">{icone}</span>
      </div>
    </div>
  );
};

export default EstatisticasCard;