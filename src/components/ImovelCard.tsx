'use client';

import Link from 'next/link';

type ImovelProps = {
  id: number;
  cidade: string;
  tipo: string;
  area: number;
  preco: number;
  imagemUrl?: string | null;
};

export default function ImovelCard({ id, cidade, tipo, area, preco, imagemUrl }: ImovelProps) {
  return (
    <Link href={`/imoveis/${id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-200 cursor-pointer">
        {imagemUrl && (
          <img src={imagemUrl} alt={`Imagem do imóvel em ${cidade}`} className="h-48 w-full object-cover" />
        )}
        <div className="p-4">
          <h2 className="text-xl font-semibold">{tipo} - {cidade}</h2>
          <p className="text-sm text-gray-600">Área: {area} m²</p>
          <p className="text-blue-600 font-bold mt-2">R$ {preco.toLocaleString('pt-BR')}</p>
        </div>
      </div>
    </Link>
  );
}
