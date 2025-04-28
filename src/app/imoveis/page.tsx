'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';

type Imovel = {
  id: string;
  titulo: string;
  endereco: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoNegocio: string;
  tipoImovel: string;
  imagens: string[];
};

export default function ImoveisPage() {
  const searchParams = useSearchParams();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);

  const tipoNegocio = searchParams.get('tipoNegocio');
  const cidade = searchParams.get('cidade');
  const tipoImovel = searchParams.get('tipoImovel');
  const precoMaximo = searchParams.get('precoMaximo');
  const localizacao = searchParams.get('localizacao');
  const areaMinima = searchParams.get('areaMinima');

  useEffect(() => {
    const buscarImoveis = async () => {
      try {
        const ref = collection(db, 'imoveis');
        const filtros = [];

        if (tipoNegocio) filtros.push(where('tipoNegocio', '==', tipoNegocio));
        if (cidade) filtros.push(where('endereco', '>=', cidade));
        if (tipoImovel) filtros.push(where('tipoImovel', '==', tipoImovel));
        if (precoMaximo) filtros.push(where('valor', '<=', Number(precoMaximo)));
        if (localizacao) filtros.push(where('endereco', '>=', localizacao));
        if (areaMinima) filtros.push(where('metragem', '>=', Number(areaMinima)));

        const q = filtros.length > 0 ? query(ref, ...filtros) : ref;

        const snapshot = await getDocs(q);
        const lista: Imovel[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Imovel));

        setImoveis(lista);
      } catch (err) {
        console.error('Erro ao buscar imóveis:', err);
      } finally {
        setLoading(false);
      }
    };

    buscarImoveis();
  }, [tipoNegocio, cidade, tipoImovel, precoMaximo, localizacao, areaMinima]);

  if (loading) {
    return <div className="p-10 text-center text-xl">Carregando imóveis...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center">Imóveis disponíveis</h1>

      {imoveis.length === 0 ? (
        <p className="text-center text-gray-600">Nenhum imóvel encontrado com esses filtros.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {imoveis.map(imovel => (
            <Link href={`/imovel/${imovel.id}`} key={imovel.id} className="group">
              <div className="border rounded-lg overflow-hidden shadow hover:shadow-lg transition">
                <div className="w-full h-52 overflow-hidden">
                  <img
                    src={imovel.imagens?.[0] || '/sem-imagem.jpg'}
                    alt={imovel.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-4 flex flex-col gap-2">
                  <h2 className="text-lg font-bold">{imovel.titulo}</h2>
                  <p className="text-gray-500 text-sm">{imovel.endereco}</p>
                  <p className="text-blue-600 font-semibold text-lg">
                    {`R$ ${imovel.valor.toLocaleString()}`}
                  </p>
                  <p className="text-sm text-gray-600">{imovel.tipoImovel} - {imovel.metragem} m²</p>
                  <button className="mt-2 bg-green-500 text-white py-1 rounded hover:bg-green-600">
                    Falar no WhatsApp
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
