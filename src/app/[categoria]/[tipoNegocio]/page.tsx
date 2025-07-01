"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";
import { FiltroImovel } from "@/components/FiltroImoveis";
import { FiFilter } from "react-icons/fi";
import cidadesComBairros from "@/constants/cidadesComBairros";

const opcoesTipoImovel: Record<string, string[]> = {
  "Residencial-Aluguel": [
    "Casa", "Casa em Condomínio Fechado", "Apartamento", "Kitnet", "Flat", "Loft", "Quitinete", "Estúdio", "Outros"
  ],
  "Residencial-Venda": [
    "Casa", "Casa em Condomínio Fechado", "Apartamento", "Terreno", "Sobrado", "Cobertura", "Outros"
  ],
  "Comercial-Aluguel": [
    "Ponto Comercial", "Sala", "Salão", "Prédio", "Terreno", "Galpão", "Box Comercial", "Outros"
  ],
  "Comercial-Venda": [
    "Ponto Comercial", "Sala", "Salão", "Prédio", "Terreno", "Galpão", "Box Comercial", "Outros"
  ],
  "Rural-Aluguel": [
    "Chácara", "Sítio", "Fazenda", "Terreno", "Barracão", "Pousada", "Outros"
  ],
  "Rural-Venda": [
    "Chácara", "Sítio", "Fazenda", "Terreno", "Barracão", "Pousada", "Outros"
  ]
};

const ITENS_QUANTITATIVOS: Record<string, { chave: string; label: string }[]> = {
  Residencial: [
    { chave: "quartos", label: "Quartos" },
    { chave: "suites", label: "Suítes" },
    { chave: "banheiros", label: "Banheiros" },
    { chave: "garagens", label: "Vagas de Garagem" },
    { chave: "metragem", label: "Metragem mínima (m²)" },
  ],
  Comercial: [
    { chave: "salas", label: "Salas" },
    { chave: "banheiros", label: "Banheiros" },
    { chave: "garagens", label: "Vagas de Garagem" },
    { chave: "metragem", label: "Metragem mínima (m²)" },
  ],
  Rural: [
    { chave: "hectares", label: "Hectares" },
    { chave: "casasFuncionarios", label: "Casas de Funcionários" },
    { chave: "galpoes", label: "Galpões" },
    { chave: "metragem", label: "Metragem mínima (m²)" },
  ]
};

const TITULOS: Record<string, { titulo: string; subtitulo: string }> = {
  "Residencial-Aluguel": {
    titulo: "Imóveis Residenciais para Alugar",
    subtitulo: "Encontre o imóvel perfeito para você e sua família. Confira as melhores opções disponíveis para locação!"
  },
  "Residencial-Venda": {
    titulo: "Imóveis Residenciais à Venda",
    subtitulo: "Encontre o imóvel dos seus sonhos para comprar. Veja as melhores oportunidades do mercado!"
  },
  "Comercial-Aluguel": {
    titulo: "Imóveis Comerciais para Alugar",
    subtitulo: "O espaço ideal para o seu negócio está aqui. Confira as melhores opções para locação comercial!"
  },
  "Comercial-Venda": {
    titulo: "Imóveis Comerciais à Venda",
    subtitulo: "Invista no seu negócio! Veja imóveis comerciais disponíveis para compra."
  },
  "Rural-Aluguel": {
    titulo: "Imóveis Rurais para Alugar",
    subtitulo: "Encontre chácaras, sítios e fazendas para locação."
  },
  "Rural-Venda": {
    titulo: "Imóveis Rurais à Venda",
    subtitulo: "Veja as melhores opções de imóveis rurais para comprar."
  }
};

