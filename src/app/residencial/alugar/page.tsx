"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";
import { FiltroImovel, filtrarImoveisFrontend } from "@/components/FiltroImoveis";
import { FiFilter } from "react-icons/fi";
import cidadesComBairros from "@/constants/cidadesComBairros";


const opcoesTipoImovel: Record<string, string[]> = {
  'Residencial-Aluguel': [
    'Casa', 'Casa em Condomínio Fechado', 'Apartamento', 'Kitnet', 'Flat', 'Loft', 'Quitinete', 'Estúdio', 'Outros'
  ]
};

// Itens quantitativos para filtro residencial
const ITENS_RESIDENCIAL = [
  { chave: "quartos", label: "Quartos" },
  { chave: "suites", label: "Suítes" },
  { chave: "banheiros", label: "Banheiros" },
  { chave: "garagens", label: "Vagas de Garagem" },
  { chave: "metragem", label: "Metragem mínima (m²)" },
];

export default function ResidencialAlugarPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState<Record<string, string>>({
    tipoImovel: "",
    cidade: "",
    bairro: "",
    quartos: "",
    suites: "",
    banheiros: "",
    garagens: "",
    metragem: "",
  });
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  useEffect(() => {
    async function fetchImoveis() {
      setCarregando(true);

      // Só filtros principais na query!
      const filtrosQuery = [
        where("tipoNegocio", "==", "Residencial"),
        where("setorNegocio", "==", "Aluguel"),
      ];

      if (filtros.tipoImovel)
        filtrosQuery.push(where("tipoImovel", "==", filtros.tipoImovel));
      if (filtros.cidade)
        filtrosQuery.push(where("cidade", "==", filtros.cidade));
      if (filtros.bairro)
        filtrosQuery.push(where("bairro", "==", filtros.bairro));

      const q = query(collection(db, "imoveis"), ...filtrosQuery);

      const snapshot = await getDocs(q);
      const lista: Imovel[] = snapshot.docs.map((doc) => {
        const data = doc.data() as Omit<Imovel, "id">;
        return { id: doc.id, ...data };
      });
      setImoveis(lista);
      setCarregando(false);
    }
    fetchImoveis();
  }, [filtros.tipoImovel, filtros.cidade, filtros.bairro]);

  // Filtrar itens no frontend
  useEffect(() => {
    setImoveisFiltrados(
      filtrarImoveisFrontend(imoveis, filtros, ITENS_RESIDENCIAL)
    );
  }, [imoveis, filtros]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
      <Header />
      <main className="flex-1 flex flex-col items-center py-10 px-2">
        <div className="w-full max-w-11/12 mx-auto">
          <div className="text-center mb-5">
            <h1
              className="font-poppins text-3xl md:text-5xl font-extrabold text-blue-700 mb-4 drop-shadow"
              style={{ userSelect: "none" }}
            >
              Imóveis Residenciais para Alugar
            </h1>
            <p
              className="font-inter text-sm md:text-xl text-blue-900"
              style={{ userSelect: "none" }}
            >
              Encontre o imóvel perfeito para você e sua família. Confira as melhores opções disponíveis para locação!
            </p>
          </div>
          {/* Botão para mostrar/ocultar filtro à esquerda */}
          <div className="flex justify-start mb-2">
            <button
              onClick={() => setMostrarFiltro((v) => !v)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 font-poppins text-white px-4 py-2 rounded font-semibold transition cursor-pointer"
            >
              <FiFilter size={20} />
              Filtro
            </button>
          </div>
          {/* Filtro de imóveis com transição suave */}
          <div
            style={{
              transition: "max-height 0.4s cubic-bezier(0.4,0,0.2,1), opacity 0.4s cubic-bezier(0.4,0,0.2,1)",
              overflow: "hidden",
              maxHeight: mostrarFiltro ? 600 : 0,
              opacity: mostrarFiltro ? 1 : 0,
            }}
          >
            {mostrarFiltro && (
              <FiltroImovel
                cidadesComBairros={cidadesComBairros}
                opcoesTipoImovel={opcoesTipoImovel}
                setor="Residencial"
                tipoNegocio="Aluguel"
                onFiltroChange={setFiltros}
              />
            )}
          </div>
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-15">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="font-inter text-blue-700 font-semibold">Carregando imóveis...</span>
            </div>
          ) : imoveisFiltrados.length === 0 ? (
            <div className="font-inter text-sm md:text-lg text-center text-blue-700 bg-blue-100 border border-blue-200 p-6 rounded-xl shadow mt-10">
              Nenhum imóvel residencial para aluguel encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {imoveisFiltrados.map((imovel) => (
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