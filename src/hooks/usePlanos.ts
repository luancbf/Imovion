'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Plano {
  id: string;
  nome: string;
  tipo: 'categoria_gratuita' | 'mensal' | 'anual' | 'vitalicio';
  valor: number;
  limite_imoveis: number | null;
  descricao: string;
  ativo: boolean;
  created_at: string;
  updated_at?: string;
  // Campos extras para UI
  popular?: boolean;
  cor?: string;
  icone?: string;
}

export interface UsuarioPlano {
  id: string;
  usuario_id: string;
  plano_id: string;
  data_inicio: string;
  data_fim: string | null;
  status: 'ativo' | 'cancelado' | 'expirado' | 'pendente';
  valor_pago: number;
  created_at: string;
  updated_at?: string;
  // Relacionamentos
  plano?: Plano;
}

interface PlanosStats {
  total: number;
  gratuitos: number;
  pagos: number;
  receita_mensal: number;
}

export const usePlanos = () => {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar todos os planos
  const loadPlanos = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('planos')
        .select('*')
        .order('valor', { ascending: true });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setPlanos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar planos');
      console.error('Erro ao carregar planos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar planos ativos (para seleção de usuário)
  const loadPlanosAtivos = useCallback(async (): Promise<Plano[]> => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('valor', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Erro ao carregar planos ativos:', err);
      return [];
    }
  }, []);

  // Obter plano do usuário atual
  const getPlanoUsuario = useCallback(async (usuarioId: string): Promise<UsuarioPlano | null> => {
    try {
      const { data, error } = await supabase
        .from('usuario_planos')
        .select(`
          *,
          planos (
            id,
            nome,
            tipo,
            valor,
            limite_imoveis,
            descricao,
            ativo
          )
        `)
        .eq('usuario_id', usuarioId)
        .eq('status', 'ativo')
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;
    } catch (err) {
      console.error('Erro ao buscar plano do usuário:', err);
      return null;
    }
  }, []);

  // Criar novo plano (admin)
  const criarPlano = useCallback(async (dados: Omit<Plano, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .insert([{
          ...dados,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await loadPlanos();
      return data.id;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar plano');
    }
  }, [loadPlanos]);

  // Atualizar plano (admin)
  const atualizarPlano = useCallback(async (id: string, dados: Partial<Plano>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('planos')
        .update({
          ...dados,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      await loadPlanos();
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar plano');
    }
  }, [loadPlanos]);

  // Assinar plano (usuário)
  const assinarPlano = useCallback(async (usuarioId: string, planoId: string): Promise<void> => {
    try {
      // Cancelar plano atual se existir
      await supabase
        .from('usuario_planos')
        .update({ 
          status: 'cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('usuario_id', usuarioId)
        .eq('status', 'ativo');

      // Buscar informações do plano
      const { data: plano, error: planoError } = await supabase
        .from('planos')
        .select('*')
        .eq('id', planoId)
        .single();

      if (planoError) throw planoError;

      // Criar nova assinatura
      const dataInicio = new Date();
      const dataFim = plano.tipo === 'categoria_gratuita' || plano.tipo === 'vitalicio' 
        ? null 
        : new Date(dataInicio.getFullYear(), dataInicio.getMonth() + 1, dataInicio.getDate());

      const { error: assinaturaError } = await supabase
        .from('usuario_planos')
        .insert([{
          usuario_id: usuarioId,
          plano_id: planoId,
          data_inicio: dataInicio.toISOString(),
          data_fim: dataFim?.toISOString() || null,
          status: 'ativo',
          valor_pago: plano.valor,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (assinaturaError) throw assinaturaError;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao assinar plano');
    }
  }, []);

  // Cancelar plano (usuário)
  const cancelarPlano = useCallback(async (usuarioId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('usuario_planos')
        .update({ 
          status: 'cancelado',
          updated_at: new Date().toISOString()
        })
        .eq('usuario_id', usuarioId)
        .eq('status', 'ativo');

      if (error) throw error;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao cancelar plano');
    }
  }, []);

  // Obter estatísticas de planos (admin)
  const getEstatisticasPlanos = useCallback(async (): Promise<PlanosStats> => {
    try {
      const [planosRes, assinaturasRes] = await Promise.all([
        supabase.from('planos').select('tipo, valor', { count: 'exact' }),
        supabase
          .from('usuario_planos')
          .select('valor_pago')
          .eq('status', 'ativo')
      ]);

      const totalPlanos = planosRes.count || 0;
      const gratuitos = (planosRes.data || []).filter(p => p.tipo === 'categoria_gratuita').length;
      const pagos = totalPlanos - gratuitos;
      
      const receitaMensal = (assinaturasRes.data || [])
        .reduce((sum, a) => sum + (a.valor_pago || 0), 0);

      return {
        total: totalPlanos,
        gratuitos,
        pagos,
        receita_mensal: receitaMensal
      };
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err);
      return {
        total: 0,
        gratuitos: 0,
        pagos: 0,
        receita_mensal: 0
      };
    }
  }, []);

  // Auto-load planos na inicialização
  useEffect(() => {
    loadPlanos();
  }, [loadPlanos]);

  return {
    planos,
    loading,
    error,
    // Métodos de leitura
    loadPlanos,
    loadPlanosAtivos,
    getPlanoUsuario,
    getEstatisticasPlanos,
    // Métodos de escrita (admin)
    criarPlano,
    atualizarPlano,
    // Métodos de usuário
    assinarPlano,
    cancelarPlano
  };
};