function getCategoriaPadronizada(categoria: string): "Residencial" | "Comercial" | "Rural" {
  if (categoria === "Residencial" || categoria === "Comercial" || categoria === "Rural") {
    return categoria;
  }
  return "Residencial";
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function ImoveisCategoriaPage() {
  const params = useParams();
  const categoriaParam = String(params.categoria || "").toLowerCase();
  const tipoNegocioParam = String(params.tipoNegocio || "").toLowerCase();

  const categoria = categoriaParam.charAt(0).toUpperCase() + categoriaParam.slice(1);
  const tipoNegocio = tipoNegocioParam.charAt(0).toUpperCase() + tipoNegocioParam.slice(1);

  const chave = `${categoria}-${tipoNegocio}`;
  const tiposImovel = opcoesTipoImovel[chave] || [];
  const itensFiltro = useMemo(() => ITENS_QUANTITATIVOS[categoria] || [], [categoria]);
  const titulo = TITULOS[chave]?.titulo || "Imóveis";
  const subtitulo = TITULOS[chave]?.subtitulo || "";

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState<Record<string, string>>({
    tipoImovel: "",
    cidade: "",
    bairro: "",
    ...Object.fromEntries((ITENS_QUANTITATIVOS[categoria] || []).map(item => [item.chave, ""]))
  });
  const [mostrarFiltro, setMostrarFiltro] = useState(false);

  // Serializa os filtros quantitativos para dependência estável
  const filtrosQuantitativosString = useMemo(
    () => itensFiltro.map(item => filtros[item.chave] ?? "").join("|"),
    [filtros, itensFiltro]
  );

  useEffect(() => {
    async function fetchImoveis() {
      setCarregando(true);
      let query = supabase
        .from("imoveis")
        .select("*")
        .eq("tipoNegocio", categoria)
        .eq("setorNegocio", tipoNegocio);

      if (filtros.tipoImovel) query = query.eq("tipoImovel", filtros.tipoImovel);
      if (filtros.cidade) query = query.eq("cidade", filtros.cidade);
      if (filtros.bairro) query = query.eq("bairro", filtros.bairro);

      itensFiltro.forEach(item => {
        const valor = filtros[item.chave];
        if (valor && !isNaN(Number(valor))) {
          query = query.gte(`itens->>${item.chave}`, Number(valor));
        }
      });

      const { data, error } = await query;

      if (error) {
        setImoveis([]);
        setCarregando(false);
        return;
      }

      setImoveis(
        (data as Imovel[]) || []
      );
      setCarregando(false);
    }
    fetchImoveis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    categoria,
    tipoNegocio,
    filtros.tipoImovel,
    filtros.cidade,
    filtros.bairro,
    filtrosQuantitativosString
  ]);

  const categoriaPadronizada = getCategoriaPadronizada(categoria);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
      <Header />
      <main className="flex-1 flex flex-col items-center py-10 px-2">
        <div className="w-full max-w-11/12 mx-auto">
          <div className="text-center mb-5">
            <h1 className="font-poppins text-3xl md:text-5xl font-extrabold text-blue-700 mb-4 drop-shadow" style={{ userSelect: "none" }}>
              {titulo}
            </h1>
            <p className="font-inter text-sm md:text-xl text-blue-900" style={{ userSelect: "none" }}>
              {subtitulo}
            </p>
          </div>
          <div className="flex justify-start mb-2">
            <button
              onClick={() => setMostrarFiltro((v) => !v)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 font-poppins text-white px-4 py-2 rounded font-semibold transition cursor-pointer"
            >
              <FiFilter size={20} />
              Filtro
            </button>
          </div>
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
                opcoesTipoImovel={{ [chave]: tiposImovel }}
                setor={categoriaPadronizada}
                tipoNegocio={tipoNegocio}
                onFiltroChange={setFiltros}
              />
            )}
          </div>
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-15">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="font-inter text-blue-700 font-semibold">Carregando imóveis...</span>
            </div>
          ) : imoveis.length === 0 ? (
            <div className="font-inter text-sm md:text-lg text-center text-blue-700 bg-blue-100 border border-blue-200 p-6 rounded-xl shadow mt-10">
              Nenhum imóvel encontrado.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
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