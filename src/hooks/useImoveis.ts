import { useState, useEffect, useCallback } from 'react';
import { Imovel } from '@/types/Imovel';
import { supabase } from '@/lib/supabase';

interface FiltroImoveis {
  tipoNegocio?: string;
  setorNegocio?: string;
  cidade?: string;
  usuarioId?: string;
}

export function useImoveis(filtros?: FiltroImoveis) {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const buscarImoveis = useCallback(async () => {
    try {
      setCarregando(true);
      setErro(null);

      let query = supabase.from('imoveis').select('*');

      // Aplicar filtros
      if (filtros?.tipoNegocio && filtros.tipoNegocio !== 'todos') {
        query = query.eq('tiponegocio', filtros.tipoNegocio);
      }
      if (filtros?.setorNegocio && filtros.setorNegocio !== 'todos') {
        query = query.eq('setornegocio', filtros.setorNegocio);
      }
      if (filtros?.cidade && filtros.cidade.trim() !== '') {
        query = query.ilike('cidade', `%${filtros.cidade}%`);
      }
      if (filtros?.usuarioId && filtros.usuarioId !== 'todos') {
        query = query.eq('user_id', filtros.usuarioId);
      }

      const { data, error } = await query.order('datacadastro', { ascending: false });

      if (error) {
        throw error;
      }

      setImoveis(data || []);
    } catch (error) {
      console.error('Erro ao buscar imóveis:', error);
      setErro('Erro ao carregar imóveis');
    } finally {
      setCarregando(false);
    }
  }, [filtros?.tipoNegocio, filtros?.setorNegocio, filtros?.cidade, filtros?.usuarioId]);

  const recarregar = () => {
    buscarImoveis();
  };

  useEffect(() => {
    buscarImoveis();
  }, [buscarImoveis]);

  return {
    imoveis,
    carregando,
    erro,
    recarregar
  };
}

export default useImoveis;