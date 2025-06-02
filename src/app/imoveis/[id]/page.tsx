'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import type { Imovel } from '@/types/Imovel';
import VoltarButton from '@/components/imovel/VoltarButton';
import PatrocinadorBadge from '@/components/imovel/PatrocinadorBadge';
import ImovelCarousel from '@/components/imovel/ImovelCarousel';
import ImovelDetalhes from '@/components/imovel/ImovelDetalhes';
import ImoveisPatrocinadorList from '@/components/imovel/ImoveisPatrocinadorList';
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from '@/constants/itensImovel';
import ImovelModal from '@/components/imovel/ImovelModal';

type Props = {
  params: Promise<{ id: string }>;
};

function formatarTexto(texto: string | undefined) {
  return typeof texto === 'string' ? texto.replace(/_/g, " ") : '';
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

export default function ImovelPage({ params }: Props) {
  const { id: rawId } = use(params);
  const id =
    typeof rawId === 'string'
      ? rawId.replace(/[^a-zA-Z0-9_-]/g, '')
      : '';

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [imoveisPatrocinador, setImoveisPatrocinador] = useState<Imovel[]>([]);
  const [patrocinadorNome, setPatrocinadorNome] = useState<string | null>(null);

  // Modal de imagens
  const [modalAberto, setModalAberto] = useState(false);
  const [imagemIndex, setImagemIndex] = useState(0);

  const abrirModal = (index: number) => {
    setImagemIndex(index);
    setModalAberto(true);
  };

  const fecharModal = () => setModalAberto(false);

  const proximaImagem = () => {
    if (!imovel?.imagens) return;
    setImagemIndex((prev) => (prev + 1) % imovel.imagens.length);
  };

  const imagemAnterior = () => {
    if (!imovel?.imagens) return;
    setImagemIndex((prev) => (prev - 1 + imovel.imagens.length) % imovel.imagens.length);
  };

  // Necessário para fechar o modal ao clicar no fundo escuro
  const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) fecharModal();
  };

  useEffect(() => {
    const buscarImovel = async () => {
      try {
        if (!id) {
          notFound();
          return;
        }
        const ref = doc(db, 'imoveis', id);
        const snapshot = await getDoc(ref);

        if (!snapshot.exists()) {
          notFound();
          return;
        }

        setImovel({
          id: snapshot.id,
          ...snapshot.data(),
        } as Imovel);
      } catch (err) {
        console.error('Erro ao buscar imóvel:', err);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    buscarImovel();
  }, [id]);

  useEffect(() => {
    const buscarNomePatrocinador = async () => {
      if (imovel?.patrocinador) {
        const ref = doc(db, 'patrocinadores', imovel.patrocinador);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          const data = snapshot.data();
          setPatrocinadorNome(data.nome || imovel.patrocinador);
        } else {
          setPatrocinadorNome(imovel.patrocinador);
        }
      }
    };
    buscarNomePatrocinador();
  }, [imovel?.patrocinador]);

  useEffect(() => {
    const buscarImoveisPatrocinador = async (patrocinador: string, imovelId: string) => {
      const q = query(
        collection(db, "imoveis"),
        where("patrocinador", "==", patrocinador),
        limit(6)
      );
      const snap = await getDocs(q);
      const outros = snap.docs
        .filter(doc => doc.id !== imovelId)
        .map(doc => ({ id: doc.id, ...doc.data() } as Imovel));
      setImoveisPatrocinador(outros);
    };

    if (imovel && imovel.patrocinador) {
      buscarImoveisPatrocinador(imovel.patrocinador, imovel.id);
    } else {
      setImoveisPatrocinador([]);
    }
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

  // Sanitize WhatsApp number for the link
  const whatsappNumber = imovel.whatsapp ? imovel.whatsapp.replace(/\D/g, '').slice(0, 13) : '';
  const whatsappLink = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${imovel.tipoImovel} localizado em ${(imovel.cidade || '').replace(/_/g, ' ')}, ${(imovel.bairro || '').replace(/_/g, ' ')}.`
  )}`;

  // Itens do imóvel igual aos cards
  const itensDisponiveis = ITENS_POR_SETOR[imovel.tipoNegocio] || [];
  const negocio = negocioFormatado(imovel.tipoNegocio);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white relative">
      <Header />
      <main className="flex-1 flex flex-col items-center py-8 px-2 relative z-10">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl shadow-xl border border-blue-100 p-4 sm:p-8">
          {/* Botão de Voltar */}
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
              <PatrocinadorBadge 
              patrocinador={imovel.patrocinador}
              nome={patrocinadorNome}
              />
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

          {/* ITENS DO IMÓVEL */}
          <section className="mt-8">
            <h4 className="font-poppins font-semibold text-blue-700 mb-3 text-lg sm:text-3xl text-center">
              Itens do imóvel
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {itensDisponiveis.map((item) => {
                const valor = imovel.itens?.[item.chave];
                if (typeof valor !== 'number' || valor === 0) return null;
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

          {/* Botão WhatsApp */}
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

        {/* Modal de imagens */}
        {imovel.imagens && (
          <ImovelModal
            imagens={imovel.imagens}
            aberto={modalAberto}
            imagemIndex={imagemIndex}
            onClose={fecharModal}
            onAnterior={imagemAnterior}
            onProxima={proximaImagem}
            setImagemIndex={setImagemIndex}
            handleBackgroundClick={handleBackgroundClick}
          />
        )}

        {/* Imóveis do mesmo patrocinador */}
        {imovel?.patrocinador && imoveisPatrocinador.length > 0 && (
          <ImoveisPatrocinadorList imoveis={imoveisPatrocinador} />
        )}
      </main>
      <Footer />
    </div>
  );
}