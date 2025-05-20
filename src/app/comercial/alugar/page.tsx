'use client';

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ImovelCard from "@/components/ImovelCard";

interface Imovel {
  id: string;
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
}

export default function ComercialAlugarPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function fetchImoveis() {
      setCarregando(true);
      const q = query(
        collection(db, "imoveis"),
        where("tipoNegocio", "==", "Comercial"),
        where("setorNegocio", "==", "Aluguel")
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
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold mb-8 text-center text-green-800">
            Imóveis Comerciais para Alugar
          </h1>
          {carregando ? (
            <div className="text-center text-gray-600">Carregando imóveis...</div>
          ) : imoveis.length === 0 ? (
            <div className="text-center text-gray-500">Nenhum imóvel comercial para aluguel encontrado.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {imoveis.map((imovel) => (
                <ImovelCard key={imovel.id} imovel={imovel} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}