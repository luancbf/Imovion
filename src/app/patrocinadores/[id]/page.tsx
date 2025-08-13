"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, usePathname } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";
import { FiltroImovel } from "@/components/FiltroImoveis";
import { opcoesTipoImovel } from "@/constants/opcoesTipoImovel";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";
import { FiFilter } from "react-icons/fi";

interface Patrocinador {
  id: string;
  nome: string;
  slug: string;
  bannerurl?: string;
  criadoem?: string;
  atualizadoem?: string;
  ownerid?: string;
  creci?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function PatrocinadorPage() {
  const params = useParams();
  const patrocinadorSlug = String(params.id || "");

  const [patrocinador, setPatrocinador] = useState<Patrocinador | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoPatrocinador, setCarregandoPatrocinador] = useState(true);

  // Filtros
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [filtros, setFiltros] = useState<Record<string, string>>({});
  
  const [setor, setSetor] = useState<"" | "Residencial" | "Comercial" | "Rural">("");
  const [tipoNegocio, setTipoNegocio] = useState<"" | "Aluguel" | "Venda">("");

  // Função para aplicar filtro local (igual categoria/tiponegocio)
  const aplicarFiltroLocal = useCallback(
    (imoveis: Imovel[], filtros: Record<string, string>): Imovel[] => {
      const normalize = (str: string) => (str || "").trim().toLowerCase();

      function determinarSetor(imovel: Imovel): "Residencial" | "Comercial" | "Rural" {
        const tipo = imovel.tipoimovel?.toLowerCase() || "";
        if (tipo.includes("casa") || tipo.includes("apartamento") || tipo.includes("residencial")) return "Residencial";
        if (tipo.includes("comercial") || tipo.includes("loja") || tipo.includes("escritorio") || tipo.includes("ponto")) return "Comercial";
        if (tipo.includes("fazenda") || tipo.includes("sitio") || tipo.includes("rural") || tipo.includes("chacara") || tipo.includes("terreno")) return "Rural";
        return "Residencial";
      }

      return imoveis.filter((imovel) => {
        if (filtros.tipoimovel && normalize(imovel.tipoimovel) !== normalize(filtros.tipoimovel))
          return false;
        if (filtros.cidade && normalize(imovel.cidade) !== normalize(filtros.cidade)) return false;
        if (filtros.bairro && normalize(imovel.bairro) !== normalize(filtros.bairro)) return false;
        if (filtros.valorMin && Number(imovel.valor) < Number(filtros.valorMin)) return false;
        if (filtros.valorMax && Number(imovel.valor) > Number(filtros.valorMax)) return false;
        if (filtros.metragemMin && Number(imovel.metragem) < Number(filtros.metragemMin)) return false;
        if (filtros.metragemMax && Number(imovel.metragem) > Number(filtros.metragemMax)) return false;

        // Corrigido: filtra por setor usando função
        if (setor && determinarSetor(imovel) !== setor) return false;

        // Corrigido: filtra por tipoNegocio
        if (tipoNegocio && normalize(imovel.setornegocio ?? "") !== normalize(tipoNegocio)) return false;
        if (imovel.itens) {
          let itensImovel: Record<string, string | number | boolean | null | undefined> = {};
          try {
            itensImovel = typeof imovel.itens === "string" ? JSON.parse(imovel.itens) : imovel.itens;
          } catch {
            return false;
          }
          for (const [chave, valor] of Object.entries(filtros)) {
            if (
              !["tipoimovel", "cidade", "bairro", "valorMin", "valorMax", "metragemMin", "metragemMax"].includes(
                chave
              ) &&
              valor !== ""
            ) {
              const valorFiltro = Number(valor);
              const valorImovel = Number(itensImovel[chave] || 0);
              if (ITENS_QUANTITATIVOS.includes(chave)) {
                if (valorImovel < valorFiltro) return false;
              } else {
                if (valorImovel !== valorFiltro) return false;
              }
            }
          }
        }
        return true;
      });
    },
    [setor, tipoNegocio]
  );

  useEffect(() => {
    const fetchPatrocinador = async () => {
      if (!patrocinadorSlug) return;
      setCarregandoPatrocinador(true);
      try {
        const { data, error } = await supabase
          .from("patrocinadores")
          .select("*")
          .eq("slug", patrocinadorSlug)
          .single();

        if (error) {
          setPatrocinador(null);
        } else if (data) {
          setPatrocinador(data as Patrocinador);
        } else {
          setPatrocinador(null);
        }
      } catch {
        setPatrocinador(null);
      } finally {
        setCarregandoPatrocinador(false);
      }
    };

    fetchPatrocinador();
  }, [patrocinadorSlug]);

