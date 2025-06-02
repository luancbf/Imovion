'use client';

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Image from "next/image";
import ImovelCard from "@/components/ImovelCard";
import type { Imovel } from "@/types/Imovel";

export default function PatrocinadorPage() {
  const params = useParams();
  const patrocinadorId = params?.id as string;

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [patrocinador, setPatrocinador] = useState<{ nome: string; banner: string } | null>(null);

  useEffect(() => {
    async function fetchPatrocinador() {
      if (!patrocinadorId) return;
      const docRef = doc(db, "patrocinadores", patrocinadorId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setPatrocinador({
          nome: data.nome || patrocinadorId,
          banner: data.bannerUrl || "/patrocinadores/default-banner.jpg", // <-- ajuste aqui
        });
      } else {
        setPatrocinador({
          nome: patrocinadorId,
          banner: "/patrocinadores/default-banner.jpg",
        });
      }
    }
    fetchPatrocinador();
  }, [patrocinadorId]);

  useEffect(() => {
    async function fetchImoveis() {
      setCarregando(true);
      const q = query(
        collection(db, "imoveis"),
        where("patrocinador", "==", patrocinadorId)
      );
      const snapshot = await getDocs(q);
      const imoveisData: Imovel[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Imovel[];
      setImoveis(imoveisData);
      setCarregando(false);
    }
    if (patrocinadorId) fetchImoveis();
  }, [patrocinadorId]);

  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-100 to-white">
      <Header />
      <div className="w-full flex flex-col items-center rounded-b-3xl pt-8 pb-6">
        <div className="w-full max-w-3xl mx-auto px-2">
          <Image
            src={patrocinador?.banner || "/patrocinadores/default-banner.jpg"}
            alt={`Banner do patrocinador ${patrocinador?.nome || patrocinadorId}`}
            width={1200}
            height={320}
            className="w-full h-48 md:h-64 object-cover rounded-2xl shadow"
            priority
          />
        </div>
        <h1 className="font-poppins text-3xl md:text-4xl font-extrabold text-blue-700 mt-6 mb-0 text-center drop-shadow" style={{ userSelect: "none" }}>
          {patrocinador?.nome || patrocinadorId}
        </h1>
      </div>
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-4 py-10">
        {carregando ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <span className="text-blue-700 font-semibold">Carregando imóveis...</span>
          </div>
        ) : imoveis.length === 0 ? (
          <div className="font-inter text-center text-blue-700 bg-blue-100 border border-blue-200 p-6 rounded-xl shadow mt-10">
            Nenhum imóvel cadastrado para este patrocinador.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {imoveis.map((imovel) => (
              <ImovelCard key={imovel.id} imovel={imovel} contexto="patrocinador" />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}