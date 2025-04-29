'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import CardImovel from '@/components/CardImovel';
import FiltrosExpansiveis from '@/components/FiltrosExpansiveis';

interface Imovel {
  id: string;
  titulo: string;
  endereco: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoImovel: string;
  tipoNegocio: string;
  whatsapp: string;
  mensagemWhatsapp: string;
  imagens: string[];
  patrocinador?: string;
}

export default function Imoveis() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [filtro, setFiltro] = useState<string>('');

  useEffect(() => {
    const buscarImoveis = async () => {
      try {
        const ref = collection(db, 'imoveis');

        const q = filtro
          ? query(ref, where('tipoNegocio', '==', filtro))
          : ref;

        const querySnapshot = await getDocs(q);
        const listaImoveis: Imovel[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          listaImoveis.push({
            id: doc.id,
            titulo: data.titulo,
            endereco: data.endereco,
            valor: data.valor,
            metragem: data.metragem,
            descricao: data.descricao,
            tipoImovel: data.tipoImovel,
            tipoNegocio: data.tipoNegocio,
            whatsapp: data.whatsapp,
            mensagemWhatsapp: data.mensagemWhatsapp,
            imagens: data.imagens || [],
            patrocinador: data.patrocinador || '',
          });
        });

        setImoveis(listaImoveis);
      } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
      }
    };

    buscarImoveis();
  }, [filtro]);

  const handleFiltroChange = (novoFiltro: string) => {
    setFiltro(novoFiltro);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Imóveis</h1>

      <FiltrosExpansiveis onFiltroChange={handleFiltroChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {imoveis.map((imovel) => (
          <CardImovel key={imovel.id} imovel={imovel} />
        ))}
      </div>
    </div>
  );
}
