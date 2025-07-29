"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";
import { FiltroImovel } from "@/components/FiltroImoveis";
import { FiFilter } from "react-icons/fi";
import cidadesComBairros from "@/constants/cidadesComBairros";
import { opcoesTipoImovel } from "@/constants/opcoesTipoImovel";
import { buscarImoveisPorCategoria } from "@/services/buscaImoveis";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";

type SetorTipo = "Residencial" | "Comercial" | "Rural";
type NegocioTipo = "Aluguel" | "Venda";

export default function ImoveisCategoriaPage() {
  const params = useParams();

  const categoriaParam = String(params.categoria || "").toLowerCase();
  const tiponegocioParam = String(params.tiponegocio || "").toLowerCase();
  const setornegocioParam = String(params.setornegocio || "").toLowerCase();

  const tiponegocioCapitalizado = tiponegocioParam.charAt(0).toUpperCase() + tiponegocioParam.slice(1).toLowerCase();
  const setornegocioCapitalizado = setornegocioParam.charAt(0).toUpperCase() + setornegocioParam.slice(1).toLowerCase();

  const setorCapitalizado = categoriaParam.charAt(0).toUpperCase() + categoriaParam.slice(1).toLowerCase();

  const itensQuantitativos = useMemo(() =>
    (ITENS_POR_SETOR[setorCapitalizado] || []).filter(item =>
      ITENS_QUANTITATIVOS.includes(item.chave)
    ),
    [setorCapitalizado]
  );

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [filtros, setFiltros] = useState<Record<string, string>>(() => ({
    tipoimovel: "",
    cidade: "",
    bairro: "",
    ...Object.fromEntries(
      itensQuantitativos.map((item: { chave: string }) => [item.chave, ""])
    )
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

  const aplicarFiltroLocal = useCallback((imoveis: Imovel[], filtros: Record<string, string>): Imovel[] => {
    const normalize = (str: string) => (str || "").trim().toLowerCase();

    return imoveis.filter(imovel => {
      // Tipo de imóvel
      if (filtros.tipoimovel && normalize(imovel.tipoimovel) !== normalize(filtros.tipoimovel)) return false;
      // Cidade
      if (filtros.cidade && normalize(imovel.cidade) !== normalize(filtros.cidade)) return false;
      // Bairro
      if (filtros.bairro && normalize(imovel.bairro) !== normalize(filtros.bairro)) return false;
      // Valor
      if (filtros.valorMin && Number(imovel.valor) < Number(filtros.valorMin)) return false;
      if (filtros.valorMax && Number(imovel.valor) > Number(filtros.valorMax)) return false;
      // Metragem
      if (filtros.metragemMin && Number(imovel.metragem) < Number(filtros.metragemMin)) return false;
      if (filtros.metragemMax && Number(imovel.metragem) > Number(filtros.metragemMax)) return false;

      // Características específicas (quantitativos e booleanos)
      if (imovel.itens) {
        let itensImovel: Record<string, string | number | boolean | null | undefined> = {};
        try {
          itensImovel = typeof imovel.itens === "string" ? JSON.parse(imovel.itens) : imovel.itens;
        } catch {
          return false;
        }
        for (const [chave, valor] of Object.entries(filtros)) {
          if (
            !['tipoimovel', 'cidade', 'bairro', 'valorMin', 'valorMax', 'metragemMin', 'metragemMax'].includes(chave) &&
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
  }, []);

  const buscarImoveis = useCallback(async () => {
    setCarregando(true);

    try {
      const imoveisBrutos = await buscarImoveisPorCategoria(
        setornegocioCapitalizado,
        tiponegocioCapitalizado,
        filtros
      );

      const imoveisFinais = aplicarFiltroLocal(imoveisBrutos, filtros);
      setImoveis(imoveisFinais);

    } catch {
      setImoveis([]);
    } finally {
      setCarregando(false);
    }
  }, [
    tiponegocioCapitalizado,
    setornegocioCapitalizado,
    filtros,
    aplicarFiltroLocal
  ]);

  useEffect(() => {
    buscarImoveis();
  }, [buscarImoveis]);

  useEffect(() => {
    setPaginaAtual(1);
  }, [imoveis]);

  function pluralizarCategoria(categoria: string) {
    switch (categoria.toLowerCase()) {
      case "residencial":
        return "residenciais";
      case "comercial":
        return "comerciais";
      case "rural":
        return "rurais";
      default:
        return categoria;
    }
  }

  const tituloPagina = `${setornegocioCapitalizado} de imóveis ${pluralizarCategoria(tiponegocioParam)}`;
  const callToAction = "Encontre aqui o imóvel perfeito para você!";

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Header />
      <main className="flex-1 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* TÍTULO DINÂMICO */}
          <h1 className="font-poppins text-2xl lg:text-4xl font-bold text-blue-800 text-center">
            {tituloPagina}
          </h1>
          <p className="font-poppins text-md text-gray-600 mb-6 text-center">
            {callToAction}
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

            {/* FILTRO EXPANSÍVEL */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden
                          ${mostrarFiltro ? 'max-h-350 opacity-100' : 'max-h-0 opacity-0'}`}>

              {mostrarFiltro && (
                <div>
                  <FiltroImovel
                    cidadesComBairros={cidadesComBairros}
                    opcoesTipoImovel={opcoesTipoImovel}
                    setor={obterSetor(tiponegocioParam)} // "Residencial", "Comercial", "Rural"
                    tipoNegocio={obterTipoNegocio(setornegocioParam)} // "Aluguel", "Venda"
                    onFiltroChange={setFiltros}
                    mostrarCategoriaNegocio={false}
                  />
                </div>
              )}
            </div>
          </div>

          {/* RESULTADOS */}
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <span className="font-poppins text-gray-700 font-semibold text-lg">
                Carregando imóveis...
              </span>
            </div>
          ) : imoveis.length === 0 ? (
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
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <p className="font-inter text-gray-600 text-normal">
                  <span className="font-semibold">{imoveis.length}</span>
                  {imoveis.length === 1 ? ' imóvel encontrado' : ` ${pluralizarCategoria(setorCapitalizado)} encontrados`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {imoveisPaginados.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
                ))}
              </div>

              {/* PAGINAÇÃO */}
              {totalPaginas > 1 && (
                <div className="flex justify-center items-center gap-2 mb-6">
                  <button
                    onClick={() => setPaginaAtual((p) => Math.max(1, p - 1))}
                    disabled={paginaAtual === 1}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  <span className="mx-2">
                    Parte {paginaAtual} de {totalPaginas}
                  </span>
                  <button
                    onClick={() => setPaginaAtual((p) => Math.min(totalPaginas, p + 1))}
                    disabled={paginaAtual === totalPaginas}
                    className="px-3 py-1 rounded bg-blue-100 text-blue-700 font-semibold disabled:opacity-50"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}