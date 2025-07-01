'use client';

import { useEffect, useState } from 'react';
import useAuthGuard from '@/hooks/useAuthGuard';
import FormularioImovel from '@/components/cadastrar-imovel/FormularioImovel';
import FiltroCadastroImoveis from '@/components/cadastrar-imovel/FiltroCadastroImoveis';
import ListaImoveis from '@/components/cadastrar-imovel/ListaImoveis';
import cidadesComBairros from '@/constants/cidadesComBairros';
import type { Imovel } from '@/types/Imovel';
import { createBrowserClient } from "@supabase/ssr";

const opcoesTipoImovel: Record<string, string[]> = {
  'Residencial-Venda': ['Casa', 'Casa em Condomínio Fechado', 'Apartamento', 'Terreno', 'Sobrado', 'Cobertura', 'Outros'],
  'Residencial-Aluguel': ['Casa', 'Casa em Condomínio Fechado', 'Apartamento', 'Kitnet', 'Flat', 'Loft', 'Outros'],
  'Comercial-Venda': ['Ponto Comercial', 'Sala', 'Salão', 'Prédio', 'Terreno', 'Galpão', 'Box Comercial', 'Outros'],
  'Comercial-Aluguel': ['Ponto Comercial', 'Sala', 'Salão', 'Prédio', 'Terreno', 'Galpão', 'Box Comercial', 'Outros'],
  'Rural-Venda': ['Chácara', 'Sítio', 'Fazenda', 'Terreno', 'Barracão', 'Pousada', 'Outros'],
  'Rural-Aluguel': ['Chácara', 'Sítio', 'Fazenda', 'Terreno', 'Barracão', 'Pousada', 'Outros']
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function CadastrarImovel() {
  useAuthGuard();

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<{ id: string; nome: string }[]>([]);
  const [filtros, setFiltros] = useState({ tipoNegocio: '', setorNegocio: '', patrocinador: '' });
  const [carregando, setCarregando] = useState(false);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      let query = supabase.from('imoveis').select('*').order('dataCadastro', { ascending: false });
      if (filtros.tipoNegocio) query = query.eq('tipoNegocio', filtros.tipoNegocio);
      if (filtros.setorNegocio) query = query.eq('setorNegocio', filtros.setorNegocio);
      if (filtros.patrocinador) query = query.eq('patrocinador', filtros.patrocinador);
      const { data: imoveisData } = await query;
      setImoveis(imoveisData as Imovel[] || []);
      const { data: patrocinadoresData } = await supabase.from('patrocinadores').select('id, nome');
      setPatrocinadores(patrocinadoresData || []);
      setCarregando(false);
    })();
  }, [filtros]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      await supabase.from('imoveis').delete().eq('id', id);
      setImoveis(imoveis => imoveis.filter(imovel => imovel.id !== id));
    }
  };

  const handleEdit = async (id: string, dados?: Partial<Imovel>) => {
    if (!id || !dados) return;
    await supabase.from('imoveis').update(dados).eq('id', id);
    setImoveis(imoveis => imoveis.map(imovel => imovel.id === id ? { ...imovel, ...dados } : imovel));
  };

  const handleSuccess = async () => {
    setCarregando(true);
    const { data } = await supabase.from('imoveis').select('*').order('dataCadastro', { ascending: false });
    setImoveis(data as Imovel[] || []);
    setCarregando(false);
  };

  const handleSalvarImovel = async (dados: Partial<Imovel>) => {
    await supabase.from('imoveis').insert({
      ...dados
    });
    handleSuccess();
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="space-y-8">
        
          {/* Formulário - Componente com estilização própria */}
          <FormularioImovel
            patrocinadores={patrocinadores}
            cidadesComBairros={cidadesComBairros}
            opcoesTipoImovel={opcoesTipoImovel}
            onSuccess={handleSuccess}
            onSalvar={handleSalvarImovel}
          />

          {/* Filtros - Componente com estilização própria */}
          <FiltroCadastroImoveis
            patrocinadores={patrocinadores}
            onFiltroChange={setFiltros}
          />

          {/* Lista - Componente com estilização própria */}
          <ListaImoveis
            imoveis={imoveis}
            carregando={carregando}
            onDelete={handleDelete}
            onEdit={handleEdit}
            patrocinadores={patrocinadores}
            cidadesComBairros={cidadesComBairros}
            opcoesTipoImovel={opcoesTipoImovel}
          />

        </div>
      </main>
    </div>
  );
}