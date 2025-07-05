"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";
import { FiltroImovel } from "@/components/FiltroImoveis";
import { FiFilter, FiHome, FiTrendingUp } from "react-icons/fi";
import { HiOfficeBuilding } from "react-icons/hi";
import { GiBarn, GiTreehouse } from "react-icons/gi";
import cidadesComBairros from "@/constants/cidadesComBairros";
import { opcoesTipoImovel, getTiposPorCategoriaFinalidade } from "@/constants/opcoesTipoImovel";
import { buscarImoveisPorCategoria } from "@/services/buscaImoveis";

// ✅ CONSTANTES
const ITENS_QUANTITATIVOS: Record<string, { chave: string; label: string }[]> = {
  residencial: [
    { chave: "quartos", label: "Quartos" },
    { chave: "suites", label: "Suítes" },
    { chave: "banheiros", label: "Banheiros" },
    { chave: "garagens", label: "Vagas de Garagem" },
    { chave: "metragem", label: "Metragem mínima (m²)" },
  ],
  comercial: [
    { chave: "salas", label: "Salas" },
    { chave: "banheiros", label: "Banheiros" },
    { chave: "garagens", label: "Vagas de Garagem" },
    { chave: "metragem", label: "Metragem mínima (m²)" },
  ],
  rural: [
    { chave: "hectares", label: "Hectares" },
    { chave: "casasFuncionarios", label: "Casas de Funcionários" },
    { chave: "galpoes", label: "Galpões" },
    { chave: "metragem", label: "Metragem mínima (m²)" },
  ]
};

const CONFIGURACAO_PAGINAS: Record<string, {
  titulo: string;
  subtitulo: string;
  descricao: string;
  icone: React.ReactNode;
  cor: string;
  gradiente: string;
}> = {
  "residencial-aluguel": {
    titulo: "Imóveis Residenciais para Alugar",
    subtitulo: "Encontre o lar perfeito para você e sua família",
    descricao: "Descubra uma ampla seleção de casas, apartamentos e outros imóveis residenciais disponíveis para locação. Com opções que atendem todos os perfis e orçamentos, você encontrará o espaço ideal para criar memórias inesquecíveis.",
    icone: <FiHome className="text-4xl lg:text-5xl" />,
    cor: "blue",
    gradiente: "from-blue-500 to-blue-700"
  },
  "residencial-venda": {
    titulo: "Imóveis Residenciais à Venda", 
    subtitulo: "Realize o sonho da casa própria",
    descricao: "Invista no seu futuro! Explore nossa seleção premium de imóveis residenciais à venda. Desde apartamentos modernos até casas espaçosas, encontre a propriedade perfeita para chamar de sua.",
    icone: <FiTrendingUp className="text-4xl lg:text-5xl" />,
    cor: "green",
    gradiente: "from-green-500 to-green-700"
  },
  "comercial-aluguel": {
    titulo: "Imóveis Comerciais para Alugar",
    subtitulo: "O espaço ideal para o seu negócio prosperar",
    descricao: "Encontre o ponto comercial perfeito para alavancar seu empreendimento. Salas, lojas, galpões e espaços estrategicamente localizados para maximizar o potencial do seu negócio.",
    icone: <HiOfficeBuilding className="text-4xl lg:text-5xl" />,
    cor: "purple",
    gradiente: "from-purple-500 to-purple-700"
  },
  "comercial-venda": {
    titulo: "Imóveis Comerciais à Venda",
    subtitulo: "Invista em oportunidades de negócio",
    descricao: "Seja dono do seu próprio espaço comercial! Descubra excelentes oportunidades de investimento em imóveis comerciais com potencial de valorização e retorno garantido.",
    icone: <HiOfficeBuilding className="text-4xl lg:text-5xl" />,
    cor: "indigo",
    gradiente: "from-indigo-500 to-indigo-700"
  },
  "rural-aluguel": {
    titulo: "Imóveis Rurais para Alugar",
    subtitulo: "Conecte-se com a natureza",
    descricao: "Escape da correria urbana! Encontre chácaras, sítios e fazendas para locação. Espaços amplos e tranquilos para relaxar, produzir ou desenvolver projetos rurais.",
    icone: <GiBarn className="text-4xl lg:text-5xl" />,
    cor: "emerald", 
    gradiente: "from-emerald-500 to-emerald-700"
  },
  "rural-venda": {
    titulo: "Imóveis Rurais à Venda",
    subtitulo: "Invista na terra e no futuro",
    descricao: "Adquira sua propriedade rural! Oportunidades únicas de investimento em terras, fazendas e chácaras. Perfeito para agronegócio, lazer ou investimento a longo prazo.",
    icone: <GiTreehouse className="text-4xl lg:text-5xl" />,
    cor: "amber",
    gradiente: "from-amber-500 to-amber-700"
  }
};

