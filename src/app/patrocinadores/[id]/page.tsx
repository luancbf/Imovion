"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";

interface Patrocinador {
  id: string;
  nome: string;
  slug: string;
  bannerurl?: string;
  criadoem?: string;
  atualizadoem?: string;
  ownerid?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function PatrocinadorPage() {
  const params = useParams();
  const patrocinadorSlug = String(params.id || "");

  // Estados simplificados
  const [patrocinador, setPatrocinador] = useState<Patrocinador | null>(null);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [carregandoPatrocinador, setCarregandoPatrocinador] = useState(true);

  // ✅ Buscar patrocinador
  useEffect(() => {
    const fetchPatrocinador = async () => {
      if (!patrocinadorSlug) return;
      
      console.log('🔍 Buscando patrocinador com slug:', patrocinadorSlug);
      setCarregandoPatrocinador(true);
      try {
        const { data, error } = await supabase
          .from("patrocinadores")
          .select("*")
          .eq("slug", patrocinadorSlug)
          .single();

        if (error) {
          console.error("❌ Erro ao buscar patrocinador:", error);
          setPatrocinador(null);
        } else if (data) {
          console.log('✅ Patrocinador encontrado:', data);
          setPatrocinador(data as Patrocinador);
        } else {
          console.log('❌ Nenhum patrocinador encontrado');
          setPatrocinador(null);
        }
      } catch (error) {
        console.error("❌ Erro inesperado:", error);
        setPatrocinador(null);
      } finally {
        setCarregandoPatrocinador(false);
      }
    };

    fetchPatrocinador();
  }, [patrocinadorSlug]);

  // ✅ Buscar TODOS os imóveis do patrocinador
  useEffect(() => {
    const fetchImoveis = async () => {
      if (!patrocinador) {
        console.log('⚠️ Patrocinador não definido, pulando busca de imóveis');
        return;
      }
      
      console.log('🔍 Buscando TODOS os imóveis para patrocinador:', patrocinador.id);
      setCarregando(true);
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .select("*")
          .eq("patrocinadorid", patrocinador.id)
          .eq("ativo", true)
          .order("datacadastro", { ascending: false });

        if (error) {
          console.error("❌ Erro ao buscar imóveis:", error);
          setImoveis([]);
        } else {
          const todosImoveis = (data as Imovel[]) || [];
          console.log('✅ Imóveis encontrados:', todosImoveis.length, todosImoveis);
          setImoveis(todosImoveis);
        }
      } catch (error) {
        console.error("❌ Erro inesperado:", error);
        setImoveis([]);
      } finally {
        setCarregando(false);
      }
    };

    fetchImoveis();
  }, [patrocinador]);

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
          <div className="font-inter text-lg text-center text-red-700 bg-red-100 border border-red-200 p-6 rounded-xl shadow max-w-md mx-auto">
            <h2 className="font-bold mb-2">❌ Patrocinador não encontrado</h2>
            <p className="text-sm">Verifique se o link está correto ou tente novamente.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Estatísticas dos imóveis
  const cidadesAtendidas = new Set(imoveis.map(i => i.cidade)).size;
  const setoresDisponiveis = new Set(imoveis.map(i => i.setornegocio)).size;
  const tiposNegocio = new Set(imoveis.map(i => i.tiponegocio)).size;

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
      <Header />
      
      <main className="flex-1 flex flex-col items-center py-10 px-2">
        <div className="w-full max-w-7xl mx-auto">
          
          {/* ✅ Cabeçalho do Patrocinador */}
          <div className="text-center mb-8">
            <h1 
              className="font-poppins text-3xl md:text-5xl font-extrabold text-blue-700 mb-4 drop-shadow" 
              style={{ userSelect: "none" }}
            >
              🏢 {patrocinador.nome}
            </h1>
            <p 
              className="font-inter text-sm md:text-xl text-blue-900 mb-4" 
              style={{ userSelect: "none" }}
            >
              Confira todos os imóveis exclusivos de <strong>{patrocinador.nome}</strong>. 
              Encontre sua próxima oportunidade!
            </p>
            
            {/* Banner do Patrocinador */}
            {patrocinador.bannerurl && (
              <div className="w-full max-w-4xl mx-auto mb-6 relative">
                <Image
                  src={patrocinador.bannerurl}
                  alt={`Banner do ${patrocinador.nome}`}
                  width={1024}
                  height={256}
                  className="w-full h-48 md:h-64 object-cover rounded-xl shadow-lg"
                  priority
                  onError={(e) => {
                    console.error('Erro ao carregar banner:', patrocinador.bannerurl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* ✅ Estatísticas simplificadas */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
              📊 Portfólio Completo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-3xl font-bold text-blue-700 mb-1">{imoveis.length}</div>
                <p className="text-sm text-blue-600 font-medium">🏠 Total de Imóveis</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-3xl font-bold text-green-700 mb-1">{cidadesAtendidas}</div>
                <p className="text-sm text-green-600 font-medium">🏙️ Cidades</p>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                <div className="text-3xl font-bold text-purple-700 mb-1">{setoresDisponiveis}</div>
                <p className="text-sm text-purple-600 font-medium">📋 Setores</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-3xl font-bold text-orange-700 mb-1">{tiposNegocio}</div>
                <p className="text-sm text-orange-600 font-medium">💼 Modalidades</p>
              </div>
            </div>
          </div>

          {/* ✅ Conteúdo Principal */}
          {carregando ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <span className="font-inter text-blue-700 font-semibold text-lg">
                🔄 Carregando imóveis...
              </span>
            </div>
          ) : imoveis.length === 0 ? (
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
              {/* ✅ Indicador de resultados */}
              <div className="mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <p className="text-gray-700 font-inter font-medium">
                    🏠 Exibindo todos os <strong>{imoveis.length}</strong> imóveis disponíveis
                  </p>
                  <div className="text-sm text-gray-500">
                    Portfólio completo de <strong>{patrocinador.nome}</strong>
                  </div>
                </div>
              </div>

              {/* ✅ Grid de imóveis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {imoveis.map((imovel) => (
                  <ImovelCard 
                    key={imovel.id} 
                    imovel={imovel} 
                    contexto="patrocinador"
                  />
                ))}
              </div>

              {/* ✅ Footer da listagem */}
              <div className="text-center text-gray-600 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200">
                <p className="font-medium text-lg mb-2">
                  ✨ Portfólio completo de <strong>{patrocinador.nome}</strong>
                </p>
                <p className="text-sm">
                  Entre em contato diretamente através dos imóveis para mais informações e agendamento de visitas.
                </p>
                <div className="flex justify-center items-center gap-4 mt-4 text-xs text-gray-500">
                  <span>📅 Atualizado em {new Date().toLocaleDateString('pt-BR')}</span>
                  <span>•</span>
                  <span>🔄 Dados em tempo real</span>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}