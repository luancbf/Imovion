'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  UsuarioComEstatisticas, 
  EstatisticasUsuarios, 
  FiltrosUsuarios, 
  CategoriaUsuario,
  LIMITES_POR_CATEGORIA
} from '@/types/usuarios';

export const useGerenciamentoUsuarios = () => {
  const [usuarios, setUsuarios] = useState<UsuarioComEstatisticas[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Ref para evitar múltiplas chamadas
  const isLoadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Carregar usuários (uma única vez)
  const carregarUsuarios = useCallback(async () => {
    // Evitar múltiplas chamadas simultâneas
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // 1. VERIFICAÇÃO DE AUTENTICAÇÃO
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        setError('Usuário não autenticado. Faça login novamente.');
        return;
      }

      // 2. OBTER TOKEN JWT
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        setError('Sessão inválida. Faça login novamente.');
        return;
      }

      // 3. CHAMADA PARA API ADMIN
      const response = await fetch('/api/admin/usuarios', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      // 4. TRATAMENTO DE ERROS
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        
        if (response.status === 401) {
          setError('Sessão expirada. Faça login novamente.');
        } else if (response.status === 403) {
          setError('Acesso negado. Apenas administradores podem acessar esta página.');
        } else {
          setError(errorData.error || 'Erro ao carregar usuários. Tente novamente.');
        }
        return;
      }

      // 5. PROCESSAR DADOS
      const data = await response.json();
      
      if (!data || !Array.isArray(data.usuarios)) {
        setError('Dados inválidos recebidos do servidor.');
        return;
      }

      // 6. TRANSFORMAR DADOS BASEADO EM CATEGORIAS
      const usuariosTransformados: UsuarioComEstatisticas[] = data.usuarios.map((profile: {
        id: string;
        email: string;
        nome?: string;
        sobrenome?: string;
        telefone?: string;
        role?: string;
        categoria?: string;
        creci?: string;
        is_corretor?: boolean;
        corretor?: boolean;
        limite_imoveis?: number;
        total_imoveis?: number;
        ultimo_acesso?: string;
        created_at?: string;
        updated_at?: string;
      }) => {
        // Determinar categoria (simplificado)
        const categoria: CategoriaUsuario = (profile.categoria as CategoriaUsuario) || 'usuario_comum';
        
        // Limite baseado na categoria automaticamente
        const limite_imoveis = profile.limite_imoveis || LIMITES_POR_CATEGORIA[categoria] || 1;

        return {
          id: profile.id,
          nome: profile.nome || '',
          sobrenome: profile.sobrenome || '',
          email: profile.email || '',
          telefone: profile.telefone || '',
          role: profile.role || 'user',
          categoria,
          creci: profile.creci || undefined,
          limite_imoveis,
          created_at: profile.created_at || new Date().toISOString(),
          updated_at: profile.updated_at || new Date().toISOString(),
          email_confirmed_at: undefined,
          total_imoveis: profile.total_imoveis || 0,
          imoveis_ativos: profile.total_imoveis || 0,
          receita_total: 0,
          ultimo_acesso: profile.ultimo_acesso || profile.updated_at || new Date().toISOString(),
          // Plano baseado na categoria (simplificado)
          plano_atual: {
            id: categoria,
            usuario_id: profile.id,
            plano_id: categoria,
            data_inicio: profile.created_at || new Date().toISOString(),
            data_fim: undefined,
            status: 'ativo' as const,
            valor_pago: 0,
            created_at: profile.created_at || new Date().toISOString(),
            plano: {
              id: categoria,
              nome: categoria === 'usuario_comum' ? 'Usuário Comum' :
                    categoria === 'corretor' ? 'Corretor' :
                    categoria === 'imobiliaria' ? 'Imobiliária' :
                    categoria === 'proprietario_com_plano' ? 'Proprietário com Plano' : 'Padrão',
              tipo: 'por_anuncio' as const,
              valor: 0,
              limite_imoveis: limite_imoveis,
              descricao: `Categoria: ${categoria} - Limite de ${limite_imoveis} imóvel(is)`,
              ativo: true,
              created_at: profile.created_at || new Date().toISOString()
            }
          }
        };
      });

      setUsuarios(usuariosTransformados);
      hasLoadedRef.current = true;

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar usuários');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Alterar categoria do usuário
  const alterarCategoriaUsuario = useCallback(async (
    usuarioId: string, 
    novaCategoria: CategoriaUsuario
  ) => {
    try {
      setLoading(true);
      
      // Verificar autenticação
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session?.access_token) {
        setError('Sessão inválida. Faça login novamente.');
        return false;
      }

      // Atualizar categoria via API
      const response = await fetch('/api/admin/usuarios', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          usuarioId,
          categoria: novaCategoria,
          limite_imoveis: LIMITES_POR_CATEGORIA[novaCategoria]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Erro desconhecido' }));
        setError(errorData.error || 'Erro ao alterar categoria do usuário');
        return false;
      }

      // Atualizar usuário local
      setUsuarios(prev => prev.map(usuario => {
        if (usuario.id === usuarioId) {
          const novoLimite = LIMITES_POR_CATEGORIA[novaCategoria];
          return {
            ...usuario,
            categoria: novaCategoria,
            limite_imoveis: novoLimite,
            plano_atual: {
              id: usuario.plano_atual?.id || novaCategoria,
              usuario_id: usuarioId,
              plano_id: novaCategoria,
              data_inicio: usuario.plano_atual?.data_inicio || new Date().toISOString(),
              data_fim: usuario.plano_atual?.data_fim,
              status: 'ativo' as const,
              valor_pago: usuario.plano_atual?.valor_pago || 0,
              created_at: usuario.plano_atual?.created_at || new Date().toISOString(),
              plano: {
                id: novaCategoria,
                nome: novaCategoria === 'usuario_comum' ? 'Usuário Comum' :
                      novaCategoria === 'corretor' ? 'Corretor' :
                      novaCategoria === 'imobiliaria' ? 'Imobiliária' :
                      novaCategoria === 'proprietario_com_plano' ? 'Proprietário com Plano' : 'Padrão',
                tipo: 'por_anuncio' as const,
                valor: 0,
                limite_imoveis: novoLimite,
                descricao: `Categoria: ${novaCategoria} - Limite de ${novoLimite} imóvel(is)`,
                ativo: true,
                created_at: usuario.plano_atual?.plano?.created_at || new Date().toISOString()
              }
            }
          };
        }
        return usuario;
      }));

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao alterar categoria');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

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

      // Categoria do usuário
      if (filtros.categoria !== 'todos') {
        if (filtros.categoria !== usuario.categoria) return false;
      }

      // CRECI
      if (filtros.creci !== 'todos') {
        if (filtros.creci === 'com' && !usuario.creci) return false;
        if (filtros.creci === 'sem' && usuario.creci) return false;
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
    const usuarios_comuns = usuarios.filter(u => u.categoria === 'usuario_comum').length;
    const corretores = usuarios.filter(u => u.categoria === 'corretor').length;
    const imobiliarias = usuarios.filter(u => u.categoria === 'imobiliaria').length;
    const proprietarios_com_plano = usuarios.filter(u => u.categoria === 'proprietario_com_plano').length;
    const comCreci = usuarios.filter(u => u.creci).length;
    const confirmados = usuarios.filter(u => u.email_confirmed_at).length;
    const planosAtivos = 0;
    
    // Estatísticas por plano
    const plano_comum = usuarios.filter(u => u.plano_ativo === 'comum').length;
    const plano_5_imoveis = usuarios.filter(u => u.plano_ativo === '5_imoveis').length;
    const plano_30_imoveis = usuarios.filter(u => u.plano_ativo === '30_imoveis').length;
    const plano_50_imoveis = usuarios.filter(u => u.plano_ativo === '50_imoveis').length;
    const plano_100_imoveis = usuarios.filter(u => u.plano_ativo === '100_imoveis').length;
    
    const thisMonth = usuarios.filter(u => {
      const created = new Date(u.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;

    const receitaMensal = 0;

    return {
      total,
      usuarios_comuns,
      corretores,
      imobiliarias,
      proprietarios_com_plano,
      novos_este_mes: thisMonth,
      confirmados,
      com_creci: comCreci,
      sem_creci: total - comCreci,
      planos_ativos: planosAtivos,
      receita_mensal: receitaMensal,
      // Estatísticas por plano
      plano_comum,
      plano_5_imoveis,
      plano_30_imoveis,
      plano_50_imoveis,
      plano_100_imoveis
    };
  }, [usuarios]);

  // Inicialização controlada - carregar apenas UMA vez
  useEffect(() => {
    if (!hasLoadedRef.current && !isLoadingRef.current) {
      carregarUsuarios();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vazio intencional - executa apenas uma vez

  return {
    usuarios,
    loading,
    error,
    carregarUsuarios,
    alterarCategoriaUsuario,
    filtrarUsuarios,
    obterEstatisticas,
    clearError: () => setError(null)
  };
};