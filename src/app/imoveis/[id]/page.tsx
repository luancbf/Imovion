'use client';

import { db } from '@/lib/firebase';
import { doc, getDoc, collection, getDocs, query, where, limit } from 'firebase/firestore';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Header from '@/components/home/Header';
import Footer from '@/components/home/Footer';
import type { Imovel } from '@/types/Imovel';

// Components
import VoltarButton from '@/components/imovel/VoltarButton';
import PatrocinadorBadge from '@/components/imovel/PatrocinadorBadge';
import ImovelCarousel from '@/components/imovel/ImovelCarousel';
import ImovelDetalhes from '@/components/imovel/ImovelDetalhes';
import ImoveisPatrocinadorList from '@/components/imovel/ImoveisPatrocinadorList';
import ImovelModal from '@/components/imovel/ImovelModal';

type Props = {
  params: Promise<{ id: string }>;
};

export default function ImovelPage({ params }: Props) {
  const { id: rawId } = use(params);
  const id =
    typeof rawId === 'string'
      ? rawId.replace(/[^a-zA-Z0-9_-]/g, '')
      : '';

  const [imovel, setImovel] = useState<Imovel | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagemAtual, setImagemAtual] = useState(0);
  const [imoveisPatrocinador, setImoveisPatrocinador] = useState<Imovel[]>([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [modalImagemIndex, setModalImagemIndex] = useState(0);

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

  // Buscar outros imóveis do mesmo patrocinador (caso exista)
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

  // Modal carrossel
  const abrirModal = (index: number) => {
    setModalImagemIndex(index);
    setModalAberto(true);
  };

  const fecharModal = () => setModalAberto(false);

  const proximaImagem = () => {
    if (imovel && imovel.imagens.length > 0) {
      setImagemAtual((prev) => (prev + 1) % imovel.imagens.length);
    }
  };

  const imagemAnterior = () => {
    if (imovel && imovel.imagens.length > 0) {
      setImagemAtual((prev) => (prev - 1 + imovel.imagens.length) % imovel.imagens.length);
    }
  };

  const proximaImagemModal = () => {
    if (imovel && imovel.imagens.length > 0) {
      setModalImagemIndex((prev) => (prev + 1) % imovel.imagens.length);
    }
  };

  const imagemAnteriorModal = () => {
    if (imovel && imovel.imagens.length > 0) {
      setModalImagemIndex((prev) => (prev - 1 + imovel.imagens.length) % imovel.imagens.length);
    }
  };

  // Fecha modal ao clicar fora da imagem
  const handleModalBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      fecharModal();
    }
  };

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
  const whatsappNumber = imovel.whatsapp.replace(/\D/g, '').slice(0, 13);
  const whatsappLink = `https://wa.me/55${whatsappNumber}?text=${encodeURIComponent(
    `Olá! Tenho interesse no imóvel ${imovel.tipoImovel} localizado em ${(imovel.cidade || '').replace(/_/g, ' ')}, ${(imovel.bairro || '').replace(/_/g, ' ')}.`
  )}`;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white relative">
      <Header />
      <main className="flex-1 flex flex-col items-center py-10 px-2 relative z-10">
        <div className="w-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-blue-100 p-4 sm:p-8">
          {/* Botão de Voltar */}
          <div className="mb-8 flex">
            <VoltarButton />
          </div>

          {/* Nome do patrocinador */}
          {imovel.patrocinador && (
            <PatrocinadorBadge patrocinador={imovel.patrocinador} />
          )}

          {/* Carrossel de Imagens */}
          <ImovelCarousel
            imagens={imovel.imagens}
            imagemAtual={imagemAtual}
            setImagemAtual={setImagemAtual}
            abrirModal={abrirModal}
            proximaImagem={proximaImagem}
            imagemAnterior={imagemAnterior}
          />

          {/* Detalhes do imóvel */}
          <ImovelDetalhes
            tipoNegocio={imovel.tipoNegocio}
            valor={imovel.valor}
            cidade={imovel.cidade}
            bairro={imovel.bairro}
            tipoImovel={imovel.tipoImovel}
            metragem={imovel.metragem}
            enderecoDetalhado={imovel.enderecoDetalhado}
            descricao={imovel.descricao}
          />

          {/* Botão WhatsApp */}
          <div className="flex justify-center">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto text-center bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:bg-green-600 transition-all duration-200 cursor-pointer"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        {/* Imóveis do mesmo patrocinador */}
        {imovel?.patrocinador && imoveisPatrocinador.length > 0 && (
          <ImoveisPatrocinadorList imoveis={imoveisPatrocinador} />
        )}

        {/* Modal de imagens */}
        <ImovelModal
          imagens={imovel.imagens}
          aberto={modalAberto}
          imagemIndex={modalImagemIndex}
          onClose={fecharModal}
          onAnterior={imagemAnteriorModal}
          onProxima={proximaImagemModal}
          setImagemIndex={setModalImagemIndex}
          handleBackgroundClick={handleModalBackgroundClick}
        />
      </main>
      <Footer />
    </div>
  );
}