import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { Usuario } from '@/types/usuarios';

export function useUsuarioCompleto() {
  const { user: authUser } = useAuth();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const buscarDadosUsuario = async () => {
      if (!authUser) {
        setUsuario(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: err } = await supabase
          .from('usuarios')
          .select(`
            id,
            email,
            nome,
            sobrenome,
            telefone,
            role,
            categoria,
            tipo_usuario,
            plano_ativo,
            creci,
            limite_imoveis,
            imoveis_ativos_count,
            data_inicio_plano,
            data_fim_plano,
            status_plano,
            created_at,
            updated_at,
            last_sign_in_at,
            email_confirmed_at,
            plano_id,
            total_imoveis
          `)
          .eq('id', authUser.id)
          .single();

        if (err) {
          console.error('Erro ao buscar dados do usuário:', err);
          setError('Erro ao carregar dados do usuário');
          setUsuario(null);
        } else {
          setUsuario(data);
        }
      } catch (err) {
        console.error('Erro inesperado ao buscar usuário:', err);
        setError('Erro inesperado');
        setUsuario(null);
      } finally {
        setLoading(false);
      }
    };

    buscarDadosUsuario();
  }, [authUser]);

  const atualizarContadorImoveis = async () => {
    if (!authUser) return;

    try {
      const { count } = await supabase
        .from('imoveis')
        .select('*', { count: 'exact' })
        .eq('usuario_id', authUser.id)
        .eq('status', 'ativo');

      if (usuario) {
        setUsuario({
          ...usuario,
          imoveis_ativos_count: count || 0
        });
      }
    } catch (err) {
      console.error('Erro ao atualizar contador de imóveis:', err);
    }
  };

  return {
    usuario,
    loading,
    error,
    atualizarContadorImoveis,
    refetch: () => {
      if (authUser) {
        setLoading(true);
        // Re-trigger the effect
        setUsuario(null);
      }
    }
  };
}