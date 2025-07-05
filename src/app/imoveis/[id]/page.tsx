"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import PatrocinadorBadge from "@/components/imovel/PatrocinadorBadge";
import ImovelCarousel from "@/components/imovel/ImovelCarousel";
import ImovelDetalhes from "@/components/imovel/ImovelDetalhes";
import ImoveisPatrocinadorList from "@/components/imovel/ImoveisPatrocinadorList";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";
import ImovelModal from "@/components/imovel/ImovelModal";
import type { Imovel } from "@/types/Imovel";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

function formatarTexto(texto?: string) {
  return texto ? texto.replace(/_/g, " ") : "";
}

function negocioFormatado(tipoNegocio?: string) {
  if (!tipoNegocio) return "";
  const txt = formatarTexto(tipoNegocio).toLowerCase();
  if (txt === "comprar") return "Comprar";
  if (txt === "alugar") return "Alugar";
  if (txt === "venda") return "Venda";
  if (txt === "aluguel") return "Aluguel";
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

// ✅ FUNÇÃO PARA DETERMINAR O SETOR CORRETO
function determinarSetor(imovel: Imovel): string {
  // Inferir pelo tipo de imóvel
  const tipo = imovel.tipoimovel?.toLowerCase() || "";
  
  if (tipo.includes("casa") || tipo.includes("apartamento") || tipo.includes("residencial")) {
    return "Residencial";
  }
  
  if (tipo.includes("comercial") || tipo.includes("loja") || tipo.includes("escritorio") || tipo.includes("ponto")) {
    return "Comercial";
  }
  
  if (tipo.includes("fazenda") || tipo.includes("sitio") || tipo.includes("rural") || tipo.includes("chacara")) {
    return "Rural";
  }
  
  // Default para Residencial se não conseguir determinar
  return "Residencial";
}

export default function ImovelPage() {
  const { id } = useParams() as { id: string };
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [imoveisPatrocinador, setImoveisPatrocinador] = useState<Imovel[]>([]);
  const [patrocinadorNome, setPatrocinadorNome] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const [imagemIndex, setImagemIndex] = useState(0);

  const abrirModal = (index: number) => {
    setImagemIndex(index);
    setModalAberto(true);
  };
  
  const fecharModal = () => setModalAberto(false);
  
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) fecharModal();
  };

  // Buscar imóvel
  useEffect(() => {
    async function buscarImovel() {
      setLoading(true);
      if (!id) {
        return notFound();
      }
      
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .select("*")
          .eq("id", id)
          .single();
        
        if (error || !data) {
          return notFound();
        }
        
        setImovel(data as Imovel);
      } catch {
        return notFound();
      } finally {
        setLoading(false);
      }
    }
    
    buscarImovel();
  }, [id]);

  // Buscar nome do patrocinador
  useEffect(() => {
    async function buscarNomePatrocinador() {
      if (!imovel?.patrocinadorid) return;
      
      try {
        const { data, error } = await supabase
          .from("patrocinadores")
          .select("nome")
          .eq("id", imovel.patrocinadorid)
          .single();
        
        if (error) {
          setPatrocinadorNome('Patrocinador não encontrado');
          return;
        }
        
        setPatrocinadorNome(data?.nome || 'Nome não disponível');
      } catch {
        setPatrocinadorNome('Erro ao carregar');
      }
    }
    
    buscarNomePatrocinador();
  }, [imovel?.patrocinadorid]);

  // Buscar outros imóveis do patrocinador
  useEffect(() => {
    async function buscarImoveisPatrocinador() {
      if (!imovel?.patrocinadorid) {
        setImoveisPatrocinador([]);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("imoveis")
          .select("*")
          .eq("patrocinadorid", imovel.patrocinadorid)
          .neq("id", imovel.id)
          .eq("ativo", true)
          .limit(6);
        
        if (error) {
          setImoveisPatrocinador([]);
          return;
        }
        
        const outrosImoveis = (data as Imovel[]) || [];
        setImoveisPatrocinador(outrosImoveis);
      } catch {
        setImoveisPatrocinador([]);
      }
    }
    
    buscarImoveisPatrocinador();
  }, [imovel?.patrocinadorid, imovel?.id]);

  if (loading) {
    return (
      <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center py-15">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="font-inter text-blue-700 font-semibold text-lg">
              🔄 Carregando imóvel...
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-100 to-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg p-10 border border-blue-100 max-w-md mx-auto">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Imóvel não encontrado</h2>
            <p className="text-gray-600 mb-6">
              O imóvel que você está procurando não existe ou foi removido.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // WhatsApp
  const whatsappNumber = imovel.whatsapp 
    ? imovel.whatsapp.replace(/\D/g, "").slice(-11)
    : "";
  
  const whatsappLink = whatsappNumber 
    ? `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(
        `Olá! Tenho interesse no imóvel ${formatarTexto(imovel.tipoimovel)} localizado em ${formatarTexto(imovel.cidade)}, ${formatarTexto(imovel.bairro)}. Valor: ${
          imovel.valor 
            ? imovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'A consultar'
        }`
      )}`
    : null;

  // ✅ CORREÇÃO: Determinar setor correto
  const setorReal = determinarSetor(imovel);
  const negocio = negocioFormatado(imovel.tiponegocio);
  
  // ✅ CORREÇÃO: Buscar itens disponíveis com setor correto
  const itensDisponiveis = setorReal && ITENS_POR_SETOR[setorReal]
    ? ITENS_POR_SETOR[setorReal]
    : [];
  
  // ✅ CORREÇÃO: Parse mais robusto dos itens do banco
  let itensImovel: Record<string, string | number | boolean> = {};
  if (imovel.itens) {
    try {
      // Para JSONB do PostgreSQL, pode vir como objeto ou string
      if (typeof imovel.itens === 'object' && imovel.itens !== null) {
        // Se já é objeto, usar diretamente
        Object.entries(imovel.itens).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            itensImovel[key] = value as string | number | boolean;
          }
        });
      } else if (typeof imovel.itens === 'string') {
        // Se é string, parsear JSON
        const parsed = JSON.parse(imovel.itens);
        if (parsed && typeof parsed === 'object') {
          Object.entries(parsed).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
              itensImovel[key] = value as string | number | boolean;
            }
          });
        }
      }
    } catch {
      itensImovel = {};
    }
  }

  // ✅ CORREÇÃO: Filtrar itens com verificação mais tolerante
  const itensComValor = itensDisponiveis.filter(item => {
    const valor = itensImovel[item.chave];
    
    // ✅ Verificação mais tolerante
    if (valor === undefined || valor === null || valor === '') return false;
    
    // Para números - aceitar qualquer número > 0
    if (typeof valor === 'number') {
      return valor > 0;
    }
    
    // Para strings - aceitar números > 0 ou strings não vazias
    if (typeof valor === 'string') {
      const numValue = Number(valor);
      if (!isNaN(numValue)) {
        return numValue > 0;
      }
      return valor.trim() !== '' && valor !== '0' && valor !== 'false';
    }
    
    // Para booleanos - aceitar apenas true
    if (typeof valor === 'boolean') {
      return valor === true;
    }
    
    return false;
  });

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white relative">
      <Header />
      <main className="flex-1 flex flex-col items-center py-8 px-2 relative z-10">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-blue-100 p-4 sm:p-8">
          <ImovelCarousel
            imagens={imovel.imagens || ["/imoveis/sem-imagem.jpg"]}
            cidade={imovel.cidade}
            tipo={imovel.tipoimovel}
            altura="h-72 sm:h-105"
            onImageClick={abrirModal}
          />

          {imovel.patrocinadorid && patrocinadorNome && (
            <div className="mb-6 flex justify-start">
              <PatrocinadorBadge 
                patrocinador={imovel.patrocinadorid} 
                nome={patrocinadorNome} 
              />
            </div>
          )}

          <ImovelDetalhes
            tipoNegocio={negocio}
            valor={imovel.valor || 0}
            cidade={formatarTexto(imovel.cidade)}
            bairro={formatarTexto(imovel.bairro)}
            tipoImovel={formatarTexto(imovel.tipoimovel)}
            metragem={imovel.metragem || 0}
            enderecoDetalhado={formatarTexto(imovel.enderecodetalhado)}
            descricao={imovel.descricao || ""}
          />

          {/* ✅ SEÇÃO DE CARACTERÍSTICAS */}
          <section className="mt-8">
            <h4 className="font-poppins font-semibold text-blue-700 mb-6 text-lg sm:text-2xl text-center flex items-center justify-center gap-2">
              🏠 Características do Imóvel
            </h4>
            
            {itensDisponiveis.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-600 font-medium">
                  Características não definidas para este tipo de imóvel.
                </p>
              </div>
            ) : itensComValor.length === 0 ? (
              <div className="text-center py-8 bg-blue-50 rounded-xl border border-blue-200">
                <div className="text-4xl mb-3">ℹ️</div>
                <p className="text-blue-700 font-medium">
                  Nenhuma característica específica foi informada para este imóvel.
                </p>
                <p className="text-sm text-blue-600 mt-2">
                  Entre em contato para mais informações sobre as características.
                </p>
              </div>
            ) : (
              <>
                {/* ✅ Separar itens quantitativos dos booleanos */}
                <div className="space-y-6">
                  
                  {/* Itens Quantitativos */}
                  {(() => {
                    const itensQuant = itensComValor.filter(item => 
                      ITENS_QUANTITATIVOS.includes(item.chave)
                    );
                    
                    if (itensQuant.length === 0) return null;
                    
                    return (
                      <div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {itensQuant.map((item) => {
                            const valor = itensImovel[item.chave];
                            const valorNumerico = typeof valor === 'number' ? valor : Number(valor) || 0;
                            
                            return (
                              <div
                                key={item.chave}
                                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-all duration-200"
                              >
                                <div className="text-center space-y-2">
                                  <div className="text-3xl">{item.icone}</div>
                                  <span className="text-blue-900 font-medium text-sm block leading-tight">
                                    {item.nome}
                                  </span>
                                  <div className="bg-blue-600 text-white px-3 py-1 rounded-lg font-bold text-lg">
                                    {valorNumerico}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Itens Booleanos */}
                  {(() => {
                    const itensBool = itensComValor.filter(item => 
                      !ITENS_QUANTITATIVOS.includes(item.chave)
                    );
                    
                    if (itensBool.length === 0) return null;
                    
                    return (
                      <div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {itensBool.map((item) => (
                            <div
                              key={item.chave}
                              className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-200 hover:shadow-md transition-all duration-200"
                            >
                              <div className="text-center space-y-2">
                                <div className="text-2xl">{item.icone}</div>
                                <span className="text-green-900 font-medium text-xs block leading-tight">
                                  {item.nome}
                                </span>
                                <div className="bg-green-600 text-white px-2 py-1 rounded-lg font-bold text-sm">
                                  ✓
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </>
            )}
          </section>

          {/* Botão WhatsApp */}
          <div className="flex justify-center mt-8">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-3 w-full sm:w-auto text-center bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:scale-105 hover:from-green-700 hover:to-green-800 transition-all duration-200 cursor-pointer font-poppins"
              >
                <span className="text-2xl">💬</span>
                Falar no WhatsApp
              </a>
            ) : (
              <div className="text-center bg-gray-100 rounded-2xl p-6 border border-gray-200">
                <p className="text-gray-600 font-medium">
                  📞 Contato não disponível para este imóvel
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de imagens */}
        {imovel.imagens && modalAberto && (
          <ImovelModal
            imagens={imovel.imagens}
            aberto={modalAberto}
            imagemIndex={imagemIndex}
            onClose={fecharModal}
            setImagemIndex={setImagemIndex}
            handleBackgroundClick={handleBackgroundClick}
          />
        )}

        {/* Lista de outros imóveis do patrocinador */}
        {imovel.patrocinadorid && imoveisPatrocinador.length > 0 && (
          <div className="w-full max-w-7xl mx-auto mt-8">
            <ImoveisPatrocinadorList imoveis={imoveisPatrocinador} />
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}