'use client';

import { useEffect, useState } from 'react';
import FormularioImovel from '@/components/cadastrar-imovel/FormularioImovel';
import FiltroCadastroImoveis from '@/components/cadastrar-imovel/FiltroCadastroImoveis';
import ListaImoveis from '@/components/cadastrar-imovel/ListaImoveis';
import { opcoesTipoImovel } from '@/constants/opcoesTipoImovel';
import { supabase } from '@/lib/supabase';
import type { Imovel } from '@/types/Imovel';
import type { ImovelEdicao } from '@/types/formularios';
import type { Patrocinador } from '@/types/cadastrar-patrocinador';

export default function CadastrarImovel() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [filtros, setFiltros] = useState({ 
    tipoNegocio: '', 
    setorNegocio: '', 
    patrocinador: '',
    codigoImovel: ''
  });
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
        if (filtros.codigoImovel) {
          query = query.ilike('codigoimovel', `%${filtros.codigoImovel}%`);
        }
        
        const { data: imoveisData, error: imoveisError } = await query;
        
        if (imoveisError) {
          console.error('Erro ao carregar imóveis:', imoveisError);
          setImoveis([]);
        } else {
          setImoveis(imoveisData as Imovel[] || []);
        }
        
        const { data: patrocinadoresData, error: patrocinadorError } = await supabase
          .from('patrocinadores')
          .select('id, nome, slug, telefone, creci');
        
        if (patrocinadorError) {
          console.error('Erro ao carregar patrocinadores:', patrocinadorError);
          setPatrocinadores([]);
        } else {
          setPatrocinadores(
            (patrocinadoresData || []).filter(
              (p: { id?: string; nome?: string }) => !!p && !!p.id && !!p.nome
            )
          );
        }
        
      } catch (error) {
        console.error('Erro inesperado:', error);
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
        console.error('Erro inesperado:', error);
        alert('Erro inesperado ao excluir imóvel.');
      }
    }
  };

  const handleEditarNoFormulario = (imovel: Imovel) => {
    let itensProcessados: Record<string, number> | undefined;
    
    if (imovel.itens) {
      try {
        if (typeof imovel.itens === 'string') {
          const itensParsed = JSON.parse(imovel.itens);
          itensProcessados = Object.fromEntries(
            Object.entries(itensParsed).map(([k, v]) => [k, Number(v) || 0])
          );
        } else if (typeof imovel.itens === 'object') {
          itensProcessados = Object.fromEntries(
            Object.entries(imovel.itens).map(([k, v]) => [k, Number(v) || 0])
          );
        }
      } catch (error) {
        console.error('Erro ao processar itens do imóvel:', error);
        itensProcessados = undefined;
      }
    }

    const imovelParaEdicao: ImovelEdicao = {
      ...imovel,
      tipoImovel: imovel.tipoimovel,
      setorNegocio: imovel.setornegocio,
      tipoNegocio: imovel.tiponegocio,
      itens: itensProcessados,
    };

    setImovelEditando(imovelParaEdicao);

    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
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
        console.error('Erro ao recarregar:', error);
        setImoveis([]);
      } else {
        setImoveis(data as Imovel[] || []);
      }
      
      setImovelEditando(null);

    } catch (error) {
      console.error('Erro inesperado:', error);
      setImoveis([]);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="space-y-4">
      <FormularioImovel
        patrocinadores={patrocinadores}
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
      />
    </div>
  );
}