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
    <div className="mb-8 bg-white rounded-2xl shadow-lg p-8 border border-blue-100">
      <p className="text-2xl text-blue-600 font-extrabold mb-2">
        {tipoNegocio === 'Alugar'
          ? `${formatarValor(valor)} / mês`
          : formatarValor(valor)}
      </p>
      {/* Título do imóvel*/}
      <p className="text-blue-900 text-lg font-semibold mb-2">
        {(tipoImovel || '').replace(/_/g, ' ')}
      </p>
      {/* Cidade e bairro*/}
      <p className="text-blue-900 text-lg font-semibold mb-2">
        {(cidade || '').replace(/_/g, ' ')}, {(bairro || '').replace(/_/g, ' ')}
      </p>
      <p className="text-blue-900 text-lg font-semibold mb-2">
        {(tipoImovel || '').replace(/_/g, ' ')} - {metragem} m²
      </p>
      <p className="text-gray-700 text-base mb-2">
        <span className="font-medium">Endereço:</span> {(enderecoDetalhado || '').replace(/_/g, ' ')}
      </p>
      <p className="mt-6 text-gray-800 leading-relaxed text-base">
        {(descricao || '').replace(/_/g, ' ')}
      </p>
    </div>
  );
};

export default ImovelDetalhes;