"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";
import { FiltroImovel } from "@/components/FiltroImoveis";
import { FiFilter } from "react-icons/fi";
import { opcoesTipoImovel } from "@/constants/opcoesTipoImovel";
import { buscarImoveisPorCategoria } from "@/services/buscaImoveis";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";

type SetorTipo = "Residencial" | "Comercial" | "Rural";
type NegocioTipo = "Aluguel" | "Venda";

export default function ImoveisCategoriaPage() {
  const params = useParams();
  const paramsUrl = useMemo(() => {
    const categoriaParam = String(params.categoria || "").toLowerCase();
    const tiponegocioParam = String(params.tiponegocio || "").toLowerCase();
    const setornegocioParam = String(params.setornegocio || "").toLowerCase();

    return {
      categoria: categoriaParam,
      tiponegocio: tiponegocioParam,
      setornegocio: setornegocioParam,
      tiponegocioCapitalizado: tiponegocioParam.charAt(0).toUpperCase() + tiponegocioParam.slice(1),
      setornegocioCapitalizado: setornegocioParam.charAt(0).toUpperCase() + setornegocioParam.slice(1),
      setorCapitalizado: categoriaParam.charAt(0).toUpperCase() + categoriaParam.slice(1)
    };
  }, [params]);

  const itensQuantitativos = useMemo(() =>
    (ITENS_POR_SETOR[paramsUrl.setorCapitalizado] || []).filter(item =>
      ITENS_QUANTITATIVOS.includes(item.chave)
    ),
    [paramsUrl.setorCapitalizado]
  );

  const [imoveisBrutos, setImoveisBrutos] = useState<Imovel[]>([]);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [filtros, setFiltros] = useState<Record<string, string>>(() => ({
    tipoimovel: "",
    cidade: "",
    bairro: "",
    ...Object.fromEntries(itensQuantitativos.map(item => [item.chave, ""]))
  }));
  const [paginaAtual, setPaginaAtual] = useState(1);

  const itensPorPagina = 20;
  const totalPaginas = Math.ceil(imoveis.length / itensPorPagina);
  const imoveisPaginados = useMemo(() => {
    const inicio = (paginaAtual - 1) * itensPorPagina;
    return imoveis.slice(inicio, inicio + itensPorPagina);
  }, [imoveis, paginaAtual]);

  const obterSetor = useCallback((categoria: string): SetorTipo => {
    const map: Record<string, SetorTipo> = {
      residencial: "Residencial",
      comercial: "Comercial", 
      rural: "Rural"
    };
    return map[categoria.toLowerCase()] || "Residencial";
  }, []);

  const obterTipoNegocio = useCallback((tipo: string): NegocioTipo => {
    const map: Record<string, NegocioTipo> = {
      aluguel: "Aluguel",
      venda: "Venda"
    };
    return map[tipo.toLowerCase()] || "Aluguel";
  }, []);

  const normalizeString = useCallback((str: string) => {
    if (!str) return "";
    return str.toString().trim().toLowerCase()
      .replace(/[áàâãä]/g, 'a')
      .replace(/[éèêë]/g, 'e')
      .replace(/[íìîï]/g, 'i')
      .replace(/[óòôõö]/g, 'o')
      .replace(/[úùûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/[ñ]/g, 'n')
      .replace(/_/g, ' ')
      .replace(/\s+/g, ' ');
  }, []);

  const pluralizarCategoria = useCallback((categoria: string) => {
    const map: Record<string, string> = {
      residencial: "residenciais",
      comercial: "comerciais",
      rural: "rurais"
    };
    return map[categoria.toLowerCase()] || categoria;
  }, []);

  const aplicarFiltroLocal = useCallback((imoveis: Imovel[], filtros: Record<string, string>): Imovel[] => {
    if (!imoveis?.length) return [];
    
    const filtrosAtivos = Object.entries(filtros).filter(([, value]) => 
      value && value !== "" && value !== "0"
    );
    
    if (!filtrosAtivos.length) {
      return imoveis;
    }

    const imoveisFiltrados = imoveis.filter(imovel => {
      if (filtros.tipoimovel && filtros.tipoimovel !== "") {
        const tipoFiltro = normalizeString(filtros.tipoimovel);
        const tipoImovel = normalizeString(imovel.tipoimovel || "");
        if (tipoImovel !== tipoFiltro) {
          return false;
        }
      }
      
      if (filtros.cidade && filtros.cidade !== "") {
        const cidadeFiltro = normalizeString(filtros.cidade);
        const cidadeImovel = normalizeString(imovel.cidade || "");
        if (!cidadeImovel.includes(cidadeFiltro)) {
          return false;
        }
      }
      
      if (filtros.bairro && filtros.bairro !== "") {
        const bairroFiltro = normalizeString(filtros.bairro);
        const bairroImovel = normalizeString(imovel.bairro || "");
        if (!bairroImovel.includes(bairroFiltro)) {
          return false;
        }
      }
      
      if (filtros.valorMin) {
        const valorMin = Number(filtros.valorMin);
        const valorImovel = Number(imovel.valor) || 0;
        if (valorImovel < valorMin) return false;
      }

      if (filtros.valorMax) {
        const valorMax = Number(filtros.valorMax);
        const valorImovel = Number(imovel.valor) || 0;
        if (valorImovel > valorMax) return false;
      }
      
      if (filtros.metragemMin) {
        const metragemMin = Number(filtros.metragemMin);
        const metragemImovel = Number(imovel.metragem) || 0;
        if (metragemImovel < metragemMin) return false;
      }

      if (filtros.metragemMax) {
        const metragemMax = Number(filtros.metragemMax);
        const metragemImovel = Number(imovel.metragem) || 0;
        if (metragemImovel > metragemMax) return false;
      }

      if (imovel.itens) {
        try {
          const itensImovel = typeof imovel.itens === "string" ? 
            JSON.parse(imovel.itens) : imovel.itens;
          
          for (const [chave, valor] of Object.entries(filtros)) {
            if (['tipoimovel', 'cidade', 'bairro', 'valorMin', 'valorMax', 'metragemMin', 'metragemMax'].includes(chave)) {
              continue;
            }
            
            if (valor !== "" && valor !== "0") {
              const valorFiltro = Number(valor);
              const valorImovel = Number(itensImovel[chave] || 0);
              
              if (ITENS_QUANTITATIVOS.includes(chave)) {
                if (valorImovel < valorFiltro) return false;
              } else {
                if (valorImovel !== valorFiltro) return false;
              }
            }
          }
        } catch {
          return false;
        }
      }
      
      return true;
    });
    
    return imoveisFiltrados;
  }, [normalizeString]);

  const textos = useMemo(() => ({
    titulo: `${paramsUrl.setornegocioCapitalizado} de imóveis ${pluralizarCategoria(paramsUrl.tiponegocio)}`,
    callToAction: "Encontre aqui o imóvel perfeito para você!",
    resultados: imoveis.length === 1 ? 
      ' imóvel encontrado' : 
      ` ${pluralizarCategoria(paramsUrl.setorCapitalizado)} encontrados`
  }), [paramsUrl, pluralizarCategoria, imoveis.length]);

  useEffect(() => {
    setCarregando(true);

    const buscarImoveis = async () => {
      try {
        const imoveis = await buscarImoveisPorCategoria(
          paramsUrl.setornegocioCapitalizado,
          paramsUrl.tiponegocioCapitalizado
        );
        
        setImoveisBrutos(imoveis);
        
        const filtrosIniciais = {
          tipoimovel: "",
          cidade: "",
          bairro: "",
          ...Object.fromEntries(itensQuantitativos.map(item => [item.chave, ""]))
        };
        
        const imoveisFinais = aplicarFiltroLocal(imoveis, filtrosIniciais);
        setImoveis(imoveisFinais);
        setFiltros(filtrosIniciais);

      } catch (error) {
        console.error("Erro na busca:", error);
        setImoveisBrutos([]);
        setImoveis([]);
      } finally {
        setCarregando(false);
      }
    };

    buscarImoveis();
  }, [paramsUrl.setornegocioCapitalizado, paramsUrl.tiponegocioCapitalizado, itensQuantitativos, aplicarFiltroLocal]);

  useEffect(() => {
    if (imoveisBrutos.length > 0) {
      const imoveisFinais = aplicarFiltroLocal(imoveisBrutos, filtros);
      setImoveis(imoveisFinais);
      setPaginaAtual(1);
    }
  }, [filtros, imoveisBrutos, aplicarFiltroLocal]);

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
      <span className="font-poppins text-gray-700 font-semibold text-lg">
        Carregando imóveis...
      </span>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-20">
      <div className="text-5xl mb-6">🏠</div>
      <h3 className="text-2xl font-bold text-gray-700 mb-2">
        Nenhum imóvel encontrado
      </h3>
      <p className="text-gray-600 text-sm mb-8 max-w-md mx-auto">
        Não encontramos imóveis que correspondam aos filtros selecionados.
        Tente ajustar os critérios de busca.
      </p>
    </div>
  );

  const Pagination = () => (
    totalPaginas > 1 && (
      <div className="flex justify-center items-center gap-2 mb-6">
        <button
          onClick={() => setPaginaAtual(p => Math.max(1, p - 1))}
          disabled={paginaAtual === 1}
          className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
        >
          Anterior
        </button>
        <span className="mx-2">
          Parte {paginaAtual} de {totalPaginas}
        </span>
        <button
          onClick={() => setPaginaAtual(p => Math.min(totalPaginas, p + 1))}
          disabled={paginaAtual === totalPaginas}
          className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
        >
          Próxima
        </button>
      </div>
    )
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <main className="flex-1 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* TÍTULO */}
          <h1 className="font-poppins text-2xl lg:text-4xl font-bold text-blue-800 text-center">
            {textos.titulo}
          </h1>
          <p className="font-poppins text-md text-gray-600 mb-6 text-center">
            {textos.callToAction}
          </p>

          {/* FILTROS */}
          <div className="mb-2 lg:mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-poppins text-xl lg:text-3xl font-bold text-gray-800">
                Explore os Imóveis
              </h2>
              <button
                onClick={() => setMostrarFiltro(!mostrarFiltro)}
                className="font-poppins flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <FiFilter size={20} />
                Filtrar
              </button>
            </div>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
              mostrarFiltro ? 'max-h-350 opacity-100' : 'max-h-0 opacity-0'
            }`}>
              {mostrarFiltro && (
                <FiltroImovel
                  opcoesTipoImovel={opcoesTipoImovel}
                  setor={obterSetor(paramsUrl.tiponegocio)}
                  tipoNegocio={obterTipoNegocio(paramsUrl.setornegocio)}
                  onFiltroChange={setFiltros}
                  mostrarCategoriaNegocio={false}
                />
              )}
            </div>
          </div>

          {/* RESULTADOS */}
          {carregando ? (
            <LoadingSpinner />
          ) : imoveis.length === 0 ? (
            <EmptyState />
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <p className="font-inter text-gray-600 text-normal">
                  <span className="font-semibold">{imoveis.length}</span>
                  {textos.resultados}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {imoveisPaginados.map((imovel) => (
                  <ImovelCard 
                    key={imovel.id} 
                    imovel={imovel} 
                    contexto="categoria" 
                  />
                ))}
              </div>

              <Pagination />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}