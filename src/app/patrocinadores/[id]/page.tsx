"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImovelCard from "@/components/ImovelCard";
import { FiltroImovel } from "@/components/FiltroImoveis";
import type { Imovel } from "@/types/Imovel";
import cidadesComBairros from "@/constants/cidadesComBairros";
import { opcoesTipoImovel } from "@/constants/opcoesTipoImovel";

interface Patrocinador {
  id: string;
  nome: string;
  slug: string;
  bannerUrl?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  ownerId?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function PatrocinadorPage() {
  const params = useParams();
  const patrocinadorSlug = String(params.id || "");

  // Estados
  const [patrocinador, setPatrocinador] = useState<Patrocinador | null>(null);
  const [todosImoveis, setTodosImoveis] = useState<Imovel[]>([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoPatrocinador, setCarregandoPatrocinador] = useState(true);
  const [filtrosAtivos, setFiltrosAtivos] = useState<Record<string, string>>({});
  const [setorAtual, setSetorAtual] = useState<'Residencial' | 'Comercial' | 'Rural'>('Residencial');
  const [tipoNegocioAtual, setTipoNegocioAtual] = useState<string>('Venda');

  // Buscar patrocinador
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

        if (error || !data) {
          console.error("Erro ao buscar patrocinador:", error);
          setPatrocinador(null);
        } else {
          setPatrocinador(data as Patrocinador);
        }
      } catch (error) {
        console.error("Erro inesperado:", error);
        setPatrocinador(null);
      } finally {
        setCarregandoPatrocinador(false);
      }
    };