  useEffect(() => {
    const fetchImoveis = async () => {
      if (!patrocinador) {
        return;
      }
      setCarregando(true);
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .select("*")
          .eq("patrocinadorid", patrocinador.id)
          .eq("ativo", true)
          .order("datacadastro", { ascending: false });

        if (error) {
          setImoveis([]);
        } else {
          const todosImoveis = (data as Imovel[]) || [];
          setImoveis(todosImoveis);
        }
      } catch {
        setImoveis([]);
      } finally {
        setCarregando(false);
      }
    };

    fetchImoveis();
  }, [patrocinador]);

  // Imóveis filtrados localmente
  const imoveisFiltrados = useMemo(
    () => aplicarFiltroLocal(imoveis, filtros),
    [imoveis, filtros, aplicarFiltroLocal]
  );

  // Atualize o useEffect para limpar filtros ao trocar setor/tipoNegocio:
  useEffect(() => {
    setFiltros({
      tipoimovel: "",
      cidade: "",
      bairro: "",
      ...Object.fromEntries(
        (ITENS_POR_SETOR[setor] || []).map((item) => [item.chave, ""])
      ),
    });
  }, [setor, tipoNegocio]);

  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && window.gtag && patrocinador) {
      window.gtag("event", "view_patrocinador", {
        patrocinador_id: patrocinador.id,
        patrocinador_nome: patrocinador.nome,
        page_path: pathname,
      });
    }
  }, [patrocinador, pathname]);

  if (carregandoPatrocinador) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="flex flex-col items-center justify-center py-15">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="font-inter text-blue-700 font-semibold">
              Carregando patrocinador...
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!patrocinador) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="font-inter text-lg text-center text-red-700 bg-red-100 border border-red-200 p-6 rounded-xl shadow max-w-md mx-auto">
            <h2 className="font-bold mb-2">❌ Patrocinador não encontrado</h2>
            <p className="text-sm">Verifique se o link está correto ou tente novamente.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
      <Header />
      <main className="flex-1 flex flex-col items-center py-10 px-2">
        <div className="w-full max-w-7xl mx-auto">
          {/* Cabeçalho do Patrocinador */}
          <div className="text-center mb-8">
            {/* Hero do Patrocinador */}
            <div className="relative text-center mb-8">
              <div className="absolute inset-0 -z-10 flex justify-center items-center pointer-events-none">
                <div className="w-full h-full bg-gradient-to-r from-blue-100 via-white to-blue-100 opacity-60 rounded-3xl blur-lg"></div>
              </div>
              <h1
                className="font-poppins text-3xl md:text-5xl font-extrabold text-blue-900 mb-2 drop-shadow"
                style={{ userSelect: "none" }}
              >
                {patrocinador.nome}
              </h1>
              {patrocinador.creci && (
                <p className="font-inter text-base md:text-lg text-blue-800 mb-2">
                  CRECI: <strong>{patrocinador.creci}</strong>
                </p>
              )}
              <p className="font-inter text-base text-gray-600 max-w-xl mx-auto">
                Explore os imóveis disponíveis e conte com o atendimento especializado do patrocinador para realizar o seu sonho. 
                <span className="ml-1 text-blue-700 font-bold">Encontre, negocie e conquiste!</span>
              </p>
              {/* Banner do Patrocinador */}
              {patrocinador.bannerurl && (
                <div className="w-full max-w-4xl mx-auto mt-6 relative">
                  <Image
                    src={patrocinador.bannerurl}
                    alt={`Banner do ${patrocinador.nome}`}
                    width={1024}
                    height={256}
                    className="w-full h-48 md:h-64 object-cover rounded-xl shadow-lg"
                    priority
                    onError={(e) => {
                      console.error("Erro ao carregar banner:", patrocinador.bannerurl);
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* FILTRO DE IMÓVEIS */}
          <div className="mb-2 lg:mb-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-6">
              <button
                onClick={() => setMostrarFiltro(!mostrarFiltro)}
                className="font-poppins flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <FiFilter size={20} />
                Filtrar
              </button>
            </div>
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                mostrarFiltro ? "max-h-350 opacity-100" : "max-h-0 opacity-0"
              }`}
            >
              {mostrarFiltro && (
                <div>
                  <FiltroImovel
                    opcoesTipoImovel={opcoesTipoImovel}
                    setor={setor}
                    tipoNegocio={tipoNegocio}
                    onSetorChange={setSetor}
                    onTipoNegocioChange={setTipoNegocio}
                    onFiltroChange={setFiltros}
                    mostrarCategoriaNegocio={true}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RESULTADOS */}
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="font-inter text-blue-700 font-semibold text-lg">
                🔄 Carregando imóveis...
              </span>
            </div>
          ) : imoveisFiltrados.length === 0 ? (
            <div className="font-inter text-center text-blue-700 bg-blue-100 border border-blue-200 p-8 rounded-xl shadow-lg mt-10 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🏘️</div>
              <h3 className="text-xl font-bold mb-2">Nenhum imóvel cadastrado</h3>
              <p className="text-blue-600">
                <strong>{patrocinador.nome}</strong> ainda não possui imóveis cadastrados.
                Volte em breve para conferir as novidades!
              </p>
            </div>
          ) : (
            <>
              {/* Grid de imóveis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {imoveisFiltrados.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} contexto="patrocinador" />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}