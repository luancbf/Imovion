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

// ✅ TIPOS
type SetorTipo = "Residencial" | "Comercial" | "Rural";
type NegocioTipo = "Aluguel" | "Venda";

export default function ImoveisCategoriaPage() {
  const params = useParams();

  const categoriaParam = String(params.categoria || "").toLowerCase();
  const tipoNegocioParam = String(params.tipoNegocio || "").toLowerCase();

  const setorCapitalizado = categoriaParam.charAt(0).toUpperCase() + categoriaParam.slice(1).toLowerCase();

  const itensQuantitativos = useMemo(() =>
    (ITENS_POR_SETOR[setorCapitalizado] || []).filter(item =>
      ITENS_QUANTITATIVOS.includes(item.chave)
    ),
    [setorCapitalizado]
  );

  // ✅ ESTADO
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [filtros, setFiltros] = useState<Record<string, string>>(() => ({
    tipoImovel: "",
    cidade: "",
    bairro: "",
    ...Object.fromEntries(
      itensQuantitativos.map((item: { chave: string }) => [item.chave, ""])
    )
  }));

  // ✅ FUNÇÕES UTILITÁRIAS
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

  // ✅ FILTRO LOCAL OTIMIZADO
  const aplicarFiltroLocal = useCallback((imoveis: Imovel[], filtros: Record<string, string>): Imovel[] => {
    if (!filtros.tipoImovel) return imoveis;
    return imoveis.filter(imovel =>
      imovel.tipoimovel === filtros.tipoImovel
    );
  }, []);

  // ✅ BUSCA DE IMÓVEIS OTIMIZADA
  const buscarImoveis = useCallback(async () => {
    setCarregando(true);

    try {
      const imoveisBrutos = await buscarImoveisPorCategoria(
        categoriaParam,
        tipoNegocioParam,
        filtros
      );

      const imoveisFinais = aplicarFiltroLocal(imoveisBrutos, filtros);
      setImoveis(imoveisFinais);

      // ✅ Log simplificado
      console.log(`✅ Encontrados ${imoveisFinais.length} imóveis para ${categoriaParam}/${tipoNegocioParam}`);

    } catch (error) {
      console.error('❌ Erro ao buscar imóveis:', error);
      setImoveis([]);
    } finally {
      setCarregando(false);
    }
  }, [categoriaParam, tipoNegocioParam, filtros, aplicarFiltroLocal]);

  // ✅ LIMPAR FILTROS
  const limparFiltros = useCallback(() => {
    setFiltros({
      tipoImovel: "",
      cidade: "",
      bairro: "",
      ...Object.fromEntries(
        itensQuantitativos.map((item: { chave: string }) => [item.chave, ""])
      )
    });
  }, [itensQuantitativos]);

  // ✅ EFFECTS
  useEffect(() => {
    buscarImoveis();
  }, [buscarImoveis]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Header />

      {/* ✅ MAIN CONTENT */}
      <main className="flex-1 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* ✅ FILTROS */}
          <div className="mb-8 lg:mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
                Explore os Imóveis
              </h2>
              <button
                onClick={() => setMostrarFiltro(!mostrarFiltro)}
                className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer"
              >
                <FiFilter size={20} />
                Filtrar
              </button>
            </div>

            {/* ✅ FILTRO EXPANSÍVEL */}
            <div className={`transition-all duration-300 ease-in-out overflow-hidden
                          ${mostrarFiltro ? 'max-h-350 opacity-100' : 'max-h-0 opacity-0'}`}>

              {mostrarFiltro && (
                <div>
                  <FiltroImovel
                    cidadesComBairros={cidadesComBairros}
                    opcoesTipoImovel={opcoesTipoImovel}
                    setor={obterSetor(categoriaParam)}
                    tipoNegocio={obterTipoNegocio(tipoNegocioParam)}
                    onFiltroChange={setFiltros}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ✅ RESULTADOS */}
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
              <span className="font-inter text-gray-700 font-semibold text-lg">
                Carregando imóveis...
              </span>
            </div>
          ) : imoveis.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-6">🏠</div>
              <h3 className="text-2xl font-bold text-gray-700 mb-4">
                Nenhum imóvel encontrado
              </h3>
              <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                Não encontramos imóveis que correspondam aos filtros selecionados.
                Tente ajustar os critérios de busca.
              </p>
              <button
                onClick={limparFiltros}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-opacity"
              >
                Limpar Filtros
              </button>
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-8">
                <p className="text-gray-600 text-lg">
                  <span className="font-semibold">{imoveis.length}</span>
                  {imoveis.length === 1 ? ' imóvel encontrado' : ' imóveis encontrados'}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
                {imoveis.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}