'use client';

import { useEffect, useState } from 'react';
import useAuthGuard from '@/hooks/useAuthGuard';
import FormularioImovel from '@/components/cadastrar-imovel/FormularioImovel';
import FiltroCadastroImoveis from '@/components/cadastrar-imovel/FiltroCadastroImoveis';
import ListaImoveis from '@/components/cadastrar-imovel/ListaImoveis';
import cidadesComBairros from '@/constants/cidadesComBairros';
import { opcoesTipoImovel } from '@/constants/opcoesTipoImovel';
import type { Imovel } from '@/types/Imovel';
import type { ImovelEdicao } from '@/types/formularios';
import type { Patrocinador } from '@/types/cadastrar-patrocinador';
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function CadastrarImovel() {
  useAuthGuard();

  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [filtros, setFiltros] = useState({ tipoNegocio: '', setorNegocio: '', patrocinador: '' });
  const [carregando, setCarregando] = useState(false);
  const [imovelEditando, setImovelEditando] = useState<ImovelEdicao | null>(null);

  useEffect(() => {
    (async () => {
      setCarregando(true);
      try {
        let query = supabase
          .from('imoveis')
          .select('*')
          .order('datacadastro', { ascending: false });
        
        if (filtros.tipoNegocio) {
          query = query.eq('tiponegocio', filtros.tipoNegocio);
        }
        if (filtros.setorNegocio) {
          query = query.eq('setornegocio', filtros.setorNegocio);
        }
        if (filtros.patrocinador) {
          query = query.eq('patrocinadorid', filtros.patrocinador);
        }
        
        const { data: imoveisData, error: imoveisError } = await query;
        
        if (imoveisError) {
          console.error('Erro ao buscar imóveis:', imoveisError);
          setImoveis([]);
        } else {
          setImoveis(imoveisData as Imovel[] || []);
        }
        
        const { data: patrocinadoresData, error: patrocinadorError } = await supabase
          .from('patrocinadores')
          .select('id, nome, slug, telefone, whatsapp, celular');
        
        if (patrocinadorError) {
          setPatrocinadores([]);
        } else {
          setPatrocinadores(patrocinadoresData || []);
        }
        
      } catch (error) {
        console.error('Erro geral:', error);
        setImoveis([]);
        setPatrocinadores([]);
      } finally {
        setCarregando(false);
      }
    })();
  }, [filtros]);

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        const { error } = await supabase
          .from('imoveis')
          .delete()
          .eq('id', id);
        
        if (error) {
          console.error('Erro ao excluir:', error);
          alert('Erro ao excluir imóvel: ' + error.message);
        } else {
          setImoveis(imoveis => imoveis.filter(imovel => imovel.id !== id));
          if (imovelEditando?.id === id) {
            setImovelEditando(null);
          }
          alert('Imóvel excluído com sucesso!');
        }
      } catch (error) {
        console.error('Erro geral ao excluir:', error);
        alert('Erro inesperado ao excluir imóvel.');
      }
    }
  };

  const handleEditarNoFormulario = (imovel: Imovel) => {
    const imovelParaEdicao: ImovelEdicao = {
      id: imovel.id,
      cidade: imovel.cidade,
      bairro: imovel.bairro,
      enderecodetalhado: imovel.enderecodetalhado,
      valor: imovel.valor,
      metragem: imovel.metragem,
      descricao: imovel.descricao,
      tipoimovel: imovel.tipoimovel,
      tiponegocio: imovel.tiponegocio,
      setornegocio: imovel.setornegocio,
      whatsapp: imovel.whatsapp,
      patrocinadorid: imovel.patrocinadorid,
      datacadastro: imovel.datacadastro,
      ativo: imovel.ativo,
      imagens: imovel.imagens,
      itens: imovel.itens,
      
      tipoImovel: imovel.tipoimovel,
      enderecoDetalhado: imovel.enderecodetalhado,
      tipoNegocio: imovel.tiponegocio,
      setorNegocio: imovel.setornegocio,
      dataCadastro: imovel.datacadastro,
      patrocinador: imovel.patrocinadorid,
    };

    setImovelEditando(imovelParaEdicao);
  };

  const handleLimparEdicao = () => {
    setImovelEditando(null);
  };

  const handleSuccess = async () => {
    setCarregando(true);
    
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('*')
        .order('datacadastro', { ascending: false });
      
      if (error) {
        console.error('Erro ao atualizar lista:', error);
        setImoveis([]);
      } else {
        setImoveis(data as Imovel[] || []);
      }
      
      setImovelEditando(null);
      
    } catch (error) {
      console.error('Erro geral ao atualizar:', error);
      setImoveis([]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-gray-50">
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        <div className="space-y-8">
          
          <FormularioImovel
            patrocinadores={patrocinadores}
            cidadesComBairros={cidadesComBairros}
            opcoesTipoImovel={opcoesTipoImovel}
            onSuccess={handleSuccess}
            dadosIniciais={imovelEditando}
            onLimpar={handleLimparEdicao}
          />

          <FiltroCadastroImoveis
            patrocinadores={patrocinadores}
            onFiltroChange={setFiltros}
          />

          <ListaImoveis
            imoveis={imoveis}
            carregando={carregando}
            onDelete={handleDelete}
            onEdit={handleEditarNoFormulario}
            patrocinadores={patrocinadores}
            cidadesComBairros={cidadesComBairros}
          />

        </div>
      </main>
    </div>
  );
}