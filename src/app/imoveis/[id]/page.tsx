"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Image from "next/image"; // ✅ IMPORTAR Image do Next.js
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import PatrocinadorBadge from "@/components/imovel/PatrocinadorBadge";
import ImovelCarousel from "@/components/imovel/ImovelCarousel";
import ImovelDetalhes from "@/components/imovel/ImovelDetalhes";
import ImoveisPatrocinadorList from "@/components/imovel/ImoveisPatrocinadorList";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";
import ImovelModal from "@/components/imovel/ImovelModal";
import type { Imovel } from "@/types/Imovel";
import { FaWhatsapp } from "react-icons/fa"; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

function formatarTexto(texto?: string) {
  return texto ? texto.replace(/_/g, " ") : "";
}

function determinarSetor(imovel: Imovel): string {
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

  return "Residencial";
}

export default function ImovelPage() {
  const { id } = useParams() as { id: string };
  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [imoveisPatrocinador, setImoveisPatrocinador] = useState<Imovel[]>([]);
  const [patrocinadorNome, setPatrocinadorNome] = useState<string | null>(null);
  const [patrocinadorCreci, setPatrocinadorCreci] = useState<string | undefined>(undefined);
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

  useEffect(() => {
    async function buscarNomePatrocinador() {
      if (!imovel?.patrocinadorid) return;

      try {
        const { data, error } = await supabase
          .from("patrocinadores")
          .select("nome, creci")
          .eq("id", imovel.patrocinadorid)
          .single();

        if (error) {
          setPatrocinadorNome('Patrocinador não encontrado');
          setPatrocinadorCreci(undefined);
          return;
        }

        setPatrocinadorNome(data?.nome || 'Nome não disponível');
        setPatrocinadorCreci(data?.creci || undefined);
      } catch {
        setPatrocinadorNome('Erro ao carregar');
        setPatrocinadorCreci(undefined);
      }
    }

    buscarNomePatrocinador();
  }, [imovel?.patrocinadorid]);

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

  const setorReal = determinarSetor(imovel);
  
  const itensDisponiveis = setorReal && ITENS_POR_SETOR[setorReal]
    ? ITENS_POR_SETOR[setorReal]
    : [];
  
  let itensImovel: Record<string, string | number | boolean> = {};
  if (imovel.itens) {
    try {
      if (typeof imovel.itens === 'object' && imovel.itens !== null) {
        Object.entries(imovel.itens).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            itensImovel[key] = value as string | number | boolean;
          }
        });
      } else if (typeof imovel.itens === 'string') {
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

  const itensComValor = itensDisponiveis.filter(item => {
    const valor = itensImovel[item.chave];
    
    if (valor === undefined || valor === null || valor === '') return false;
    
    if (typeof valor === 'number') {
      return valor > 0;
    }
    
    if (typeof valor === 'string') {
      const numValue = Number(valor);
      if (!isNaN(numValue)) {
        return numValue > 0;
      }
      return valor.trim() !== '' && valor !== '0' && valor !== 'false';
    }
    
    if (typeof valor === 'boolean') {
      return valor === true;
    }
    
    return false;
  });

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white relative">
      <Header />
      <main className="flex-1 flex flex-col items-center lg:py-8 relative z-10">
        <div className="w-full max-w-4xl mx-auto bg-white lg:rounded-3xl shadow-xl border border-blue-100 p-4 sm:p-8">
          
          {/* ✅ SEÇÃO API - CORRIGIDA COM Image */}
          {imovel.fonte_api && imovel.fonte_api !== 'internal' && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {imovel.api_logo && (
                    <div className="relative w-12 h-12 bg-white rounded-lg p-1">
                      <Image
                        src={imovel.api_logo}
                        alt={imovel.api_source_name || 'Logo do parceiro'}
                        width={44}
                        height={44}
                        className="rounded-lg object-contain"
                        sizes="44px"
                        priority={false}
                        onError={(e) => {
                          // Fallback em caso de erro na imagem
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-purple-900">
                        Imóvel disponibilizado por parceiro
                      </h4>
                      <span className="bg-purple-200 text-purple-800 text-xs px-2 py-1 rounded-full">
                        {imovel.api_source_name || 'Parceiro'}
                      </span>
                    </div>
                    {imovel.data_sincronizacao && (
                      <p className="text-sm text-purple-700 mt-1">
                        Sincronizado em: {new Date(imovel.data_sincronizacao).toLocaleString('pt-BR')}
                      </p>
                    )}
                  </div>
                </div>
                
                {imovel.url_original && (
                  <a
                    href={imovel.url_original}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Ver Original
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Carousel existente */}
          <ImovelCarousel
            imagens={imovel.imagens || ["/imoveis/sem-imagem.jpg"]}
            cidade={imovel.cidade}
            tipo={imovel.tipoimovel}
            altura="h-60 sm:h-110"
            onImageClick={abrirModal}
          />

          {/* Badge do patrocinador existente */}
          {imovel.patrocinadorid && patrocinadorNome && (
            <div className="mb-6 flex justify-start">
              <PatrocinadorBadge 
                patrocinador={imovel.patrocinadorid} 
                nome={patrocinadorNome}
                creci={patrocinadorCreci}
              />
            </div>
          )}

          {/* DETALHES ATUALIZADOS */}
          <ImovelDetalhes
            tipoNegocio={imovel.setornegocio || ""}
            valor={imovel.valor || 0}
            cidade={formatarTexto(imovel.cidade)}
            bairro={formatarTexto(imovel.bairro)}
            tipoImovel={formatarTexto(imovel.tipoimovel)}
            metragem={imovel.metragem || 0}
            enderecoDetalhado={formatarTexto(imovel.enderecodetalhado)}
            descricao={imovel.descricao || ""}
            codigoImovel={imovel.codigoimovel}
            codigoParceiro={imovel.codigo_parceiro}
          />

          {/* Características do imóvel */}
          {imovel.tipoimovel?.toLowerCase() !== "terreno" && (
            <section className="mt-8">
              <h4 className="font-poppins font-semibold text-blue-900 mb-6 text-lg sm:text-2xl text-center flex items-center justify-center gap-2">
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
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                  {itensComValor.map((item) => {
                    const valor = itensImovel[item.chave];
                    const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
                    const valorNumerico = typeof valor === 'number' ? valor : Number(valor) || 0;
                    return (
                      <div
                        key={item.chave}
                        className={`rounded-lg p-2 border transition-all duration-200 text-center flex flex-col items-center justify-center
                          ${isQuant
                            ? "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 hover:shadow"
                            : "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 hover:shadow"
                          }`}
                        style={{ minHeight: 70, maxWidth: 110 }}
                      >
                        <div className={isQuant ? "text-lg mb-1" : "text-base mb-1"}>{item.icone}</div>
                        <span
                          className={`font-medium block leading-tight ${isQuant ? "text-blue-900 text-xs" : "text-green-900 text-xs"} mb-0.5`}
                          style={{ marginBottom: '2px' }}
                        >
                          {item.nome}
                        </span>
                        <div
                          className={`${isQuant ? "bg-blue-600 text-white px-2 py-0.5 rounded font-bold text-base" : "bg-green-600 text-white px-2 py-0.5 rounded font-bold text-sm"}`}
                          style={{ marginTop: '2px' }}
                        >
                          {isQuant ? valorNumerico : "✓"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Botão WhatsApp */}
          <div className="flex justify-center mt-8">
            {whatsappLink ? (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="font-poppins inline-flex items-center justify-center gap-3 w-full sm:w-auto text-center bg-gradient-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:scale-105 hover:from-green-700 hover:to-green-800 transition-all duration-200 cursor-pointer font-poppins"
              >
                <FaWhatsapp className="text-2xl text-white" />
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