// ✅ TIPOS
type SetorTipo = "Residencial" | "Comercial" | "Rural";
type NegocioTipo = "Aluguel" | "Venda";

export default function ImoveisCategoriaPage() {
  const params = useParams();
  
  // ✅ PARAMS NORMALIZADOS
  const categoriaParam = String(params.categoria || "").toLowerCase();
  const tipoNegocioParam = String(params.tipoNegocio || "").toLowerCase();
  
  // ✅ VALORES MEMOIZADOS
  const configuracao = useMemo(() => {
    const chave = `${categoriaParam}-${tipoNegocioParam}`;
    return CONFIGURACAO_PAGINAS[chave];
  }, [categoriaParam, tipoNegocioParam]);

  const tiposImovel = useMemo(() => 
    getTiposPorCategoriaFinalidade(categoriaParam, tipoNegocioParam),
    [categoriaParam, tipoNegocioParam]
  );

  const itensQuantitativos = useMemo(() => 
    ITENS_QUANTITATIVOS[categoriaParam] || [],
    [categoriaParam]
  );

  // ✅ ESTADO
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [mostrarFiltro, setMostrarFiltro] = useState(false);
  const [filtros, setFiltros] = useState<Record<string, string>>(() => ({
    tipoImovel: "",
    cidade: "",
    bairro: "",
    ...Object.fromEntries(itensQuantitativos.map(item => [item.chave, ""]))
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
      ...Object.fromEntries(itensQuantitativos.map(item => [item.chave, ""]))
    });
  }, [itensQuantitativos]);

  // ✅ EFFECTS
  useEffect(() => {
    buscarImoveis();
  }, [buscarImoveis]);

  // ✅ EARLY RETURN se configuração não existe
  if (!configuracao) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-700 mb-4">Página não encontrada</h1>
            <p className="text-gray-600">A categoria ou tipo de negócio solicitado não existe.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      {/* ✅ HERO SECTION */}
      <section className={`bg-gradient-to-r ${configuracao.gradiente} text-white py-16 lg:py-24`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 lg:w-24 lg:h-24 bg-white/20 rounded-full mb-6 lg:mb-8">
              {configuracao.icone}
            </div>
            <h1 className="font-poppins text-3xl sm:text-4xl lg:text-6xl font-extrabold mb-4 lg:mb-6 drop-shadow-lg">
              {configuracao.titulo}
            </h1>
            <p className="font-inter text-lg sm:text-xl lg:text-2xl font-semibold mb-6 lg:mb-8 text-white/90">
              {configuracao.subtitulo}
            </p>
            <p className="font-inter text-sm sm:text-base lg:text-lg max-w-4xl mx-auto leading-relaxed text-white/80">
              {configuracao.descricao}
            </p>
          </div>
        </div>
      </section>

      {/* ✅ STATS SECTION */}
      <section className="py-8 lg:py-12 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div className="text-center">
              <div className={`text-3xl lg:text-4xl font-bold text-${configuracao.cor}-600 mb-2`}>
                {carregando ? "..." : imoveis.length}
              </div>
              <div className="text-gray-600 font-medium">Imóveis Disponíveis</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl lg:text-4xl font-bold text-${configuracao.cor}-600 mb-2`}>
                {tiposImovel.length}
              </div>
              <div className="text-gray-600 font-medium">Tipos de Imóvel</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl lg:text-4xl font-bold text-${configuracao.cor}-600 mb-2`}>
                {Object.keys(cidadesComBairros).length}
              </div>
              <div className="text-gray-600 font-medium">Cidades Atendidas</div>
            </div>
            <div className="text-center">
              <div className={`text-3xl lg:text-4xl font-bold text-${configuracao.cor}-600 mb-2`}>100%</div>
              <div className="text-gray-600 font-medium">Imóveis Verificados</div>
            </div>
          </div>
        </div>
      </section>

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
                className={`flex items-center gap-3 bg-gradient-to-r ${configuracao.gradiente} hover:opacity-90 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer`}
              >
                <FiFilter size={20} />
                Filtrar
              </button>
            </div>
            
            {/* ✅ FILTRO EXPANSÍVEL */}
            <div
              className="transition-all duration-300 ease-in-out overflow-hidden"
              style={{
                maxHeight: mostrarFiltro ? "800px" : "0px",
                opacity: mostrarFiltro ? 1 : 0,
              }}
            >
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
              <div className={`w-12 h-12 border-4 border-${configuracao.cor}-500 border-t-transparent rounded-full animate-spin mb-6`}></div>
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
                className={`bg-gradient-to-r ${configuracao.gradiente} text-white px-8 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity`}
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