'use client';

import { useState, useEffect } from "react";
import { collection, getDocs, query, where, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Image from "next/image";
import type { Imovel } from "@/types/Imovel";

// Função utilitária para formatar datas
function formatarData(data?: Date | Timestamp | string): string {
  if (!data) return 'Data não informada';
  try {
    if (typeof data === 'object' && 'toDate' in data) {
      return data.toDate().toLocaleDateString('pt-BR');
    }
    if (data instanceof Date) {
      return data.toLocaleDateString('pt-BR');
    }
    const dateObj = new Date(data);
    if (!isNaN(dateObj.getTime())) {
      return dateObj.toLocaleDateString('pt-BR');
    }
    return 'Data inválida';
  } catch {
    return 'Data inválida';
  }
}

// Card de imóvel para patrocinador
function ImovelCardPatrocinador({ imovel }: { imovel: Imovel }) {
  const [swiperIndex, setSwiperIndex] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Carrossel de Imagens */}
      <div className="relative h-48 bg-gray-200">
        {imovel.imagens?.length > 0 ? (
          <>
            <Image
              src={imovel.imagens[swiperIndex]}
              alt={`Imóvel ${imovel.tipoImovel} em ${imovel.cidade} - Foto ${swiperIndex + 1}`}
              width={400}
              height={192}
              className="w-full h-full object-cover"
              unoptimized
              priority={swiperIndex === 0}
            />
            {imovel.imagens.length > 1 && (
              <>
                <button
                  className="absolute left-2 top-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                  onClick={() => setSwiperIndex((prev) => prev === 0 ? imovel.imagens.length - 1 : prev - 1)}
                  aria-label="Imagem anterior"
                  type="button"
                >
                  <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                </button>
                <button
                  className="absolute right-2 top-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                  onClick={() => setSwiperIndex((prev) => prev === imovel.imagens.length - 1 ? 0 : prev + 1)}
                  aria-label="Próxima imagem"
                  type="button"
                >
                  <svg width={18} height={18} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {imovel.imagens.map((_, idx) => (
                    <span
                      key={idx}
                      className={`w-2 h-2 rounded-full ${idx === swiperIndex ? 'bg-blue-600' : 'bg-gray-400'} inline-block`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 text-sm">Sem imagens disponíveis</span>
          </div>
        )}
      </div>

      {/* Detalhes do Imóvel */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">
            {imovel.tipoImovel} - {imovel.tipoNegocio}
          </h3>
          <span className="text-xs text-gray-500">
            {formatarData(imovel.dataCadastro)}
          </span>
        </div>
        <p className="text-green-600 font-bold text-xl">
          {imovel.valor?.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex items-center gap-1">
            <span className="font-medium">Local:</span>
            {imovel.bairro}, {imovel.cidade?.replace(/_/g, ' ')}
          </p>
          <p className="flex items-center gap-1">
            <span className="font-medium">Endereço:</span>
            {imovel.enderecoDetalhado}
          </p>
          <p className="flex items-center gap-1">
            <span className="font-medium">Área:</span>
            {imovel.metragem}m²
          </p>
        </div>
        <p className="text-gray-700 text-sm line-clamp-2 mt-2">
          {imovel.descricao}
        </p>
      </div>
    </div>
  );
}

export default function PatrocinadorPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Banner e nome do patrocinador
  const patrocinadorSlug = "luan-capistrano";
  const patrocinadorNome = "Luan Capistrano";
  const patrocinadorBanner = "/patrocinadores/luan-capistrano/banner.jpg"; // Altere para o caminho da imagem do patrocinador

  useEffect(() => {
    async function fetchImoveis() {
      setCarregando(true);
      const q = query(
        collection(db, "imoveis"),
        where("patrocinador", "==", patrocinadorSlug)
      );
      const snapshot = await getDocs(q);
      const imoveisData: Imovel[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Imovel[];
      setImoveis(imoveisData);
      setCarregando(false);
    }
    fetchImoveis();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
      <Header />
      {/* Banner do patrocinador */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full max-w-3xl mx-auto">
          <Image
            src={patrocinadorBanner}
            alt={`Banner do patrocinador ${patrocinadorNome}`}
            width={1200}
            height={320}
            className="w-full h-48 md:h-64 object-cover rounded-b-2xl shadow mb-4"
            priority
          />
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 mb-8 text-center drop-shadow" style={{ userSelect: "none" }}>
          {patrocinadorNome}
        </h1>
      </div>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-blue-700 font-semibold">Carregando imóveis...</span>
          </div>
        ) : imoveis.length === 0 ? (
          <div className="text-center text-blue-700 bg-blue-100 border border-blue-200 p-6 rounded-xl shadow mt-10">
            Nenhum imóvel cadastrado para este patrocinador.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {imoveis.map((imovel) => (
              <ImovelCardPatrocinador key={imovel.id} imovel={imovel} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}