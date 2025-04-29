'use client';

import Link from 'next/link';

interface CardImovelProps {
  imovel: {
    id: string;
    endereco: string;
    valor: number;
    metragem: number;
    tipoImovel: string;
    imagens: string[];
  };
}

export default function CardImovel({ imovel }: CardImovelProps) {
  const formatarValor = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <Link href={`/imoveis/${imovel.id}`}>
      <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
        <img
          src={imovel.imagens?.[0] || '/sem-imagem.jpg'}
          alt={imovel.tipoImovel}
          className="w-full h-48 object-cover"
        />
        <div className="p-4">
          <h2 className="text-xl font-semibold mb-2">{imovel.tipoImovel}</h2>
          <p className="text-gray-600 mb-1">{imovel.endereco}</p>
          <p className="text-gray-700 font-bold">{formatarValor(imovel.valor)}</p>
          <p className="text-sm text-gray-500 mt-1">{imovel.metragem} m²</p>
        </div>
      </div>
    </Link>
  );
}
