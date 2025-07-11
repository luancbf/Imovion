'use client';

import ImovelCard from '@/components/ImovelCard';
import type { Imovel } from '@/types/Imovel';

interface ImoveisPatrocinadorListProps {
  imoveis: Imovel[];
}

const ImoveisPatrocinadorList: React.FC<ImoveisPatrocinadorListProps> = ({ imoveis }) => {
  if (!imoveis || imoveis.length === 0) return null;

  return (
    <section className="w-full max-w-6xl mx-auto mt-16">
      <h2 className="text-3xl font-poppins font-bold text-blue-700 mb-6 text-center">
        Outros imóveis do patrocinador
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {imoveis.map((item) => (
          <ImovelCard key={item.id} imovel={item} contexto="patrocinador" />
        ))}
      </div>
    </section>
  );
};

export default ImoveisPatrocinadorList;