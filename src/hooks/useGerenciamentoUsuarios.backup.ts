'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  UsuarioComEstatisticas, 
  EstatisticasUsuarios, 
  FiltrosUsuarios, 
  Plano 
} from '@/types/usuarios';

interface UsuarioPlanoQuery {
  id: string;
  plano_id: string;
  data_inicio: string;
  data_fim?: string;
  status: string;
  valor_pago: number;
  planos: Plano;
}

export const useGerenciamentoUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioComEstatisticas[]>([]);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar usuários com estatísticas completas
  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar usuários do profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          *,
          usuario_planos!inner(
            id,
            plano_id,
            data_inicio,
            data_fim,
            status,
            valor_pago,
            planos(*)
          )
        `)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Para cada usuário, buscar estatísticas de imóveis
      const usuariosCompletos: UsuarioComEstatisticas[] = [];

      for (const profile of profiles || []) {
        // Contar imóveis do usuário
        const { count: totalImoveis } = await supabase
          .from('imoveis')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id);

        const { count: imoveisAtivos } = await supabase
          .from('imoveis')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.id)
          .eq('status', 'ativo');

        // Calcular receita total do usuário
        const { data: pagamentos } = await supabase
          .from('usuario_planos')
          .select('valor_pago')
          .eq('usuario_id', profile.id);

        const receitaTotal = pagamentos?.reduce((total, p) => total + (p.valor_pago || 0), 0) || 0;

        // Plano atual (mais recente e ativo)
        const planoAtual = profile.usuario_planos?.find((up: UsuarioPlanoQuery) => up.status === 'ativo');

        usuariosCompletos.push({
          id: profile.id,
          email: profile.email || '',
          nome: profile.nome || '',
          sobrenome: profile.sobrenome || '',
          telefone: profile.telefone,
          role: profile.role || 'user',
          is_corretor: profile.is_corretor || false,
          creci: profile.creci,
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          last_sign_in_at: profile.last_sign_in_at,
          email_confirmed_at: profile.email_confirmed_at,
          total_imoveis: totalImoveis || 0,
          imoveis_ativos: imoveisAtivos || 0,
          plano_atual: planoAtual,
          receita_total: receitaTotal,
        });
      }

      setUsuarios(usuariosCompletos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar planos disponíveis
  const carregarPlanos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('ativo', true)
        .order('valor');

      if (error) throw error;
      setPlanos(data || []);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
    }
  }, []);

  // Alterar plano do usuário
  const alterarPlanoUsuario = useCallback(async (
    usuarioId: string, 
    novoPlanoId: string,
    valorPago: number = 0
  ) => {
    try {
      // Cancelar plano atual se existir
      await supabase
        .from('usuario_planos')
        .update({ status: 'cancelado', data_fim: new Date().toISOString() })
        .eq('usuario_id', usuarioId)
        .eq('status', 'ativo');

      // Criar novo plano
      const { error } = await supabase
        .from('usuario_planos')
        .insert({
          usuario_id: usuarioId,
          plano_id: novoPlanoId,
          data_inicio: new Date().toISOString(),
          status: 'ativo',
          valor_pago: valorPago
        });

      if (error) throw error;

      await carregarUsuarios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar plano');
      return false;
    }
  }, [carregarUsuarios]);

  // Cancelar plano do usuário
  const cancelarPlanoUsuario = useCallback(async (usuarioId: string) => {
    try {
      const { error } = await supabase
        .from('usuario_planos')
        .update({ 
          status: 'cancelado', 
          data_fim: new Date().toISOString() 
        })
        .eq('usuario_id', usuarioId)
        .eq('status', 'ativo');

      if (error) throw error;

      await carregarUsuarios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao cancelar plano');
      return false;
    }
  }, [carregarUsuarios]);

  // Filtrar usuários
  const filtrarUsuarios = useCallback((filtros: FiltrosUsuarios) => {
    return usuarios.filter(usuario => {
      // Busca textual
      if (filtros.busca) {
        const busca = filtros.busca.toLowerCase();
        const match = 
          usuario.nome?.toLowerCase().includes(busca) ||
          usuario.sobrenome?.toLowerCase().includes(busca) ||
          usuario.email?.toLowerCase().includes(busca) ||
          usuario.telefone?.includes(busca) ||
          usuario.creci?.toLowerCase().includes(busca);
        if (!match) return false;
      }

      // Tipo de usuário
      if (filtros.tipo_usuario !== 'todos') {
        if (filtros.tipo_usuario === 'corretor' && !usuario.is_corretor) return false;
        if (filtros.tipo_usuario === 'comum' && usuario.is_corretor) return false;
      }

      // CRECI
      if (filtros.creci !== 'todos') {
        if (filtros.creci === 'com' && !usuario.creci) return false;
        if (filtros.creci === 'sem' && usuario.creci) return false;
      }

      // Plano
      if (filtros.plano !== 'todos') {
        if (filtros.plano === 'sem_plano' && usuario.plano_atual) return false;
        if (filtros.plano === 'mensal' && usuario.plano_atual?.plano?.tipo !== 'mensal') return false;
        if (filtros.plano === 'por_anuncio' && usuario.plano_atual?.plano?.tipo !== 'por_anuncio') return false;
      }

      return true;
    }).sort((a, b) => {
      const { ordenar_por, ordem } = filtros;
      let compareValue = 0;

      switch (ordenar_por) {
        case 'nome':
          compareValue = a.nome.localeCompare(b.nome);
          break;
        case 'data_cadastro':
          compareValue = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'total_imoveis':
          compareValue = a.total_imoveis - b.total_imoveis;
          break;
        case 'receita':
          compareValue = a.receita_total - b.receita_total;
          break;
        default:
          compareValue = 0;
      }

      return ordem === 'desc' ? -compareValue : compareValue;
    });
  }, [usuarios]);

  // Calcular estatísticas
  const obterEstatisticas = useCallback((): EstatisticasUsuarios => {
    const total = usuarios.length;
    const corretores = usuarios.filter(u => u.is_corretor).length;
    const comCreci = usuarios.filter(u => u.creci).length;
    const confirmados = usuarios.filter(u => u.email_confirmed_at).length;
    const planosAtivos = usuarios.filter(u => u.plano_atual?.status === 'ativo').length;
    
    const thisMonth = usuarios.filter(u => {
      const created = new Date(u.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;

    const receitaMensal = usuarios
      .filter(u => u.plano_atual?.plano?.tipo === 'mensal' && u.plano_atual?.status === 'ativo')
      .reduce((total, u) => total + (u.plano_atual?.plano?.valor || 0), 0);

    return {
      total,
      corretores,
      usuarios_comuns: total - corretores,
      novos_este_mes: thisMonth,
      confirmados,
      com_creci: comCreci,
      sem_creci: total - comCreci,
      planos_ativos: planosAtivos,
      receita_mensal: receitaMensal
    };
  }, [usuarios]);

  useEffect(() => {
    carregarUsuarios();
    carregarPlanos();
  }, [carregarUsuarios, carregarPlanos]);

  return {
    usuarios,
    planos,
    loading,
    error,
    carregarUsuarios,
    alterarPlanoUsuario,
    cancelarPlanoUsuario,
    filtrarUsuarios,
    obterEstatisticas,
    clearError: () => setError(null)
  };
};