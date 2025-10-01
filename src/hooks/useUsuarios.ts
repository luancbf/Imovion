'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface Usuario {
  id: string;
  email: string;
  nome: string;
  sobrenome: string;
  telefone: string;
  role: 'user' | 'admin';
  corretor: boolean;
  creci?: string;
  created_at: string;
  updated_at?: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
}

export interface UsuarioStats {
  total: number;
  corretores: number;
  usuarios: number;
  novosEsteMs: number;
  confirmados: number;
}

export const useUsuarios = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar usuários
  const loadUsuarios = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar dados dos profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Usar apenas dados dos profiles por enquanto
      const usuariosCompletos: Usuario[] = profiles?.map(profile => ({
        ...profile,
        email: profile.email || '',
        last_sign_in_at: null,
        email_confirmed_at: profile.created_at // Assumir confirmado se tem created_at
      })) || [];

      setUsuarios(usuariosCompletos);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar usuários');
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Atualizar role do usuário
  const updateUserRole = useCallback(async (userId: string, newRole: 'user' | 'admin') => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      await loadUsuarios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar usuário');
      return false;
    }
  }, [loadUsuarios]);

  // Deletar usuário (apenas do profiles - auth requer permissões especiais)
  const deleteUser = useCallback(async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      await loadUsuarios();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao deletar usuário');
      return false;
    }
  }, [loadUsuarios]);

  // Estatísticas
  const getStats = useCallback((): UsuarioStats => {
    const total = usuarios.length;
    const corretores = usuarios.filter(u => u.corretor).length;
    const confirmados = usuarios.filter(u => u.email_confirmed_at).length;
    
    const thisMonth = usuarios.filter(u => {
      const created = new Date(u.created_at);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;

    return {
      total,
      corretores,
      usuarios: total - corretores,
      novosEsteMs: thisMonth,
      confirmados
    };
  }, [usuarios]);

  useEffect(() => {
    loadUsuarios();
  }, [loadUsuarios]);

  return {
    usuarios,
    loading,
    error,
    loadUsuarios,
    updateUserRole,
    deleteUser,
    getStats,
    clearError: () => setError(null)
  };
};