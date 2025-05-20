'use client';

import { useEffect, useState, useCallback } from 'react';
import ImovelCard from '@/components/ImovelCardCadastro';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import useAuthGuard from '@/hooks/useAuthGuard';
import FormularioImovel from '@/components/FormularioImovel';
import FiltroCadastroImoveis from '@/components/FiltroCadastroImoveis';

interface Imovel {
  id?: string;
  cidade: string;
  bairro: string;
  enderecoDetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoImovel: string;
  tipoNegocio: string;
  setorNegocio?: string;
  whatsapp: string;
  patrocinador?: string;
  imagens: string[];
  dataCadastro?: Date;
}

const opcoesTipoImovel: Record<string, string[]> = {
  'Residencial-Venda': ['Casa', 'Casa em Condomínio Fechado', 'Apartamento', 'Terreno', 'Sobrado', 'Cobertura', 'Outros'],
  'Residencial-Aluguel': ['Casa', 'Casa em Condomínio Fechado', 'Apartamento', 'Kitnet', 'Flat', 'Loft', 'Quitinete', 'Estúdio', 'Outros'],
  'Comercial-Venda': ['Ponto Comercial', 'Sala', 'Salão', 'Prédio', 'Terreno', 'Galpão', 'Box Comercial', 'Outros'],
  'Comercial-Aluguel': ['Ponto Comercial', 'Sala', 'Salão', 'Prédio', 'Terreno', 'Galpão', 'Box Comercial', 'Outros'],
  'Rural-Venda': ['Chácara', 'Sítio', 'Fazenda', 'Terreno', 'Barracão', 'Pousada', 'Outros'],
  'Rural-Aluguel': ['Chácara', 'Sítio', 'Fazenda', 'Terreno', 'Barracão', 'Pousada', 'Outros']
};

const cidadesComBairros: Record<string, string[]> = {
  Cuiabá: ['Centro', 'Coxipó', 'CPA', 'Santa Rosa', 'Jardim Itália'],
  Várzea_Grande: ['Centro Sul', 'Cristo Rei', 'Jardim Glória', 'Mapim'],
  Rondonópolis: ['Centro', 'Vila Aurora', 'Jardim Atlântico', 'Parque Universitário'],
  Sinop: ['Centro', 'Menino Jesus', 'Boa Esperança', 'Jardim Primavera'],
  Sorriso: ['Centro', 'São Domingos', 'Jardim Aurora'],
  Tangará_da_Serra: ['Centro', 'Jardim dos Ipês', 'Vila Alta'],
  Lucas_do_Rio_Verde: ['Centro', 'Menino Deus', 'Jardim das Palmeiras'],
  Barra_do_Garças: ['Centro', 'Novo Horizonte', 'Jardim Pitaluga'],
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

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-20 bg-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl md:text-5xl font-bold mb-5 text-white">Cadastrar Imóvel</h1>
        <button
          onClick={() => {
            signOut(auth);
            localStorage.removeItem('logado');
            router.push('/login');
          }}
          className="bg-red-700 text-white px-4 py-2 md:px-8 md:py-3 mb-5 rounded cursor-pointer hover:bg-red-400"
        >
          Sair
        </button>
      </div>

      <FormularioImovel 
        patrocinadores={patrocinadores}
        cidadesComBairros={cidadesComBairros}
        opcoesTipoImovel={opcoesTipoImovel}
        onSuccess={carregarImoveis}
      />

      <h2 className="text-xl font-bold mt-10 mb-4 text-white">
        Imóveis Cadastrados {filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador ? `(${imoveisFiltrados.length})` : `(${imoveis.length})`}
      </h2>
        
      <FiltroCadastroImoveis 
        patrocinadores={patrocinadores}
        onFiltroChange={setFiltros}
      />
      
      {carregando ? (
        <div className="text-center text-white">Carregando imóveis...</div>
      ) : (
        <>
          {imoveisFiltrados.length === 0 && (filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador) ? (
            <div className="text-center text-white bg-gray-600 p-4 rounded-lg">
              Nenhum imóvel encontrado com os filtros selecionados.
              <button 
                onClick={() => setFiltros({
                  tipoNegocio: '',
                  setorNegocio: '',
                  patrocinador: ''
                })}
                className="ml-2 text-blue-300 hover:text-blue-400"
              >
                Limpar filtros
              </button>
            </div>
          ) : (
            <ul className="grid md:grid-cols-2 gap-6 mt-6">
              {(filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador ? imoveisFiltrados : imoveis).map((imovel) => (
                <li key={imovel.id}>
                  <ImovelCard
                    imovel={imovel}
                    onDelete={handleDelete}
                    onEdit={(id) => router.push(`/editar-imovel/${id}`)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}