    fetchPatrocinador();
  }, [patrocinadorSlug]);

  // Buscar imóveis do patrocinador
  useEffect(() => {
    const fetchImoveis = async () => {
      if (!patrocinador) return;
      
      setCarregando(true);
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .select("*")
          .eq("patrocinadorId", patrocinador.id)
          .eq("ativo", true)
          .order("criadoEm", { ascending: false });

        if (error) {
          console.error("Erro ao buscar imóveis:", error);
          setTodosImoveis([]);
        } else {
          const imoveis = (data as Imovel[]) || [];
          setTodosImoveis(imoveis);
          setImoveisFiltrados(imoveis);
        }
      } catch (error) {
        console.error("Erro inesperado:", error);
        setTodosImoveis([]);
      } finally {
        setCarregando(false);
      }
    };

    fetchImoveis();
  }, [patrocinador]);

  // Aplicar filtros
  useEffect(() => {
    if (todosImoveis.length === 0) {
      setImoveisFiltrados([]);
      return;
    }

    let resultado = [...todosImoveis];

    // Filtros principais
    if (setorAtual) {
      resultado = resultado.filter(imovel => imovel.setorNegocio === setorAtual);
    }

    if (tipoNegocioAtual) {
      resultado = resultado.filter(imovel => imovel.tipoNegocio === tipoNegocioAtual);
    }

    // Filtros específicos
    Object.entries(filtrosAtivos).forEach(([chave, valor]) => {
      if (!valor) return;

      switch (chave) {
        case 'tipoImovel':
          resultado = resultado.filter(imovel => imovel.tipoImovel === valor);
          break;
        case 'cidade':
          resultado = resultado.filter(imovel => imovel.cidade === valor);
          break;
        case 'bairro':
          resultado = resultado.filter(imovel => imovel.bairro === valor);
          break;
        default:
          // Filtros quantitativos
          if (!isNaN(Number(valor)) && Number(valor) > 0) {
            resultado = resultado.filter(imovel => {
              const itemValue = imovel.itens?.[chave];
              return itemValue && Number(itemValue) >= Number(valor);
            });
          }
          break;
      }
    });

    setImoveisFiltrados(resultado);
  }, [todosImoveis, filtrosAtivos, setorAtual, tipoNegocioAtual]);

  // Detectar setor predominante
  useEffect(() => {
    if (todosImoveis.length > 0) {
      const contadores = { Residencial: 0, Comercial: 0, Rural: 0 };
      
      todosImoveis.forEach(imovel => {
        if (imovel.setorNegocio && contadores.hasOwnProperty(imovel.setorNegocio)) {
          contadores[imovel.setorNegocio as keyof typeof contadores]++;
        }
      });
      
      const setorPredominante = Object.entries(contadores).reduce((a, b) => 
        contadores[a[0] as keyof typeof contadores] > contadores[b[0] as keyof typeof contadores] ? a : b
      )[0] as 'Residencial' | 'Comercial' | 'Rural';
      
      setSetorAtual(setorPredominante);
    }
  }, [todosImoveis]);

  // Handlers
  const handleFiltroChange = (novosFiltros: Record<string, string>) => {
    setFiltrosAtivos(novosFiltros);
  };

  // Loading do patrocinador
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

  // Patrocinador não encontrado
  if (!patrocinador) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-10">
          <div className="font-inter text-lg text-center text-red-700 bg-red-100 border border-red-200 p-6 rounded-xl shadow">
            Patrocinador não encontrado.
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const cidadesAtendidas = new Set(todosImoveis.map(i => i.cidade)).size;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
      <Header />
      
      <main className="flex-1 flex flex-col items-center py-10 px-2">
        <div className="w-full max-w-11/12 mx-auto">
          
          {/* Cabeçalho do Patrocinador */}
          <div className="text-center mb-8">
            <h1 
              className="font-poppins text-3xl md:text-5xl font-extrabold text-blue-700 mb-4 drop-shadow" 
              style={{ userSelect: "none" }}
            >
              {patrocinador.nome}
            </h1>
            <p 
              className="font-inter text-sm md:text-xl text-blue-900 mb-4" 
              style={{ userSelect: "none" }}
            >
              Confira todos os imóveis exclusivos do {patrocinador.nome}. Encontre sua próxima oportunidade!
            </p>
            
            {/* Banner do Patrocinador */}
            {patrocinador.bannerUrl && (
              <div className="w-full max-w-4xl mx-auto mb-6 relative">
                <Image
                  src={patrocinador.bannerUrl}
                  alt={`Banner do ${patrocinador.nome}`}
                  width={1024}
                  height={256}
                  className="w-full h-48 md:h-64 object-cover rounded-xl shadow-lg"
                  priority
                />
              </div>
            )}
          </div>

          {/* Filtros Principais */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Categoria do Imóvel
                </label>
                <select
                  value={setorAtual}
                  onChange={(e) => setSetorAtual(e.target.value as 'Residencial' | 'Comercial' | 'Rural')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  <option value="Residencial">Residencial</option>
                  <option value="Comercial">Comercial</option>
                  <option value="Rural">Rural</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Finalidade
                </label>
                <select
                  value={tipoNegocioAtual}
                  onChange={(e) => setTipoNegocioAtual(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400 bg-white"
                >
                  <option value="Venda">Venda</option>
                  <option value="Aluguel">Aluguel</option>
                </select>
              </div>
            </div>
          </div>

          {/* Componente de Filtro */}
          <FiltroImovel
            cidadesComBairros={cidadesComBairros}
            opcoesTipoImovel={opcoesTipoImovel}
            setor={setorAtual}
            tipoNegocio={tipoNegocioAtual}
            onFiltroChange={handleFiltroChange}
          />

          {/* Estatísticas */}
          <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-blue-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4">
                <span className="text-2xl font-bold text-blue-700">{todosImoveis.length}</span>
                <p className="text-sm text-blue-600">Total de Imóveis</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <span className="text-2xl font-bold text-green-700">{imoveisFiltrados.length}</span>
                <p className="text-sm text-green-600">Imóveis Filtrados</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <span className="text-2xl font-bold text-purple-700">{cidadesAtendidas}</span>
                <p className="text-sm text-purple-600">Cidades Atendidas</p>
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-15">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="font-inter text-blue-700 font-semibold">
                Carregando imóveis...
              </span>
            </div>
          ) : imoveisFiltrados.length === 0 ? (
            <div className="font-inter text-sm md:text-lg text-center text-blue-700 bg-blue-100 border border-blue-200 p-8 rounded-xl shadow mt-10">
              {todosImoveis.length === 0 ? (
                <>
                  <h3 className="font-semibold mb-2">Nenhum imóvel cadastrado</h3>
                  <p>Este patrocinador ainda não possui imóveis cadastrados.</p>
                </>
              ) : (
                <>
                  <h3 className="font-semibold mb-2">Nenhum imóvel encontrado</h3>
                  <p>Tente ajustar os filtros para encontrar mais opções.</p>
                </>
              )}
            </div>
          ) : (
            <>
              <div className="mb-4">
                <p className="text-gray-600 font-inter">
                  Mostrando {imoveisFiltrados.length} de {todosImoveis.length} imóveis
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {imoveisFiltrados.map((imovel) => (
                  <ImovelCard key={imovel.id} imovel={imovel} />
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