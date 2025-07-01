"use client";

import { useEffect, useState } from "react";
import { useParams, notFound } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import VoltarButton from "@/components/imovel/VoltarButton";
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

  useEffect(() => {
    async function buscarImovel() {
      setLoading(true);
      if (!id) return notFound();
      const { data } = await supabase.from("imoveis").select("*").eq("id", id).single();
      if (!data) return notFound();
      setImovel(data as Imovel);
      setLoading(false);
    }
    buscarImovel();
  }, [id]);

  useEffect(() => {
    async function buscarNomePatrocinador() {
      if (imovel?.patrocinador) {
        const { data } = await supabase
          .from("patrocinadores")
          .select("nome")
          .eq("id", imovel.patrocinador)
          .single();
        setPatrocinadorNome(data?.nome || imovel.patrocinador);
      }
    }
    buscarNomePatrocinador();
  }, [imovel?.patrocinador]);

  useEffect(() => {
    async function buscarImoveisPatrocinador() {
      if (imovel?.patrocinador) {
        const { data } = await supabase
          .from("imoveis")
          .select("*")
          .eq("patrocinador", imovel.patrocinador)
          .neq("id", imovel.id)
          .limit(6);
        setImoveisPatrocinador((data as Imovel[]) || []);
      } else {
        setImoveisPatrocinador([]);
      }
    }
    buscarImoveisPatrocinador();
  }, [imovel]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh] bg-white">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!imovel) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center bg-white rounded-2xl shadow-lg p-10 border border-blue-100">
            <h2 className="text-2xl font-bold mb-4 text-blue-700">Imóvel não encontrado</h2>
            <VoltarButton />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const whatsappNumber = imovel.whatsapp ? imovel.whatsapp.replace(/\D/g, "").slice(0, 13) : "";
  const whatsappLink = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${imovel.tipoImovel} localizado em ${(imovel.cidade || "").replace(
      /_/g,
      " "
    )}, ${(imovel.bairro || "").replace(/_/g, " ")}.`
  )}`;

  const itensDisponiveis = ITENS_POR_SETOR[imovel.tipoNegocio] || [];
  const negocio = negocioFormatado(imovel.tipoNegocio);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white relative">
      <Header />
      <main className="flex-1 flex flex-col items-center py-8 px-2 relative z-10">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-blue-100 p-4 sm:p-8">
          <div className="mb-8 flex">
            <VoltarButton />
          </div>

          <ImovelCarousel
            imagens={imovel.imagens}
            cidade={imovel.cidade}
            tipo={imovel.tipoImovel}
            altura="h-72 sm:h-105"
            onImageClick={abrirModal}
          />

          {imovel.patrocinador && patrocinadorNome && (
            <div className="mb-6 flex justify-start">
              <PatrocinadorBadge patrocinador={imovel.patrocinador} nome={patrocinadorNome} />
            </div>
          )}

          <ImovelDetalhes
            tipoNegocio={negocio}
            valor={imovel.valor || 0}
            cidade={formatarTexto(imovel.cidade)}
            bairro={formatarTexto(imovel.bairro)}
            tipoImovel={formatarTexto(imovel.tipoImovel)}
            metragem={imovel.metragem || 0}
            enderecoDetalhado={formatarTexto(imovel.enderecoDetalhado)}
            descricao={imovel.descricao || ""}
          />

          {/* Removido o mapa de localização */}

          <section className="mt-8">
            <h4 className="font-poppins font-semibold text-blue-700 mb-3 text-lg sm:text-3xl text-center">
              Itens do imóvel
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {itensDisponiveis.map((item) => {
                const valor = imovel.itens?.[item.chave];
                if (typeof valor !== "number" || valor === 0) return null;
                const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
                return (
                  <div
                    key={item.chave}
                    className="flex flex-col items-center justify-center bg-blue-100 rounded-lg px-1 py-2 min-w-0 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <span
                      className="text-blue-900 font-poppins text-sm sm:text-base font-semibold text-center truncate w-full mb-1"
                      title={item.label}
                    >
                      {item.label}
                    </span>
                    <span className="text-base sm:text-lg font-bold text-blue-700">
                      {isQuant ? valor : "Sim"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="flex justify-center mt-8">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto text-center bg-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg sm:text-xl shadow-lg hover:scale-105 hover:bg-green-700 transition-all duration-200 cursor-pointer font-poppins"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        {imovel.imagens && (
          <ImovelModal
            imagens={imovel.imagens}
            aberto={modalAberto}
            imagemIndex={imagemIndex}
            onClose={fecharModal}
            setImagemIndex={setImagemIndex}
            handleBackgroundClick={handleBackgroundClick}
          />
        )}

        {imovel.patrocinador && imoveisPatrocinador.length > 0 && (
          <ImoveisPatrocinadorList imoveis={imoveisPatrocinador} />
        )}
      </main>
      <Footer />
    </div>
  );
}