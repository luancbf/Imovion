'use client';

import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useState, useEffect } from "react";
import type { Timestamp } from "firebase/firestore";

interface Imovel {
  id?: string;
  cidade: string;
  bairro: string;
  enderecoDetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoImovel: string;
  tipoNegocio: string;
  setorNegocio?: string;
  whatsapp: string;
  patrocinador?: string;
  imagens: string[];
  dataCadastro?: Date | Timestamp | string;
}

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

function ImovelCardPatrocinador({ imovel }: { imovel: Imovel }) {
  const [swiperIndex, setSwiperIndex] = useState(0);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Carrossel de Imagens */}
      <div className="relative h-48 bg-gray-200">
        {imovel.imagens?.length > 0 ? (
          <>
            <img
              src={imovel.imagens[swiperIndex]}
              alt={`Imóvel ${imovel.tipoImovel} em ${imovel.cidade} - Foto ${swiperIndex + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
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
          {imovel.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex items-center gap-1">
            <span className="font-medium">Local:</span>
            {imovel.bairro}, {imovel.cidade.replace(/_/g, ' ')}
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

export default function ConstrutoraABCPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  // Altere o slug abaixo para o slug do patrocinador correspondente à pasta
  const patrocinadorSlug = "construtora-abc";
  const patrocinadorNome = "Construtora ABC"; // Altere aqui para o nome exibido

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
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">
        Imóveis do Patrocinador: <span className="text-blue-700">{patrocinadorNome}</span>
      </h1>
      {carregando ? (
        <div className="text-center text-gray-600">Carregando imóveis...</div>
      ) : imoveis.length === 0 ? (
        <div className="text-center text-gray-500">Nenhum imóvel cadastrado para este patrocinador.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {imoveis.map((imovel) => (
            <ImovelCardPatrocinador key={imovel.id} imovel={imovel} />
          ))}
        </div>
      )}
    </div>
  );
}