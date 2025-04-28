'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

type Imovel = {
  id: string;
  endereco: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoNegocio: string;
  tipoImovel: string;
  imagens: string[];
  whatsapp: string;
  mensagemWhatsapp: string;
};

type Props = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: Props) {
  // Busca imóvel para montar SEO
  const ref = doc(db, 'imoveis', params.id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    return {
      title: 'Imóvel não encontrado',
    };
  }

  const data = snapshot.data() as Imovel;

  return {
    title: `${data.tipoImovel} à ${data.tipoNegocio.toLowerCase()} - ${data.endereco}`,
    description: data.descricao.slice(0, 160),
    openGraph: {
      title: `${data.tipoImovel} à ${data.tipoNegocio.toLowerCase()} - ${data.endereco}`,
      description: data.descricao.slice(0, 160),
      images: [
        {
          url: data.imagens?.[0] || '/sem-imagem.jpg',
          width: 800,
          height: 600,
        },
      ],
    },
  };
}

export default function ImovelPage({ params }: Props) {
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    const buscarImovel = async () => {
      try {
        const ref = doc(db, 'imoveis', params.id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
          return notFound();
        }

        setImovel({
          id: snapshot.id,
          ...snapshot.data(),
        } as Imovel);
      } catch (err) {
        console.error('Erro ao buscar imóvel:', err);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    buscarImovel();
  }, [params.id]);

  const formatarValor = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const proximaImagem = () => {
    if (imovel) {
      setImagemAtual((prev) => (prev + 1) % imovel.imagens.length);
    }
  };

  const imagemAnterior = () => {
    if (imovel) {
      setImagemAtual((prev) => (prev - 1 + imovel.imagens.length) % imovel.imagens.length);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!imovel) {
    return null;
  }

  const whatsappLink = `https://wa.me/55${imovel.whatsapp}?text=${encodeURIComponent(imovel.mensagemWhatsapp)}`;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Botão de Voltar */}
      <Link
        href="/imoveis"
        className="mb-6 inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition"
      >
        ← Voltar para Imóveis
      </Link>

      <h1 className="text-3xl font-bold mb-4">{imovel.tipoImovel}</h1>
      <div className="mb-6 text-gray-600">{imovel.endereco}</div>

      {/* Carrossel de Imagens */}
      <div className="relative mb-4 group">
        {imovel.imagens && imovel.imagens.length > 0 ? (
          <>
            <img
              src={imovel.imagens[imagemAtual]}
              alt={`Imagem ${imagemAtual + 1}`}
              className="w-full h-96 object-cover rounded transition-transform duration-500 group-hover:scale-105"
            />

            {imovel.imagens.length > 1 && (
              <>
                <button
                  onClick={imagemAnterior}
                  className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  ‹
                </button>
                <button
                  onClick={proximaImagem}
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                >
                  ›
                </button>
              </>
            )}
          </>
        ) : (
          <img
            src="/sem-imagem.jpg"
            alt="Sem imagem"
            className="w-full h-96 object-cover rounded"
          />
        )}
      </div>

      {/* Miniaturas */}
      {imovel.imagens.length > 1 && (
        <div className="flex justify-center gap-2 mb-4">
          {imovel.imagens.map((img, index) => (
            <button
              key={index}
              onClick={() => setImagemAtual(index)}
              className={`w-20 h-20 rounded overflow-hidden border-2 transition ${
                imagemAtual === index ? 'border-blue-500' : 'border-transparent'
              }`}
            >
              <img
                src={img}
                alt={`Miniatura ${index + 1}`}
                className="w-full h-full object-cover hover:opacity-80"
              />
            </button>
          ))}
        </div>
      )}

      {/* Indicadores (bolinhas) */}
      {imovel.imagens.length > 1 && (
        <div className="flex justify-center items-center gap-2 mb-8">
          {imovel.imagens.map((_, index) => (
            <div
              key={index}
              onClick={() => setImagemAtual(index)}
              className={`w-3 h-3 rounded-full cursor-pointer ${
                imagemAtual === index ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            ></div>
          ))}
        </div>
      )}

      {/* Detalhes do imóvel */}
      <div className="mb-8">
        <p className="text-xl text-blue-600 font-bold">
          {imovel.tipoNegocio === 'Alugar'
            ? `${formatarValor(imovel.valor)} / mês`
            : formatarValor(imovel.valor)}
        </p>

        <p className="text-gray-700 mt-2">
          {imovel.tipoImovel} - {imovel.metragem} m²
        </p>

        <p className="mt-6 text-gray-800 leading-relaxed">{imovel.descricao}</p>
      </div>

      {/* Botão WhatsApp */}
      <a
        href={whatsappLink}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-green-500 text-white px-6 py-3 rounded font-semibold hover:bg-green-600 transition"
      >
        Falar no WhatsApp
      </a>
    </div>
  );
}