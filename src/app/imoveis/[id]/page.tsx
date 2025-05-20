'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Image from 'next/image';

type Imovel = {
  id: string;
  cidade: string;
  bairro: string;
  enderecoDetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoNegocio: string;
  tipoImovel: string;
  imagens: string[];
  whatsapp: string;
  patrocinador?: string;
  setorNegocio?: string;
};

type Props = {
  params: Promise<{ id: string }>;
};

export default function ImovelPage({ params }: Props) {
  // Sempre use o hook use para desembrulhar params
  const { id: rawId } = use(params);
  const id =
    typeof rawId === 'string'
      ? rawId.replace(/[^a-zA-Z0-9_-]/g, '')
      : '';

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagemAtual, setImagemAtual] = useState(0);

  useEffect(() => {
    const buscarImovel = async () => {
      try {
        if (!id) {
          notFound();
          return;
        }
        const ref = doc(db, 'imoveis', id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
          notFound();
          return;
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
  }, [id]);

  const formatarValor = (valor: number) =>
    valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const proximaImagem = () => {
    if (imovel && imovel.imagens.length > 0) {
      setImagemAtual((prev) => (prev + 1) % imovel.imagens.length);
    }
  };

  const imagemAnterior = () => {
    if (imovel && imovel.imagens.length > 0) {
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
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Imóvel não encontrado</h2>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
            >
              Voltar para a página inicial
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Sanitize WhatsApp number for the link
  const whatsappNumber = imovel.whatsapp.replace(/\D/g, '').slice(0, 13);
  const whatsappLink = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${imovel.tipoImovel} localizado em ${imovel.bairro}, ${imovel.cidade}.`
  )}`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="p-4 sm:p-6 max-w-4xl mx-auto">
          {/* Botão de Voltar */}
          <Link
            href="/"
            className="mb-6 inline-block bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition"
          >
            ← Voltar
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold mb-2">{imovel.tipoImovel}</h1>
          <div className="mb-4 text-gray-600 text-base sm:text-lg">
            {imovel.bairro}, {imovel.cidade}
          </div>

          {/* Carrossel de Imagens */}
          <div className="relative mb-4 group">
            {imovel.imagens && imovel.imagens.length > 0 ? (
              <>
                <Image
                  src={imovel.imagens[imagemAtual]}
                  alt={`Imagem ${imagemAtual + 1}`}
                  width={800}
                  height={320}
                  className="w-full h-56 sm:h-80 object-cover rounded transition-transform duration-500 group-hover:scale-105"
                />

                {imovel.imagens.length > 1 && (
                  <>
                    <button
                      onClick={imagemAnterior}
                      className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      aria-label="Imagem anterior"
                      type="button"
                    >
                      ‹
                    </button>
                    <button
                      onClick={proximaImagem}
                      className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
                      aria-label="Próxima imagem"
                      type="button"
                    >
                      ›
                    </button>
                  </>
                )}
              </>
            ) : (
              <Image
                src="/sem-imagem.jpg"
                alt="Sem imagem"
                width={800}
                height={320}
                className="w-full h-56 sm:h-80 object-cover rounded"
                priority
              />
            )}
          </div>

          {/* Miniaturas */}
          {imovel.imagens && imovel.imagens.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {imovel.imagens.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setImagemAtual(index)}
                  className={`w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition ${
                    imagemAtual === index ? 'border-blue-500' : 'border-transparent'
                  }`}
                  aria-label={`Selecionar imagem ${index + 1}`}
                  type="button"
                >
                  <Image
                    src={img}
                    alt={`Miniatura ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover hover:opacity-80"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}

          {/* Indicadores (bolinhas) */}
          {imovel.imagens && imovel.imagens.length > 1 && (
            <div className="flex justify-center items-center gap-2 mb-8">
              {imovel.imagens.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setImagemAtual(index)}
                  className={`w-3 h-3 rounded-full cursor-pointer border-none p-0 ${
                    imagemAtual === index ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  aria-label={`Ir para imagem ${index + 1}`}
                  type="button"
                ></button>
              ))}
            </div>
          )}

          {/* Detalhes do imóvel */}
          <div className="mb-8">
            <p className="text-lg sm:text-xl text-blue-600 font-bold">
              {imovel.tipoNegocio === 'Alugar'
                ? `${formatarValor(imovel.valor)} / mês`
                : formatarValor(imovel.valor)}
            </p>
            <p className="text-gray-700 mt-2 text-base sm:text-lg">
              {imovel.tipoImovel} - {imovel.metragem} m²
            </p>
            <p className="text-gray-700 mt-2 text-base sm:text-lg">
              <span className="font-medium">Endereço:</span> {imovel.enderecoDetalhado}
            </p>
            <p className="mt-6 text-gray-800 leading-relaxed text-base sm:text-lg">{imovel.descricao}</p>
          </div>

          {/* Botão WhatsApp */}
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full sm:w-auto text-center bg-green-500 text-white px-6 py-3 rounded font-semibold hover:bg-green-600 transition"
          >
            Falar no WhatsApp
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}