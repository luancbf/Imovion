'use client';

interface ImovelDetalhesProps {
  tipoNegocio: string;
  valor: number;
  cidade: string;
  bairro: string;
  tipoImovel: string;
  metragem: number;
  enderecoDetalhado: string;
  descricao: string;
}

const fallback = {
  tipoNegocio: "Não informado",
  valor: 0,
  cidade: "Não informado",
  bairro: "Não informado",
  tipoImovel: "Não informado",
  metragem: 0,
  enderecoDetalhado: "Não informado",
  descricao: "Sem descrição.",
};

const ImovelDetalhes: React.FC<ImovelDetalhesProps> = ({
  tipoNegocio,
  valor,
  cidade,
  bairro,
  tipoImovel,
  metragem,
  enderecoDetalhado,
  descricao,
}) => {
  const formatarValor = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <div className="mb-8">
      <div className="flex flex-col gap-2 mb-4">
        <h1 className="font-poppins text-2xl sm:text-4xl font-bold text-blue-900 leading-tight mb-2">
          {tipoImovel || fallback.tipoImovel}
        </h1>
        <div className="flex items-center gap-2 mb-2">
          <span className="font-poppins text-3xl sm:text-5xl font-extrabold text-green-700">
            {formatarValor(valor || fallback.valor)}
            {(tipoNegocio || fallback.tipoNegocio) === 'Alugar' && (
              <span className="text-lg font-normal text-green-800"> /por mês</span>
            )}
          </span>
        </div>
        <div className="font-inter text-normal sm:text-xl text-gray-600">
          <span className="font-poppins font-semibold">Local:</span> {(cidade || fallback.cidade)}, {(bairro || fallback.bairro)}
        </div>
        <div className="font-inter text-normal sm:text-xl text-gray-600">
          <span className="font-poppins font-semibold">Endereço:</span> {(enderecoDetalhado || fallback.enderecoDetalhado)}
        </div>
        <div className="font-inter text-normal sm:text-xl text-gray-600">
          <span className="font-poppins font-semibold">Área:</span> {(metragem || fallback.metragem)}m²
        </div>
        <div className="font-inter text-normal sm:text-xl text-gray-600">
          <span className="font-poppins font-semibold">Descrição:</span> {descricao || fallback.descricao}
        </div>
      </div>
      <div className="mt-3">
        
      </div>
    </div>
  );
};

export default ImovelDetalhes;