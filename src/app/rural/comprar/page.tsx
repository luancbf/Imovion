'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";

export default function RuralComprarPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchImoveis() {
      setCarregando(true);
      const q = query(
        collection(db, "imoveis"),
        where("tipoNegocio", "==", "Rural"),
        where("setorNegocio", "==", "Comprar")
      );
      const snapshot = await getDocs(q);
      const lista: Imovel[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Imovel[];
      setImoveis(lista);
      setCarregando(false);
    }
    fetchImoveis();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
      <Header />
      <main className="flex-1 flex flex-col items-center py-10 px-2">
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4 drop-shadow"
              style={{ userSelect: "none" }}
            >
              Imóveis Rurais para Comprar
            </h1>
            <p
              className="text-lg md:text-xl text-blue-900"
              style={{ userSelect: "none" }}
            >
              Encontre propriedades rurais ideais para investimento, lazer ou produção. Veja as melhores oportunidades disponíveis!
            </p>
          </div>
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="text-blue-700 font-semibold">Carregando imóveis...</span>
            </div>
          ) : imoveis.length === 0 ? (
            <div className="text-center text-blue-700 bg-blue-100 border border-blue-200 p-6 rounded-xl shadow mt-10">
              Nenhum imóvel rural para compra encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {imoveis.map((imovel) => (
                <ImovelCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          )}
          <p
            className="text-xs text-gray-500 text-center mt-10 select-none"
            style={{ userSelect: "none" }}
          >
            *Todos os imóveis anunciados passam por aprovação antes da publicação.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}