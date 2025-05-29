'use client';

import { useEffect, useState, useCallback } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import useAuthGuard from '@/hooks/useAuthGuard';
import FormularioImovel from '@/components/cadastrar-imovel/FormularioImovel';
import FiltroCadastroImoveis from '@/components/cadastrar-imovel/FiltroCadastroImoveis';
import ImovelCardCadastro from '@/components/cadastrar-imovel/ImovelCardCadastro';
import HeaderCadastrarImovel from '@/components/cadastrar-imovel/HeaderCadastrarImovel';
import cidadesComBairros from '@/constants/cidadesComBairros';
import type { Imovel } from '@/types/Imovel';

const opcoesTipoImovel: Record<string, string[]> = {
  'Residencial-Venda': ['Casa', 'Casa em Condomínio Fechado', 'Apartamento', 'Terreno', 'Sobrado', 'Cobertura', 'Outros'],
  'Residencial-Aluguel': ['Casa', 'Casa em Condomínio Fechado', 'Apartamento', 'Kitnet', 'Flat', 'Loft', 'Quitinete', 'Estúdio', 'Outros'],
  'Comercial-Venda': ['Ponto Comercial', 'Sala', 'Salão', 'Prédio', 'Terreno', 'Galpão', 'Box Comercial', 'Outros'],
  'Comercial-Aluguel': ['Ponto Comercial', 'Sala', 'Salão', 'Prédio', 'Terreno', 'Galpão', 'Box Comercial', 'Outros'],
  'Rural-Venda': ['Chácara', 'Sítio', 'Fazenda', 'Terreno', 'Barracão', 'Pousada', 'Outros'],
  'Rural-Aluguel': ['Chácara', 'Sítio', 'Fazenda', 'Terreno', 'Barracão', 'Pousada', 'Outros']
};

export default function CadastrarImovel() {
  useAuthGuard();

  const router = useRouter();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<{ id: string; nome: string }[]>([]);
  const [filtros, setFiltros] = useState({
    tipoNegocio: '',
    setorNegocio: '',
    patrocinador: ''
  });
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    carregarImoveis();
    carregarPatrocinadores();
  }, []);

  const carregarImoveis = async () => {
    setCarregando(true);
    try {
      const snapshot = await getDocs(collection(db, 'imoveis'));
      const imoveisData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Imovel[];
      setImoveis(imoveisData);
      setImoveisFiltrados(imoveisData);
    } finally {
      setCarregando(false);
    }
  };

  const carregarPatrocinadores = async () => {
    const snapshot = await getDocs(collection(db, 'patrocinadores'));
    const lista = snapshot.docs.map(doc => ({
      id: doc.id,
      nome: doc.data().nome,
    }));
    setPatrocinadores(lista);
  };

  const filtrarImoveis = useCallback(() => {
    let resultado = [...imoveis];

    if (filtros.tipoNegocio) {
      resultado = resultado.filter(imovel =>
        imovel.tipoNegocio === filtros.tipoNegocio
      );
    }

    if (filtros.setorNegocio) {
      resultado = resultado.filter(imovel =>
        imovel.setorNegocio === filtros.setorNegocio
      );
    }

    if (filtros.patrocinador) {
      resultado = resultado.filter(imovel =>
        imovel.patrocinador === filtros.patrocinador
      );
    }

    setImoveisFiltrados(resultado);
  }, [imoveis, filtros]);

  useEffect(() => {
    filtrarImoveis();
  }, [filtrarImoveis]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      await deleteDoc(doc(db, 'imoveis', id));
      setImoveis(imoveis.filter(imovel => imovel.id !== id));
    }
  };

  const handleEdit = async (id: string, dados?: Partial<Imovel>) => {
    if (!id || !dados) return;
    await updateDoc(doc(db, 'imoveis', id), dados);
    await carregarImoveis();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-100 via-gray-100 to-blue-200 flex flex-col">
      {/* Header fixo */}
      <HeaderCadastrarImovel
        onHome={() => router.push('/')}
      />
      {/* Conteúdo principal */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-2 md:px-8 flex flex-col gap-8">
        {/* Formulário destacado */}
        <section className="bg-white/90 rounded-2xl shadow-lg p-6 md:p-10 mt-2 mb-2">
          <FormularioImovel
            patrocinadores={patrocinadores}
            cidadesComBairros={cidadesComBairros}
            opcoesTipoImovel={opcoesTipoImovel}
            onSuccess={carregarImoveis}
          />
        </section>

        {/* Filtros */}
        <section className="bg-white/80 rounded-xl shadow p-4 md:p-8 flex flex-col md:flex-row md:items-center gap-4 w-full max-w-5xl mx-auto">
          <FiltroCadastroImoveis
            patrocinadores={patrocinadores}
            onFiltroChange={setFiltros}
          />
          <div className="flex-1" />
        </section>

        {/* Título e quantidade */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h2 className="font-poppins text-xl md:text-2xl font-bold text-blue-900">
            Imóveis Cadastrados{' '}
            <span className="font-normal text-gray-600">
              (
                {filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador
                  ? imoveisFiltrados.length
                  : imoveis.length
                }
              )
            </span>
          </h2>
        </div>

        {/* Lista de imóveis */}
        <section className="flex-1">
          {carregando ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-4 text-blue-700 font-semibold">Carregando imóveis...</span>
            </div>
          ) : (
            <>
              {imoveisFiltrados.length === 0 && (filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador) ? (
                <div className="font-inter text-center text-blue-700 bg-blue-100 border border-blue-200 p-6 rounded-xl shadow">
                  Nenhum imóvel encontrado com os filtros selecionados.
                </div>
              ) : (
                <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 mt-2">
                  {(filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador ? imoveisFiltrados : imoveis).map((imovel) => (
                    <li key={imovel.id}>
                      <ImovelCardCadastro
                        imovel={{
                          ...imovel,
                          itens: Object.fromEntries(
                            Object.entries(imovel.itens ?? {}).map(([k, v]) => [k, Number(v)])
                          )
                        }}
                        onDelete={handleDelete}
                        onEdit={handleEdit}
                        cidadesComBairros={cidadesComBairros}
                        opcoesTipoImovel={opcoesTipoImovel}
                        patrocinadores={patrocinadores}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}