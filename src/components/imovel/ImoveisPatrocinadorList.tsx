'use client';

import Link from 'next/link';
import Image from 'next/image';

interface Imovel {
  id: string;
  imagens?: string[];
  tipoImovel: string;
  cidade: string;
  bairro: string;
  valor: number;
  metragem: number;
}

interface ImoveisPatrocinadorListProps {
  imoveis: Imovel[];
}

const ImoveisPatrocinadorList: React.FC<ImoveisPatrocinadorListProps> = ({ imoveis }) => {
  if (!imoveis || imoveis.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto mt-16">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        Outros imóveis do patrocinador
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {imoveis.map((item) => (
          <Link
            key={item.id}
            href={`/imoveis/${item.id}`}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden border border-blue-100 flex flex-col"
          >
            <div className="relative h-40 w-full bg-gray-100">
              <Image
                src={item.imagens?.[0] || "/sem-imagem.jpg"}
                alt={item.tipoImovel}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <span className="text-blue-700 font-bold text-lg mb-1">{(item.tipoImovel || '').replace(/_/g, ' ')}</span>
              <span className="text-blue-900 text-base mb-1">
                {(item.cidade || '').replace(/_/g, ' ')}, {(item.bairro || '').replace(/_/g, ' ')}
              </span>
              <span className="text-green-600 font-bold text-base mb-2">
                {item.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
              <span className="text-xs text-gray-500 mt-auto">{item.metragem} m²</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default ImoveisPatrocinadorList;