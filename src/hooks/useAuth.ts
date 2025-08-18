import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialSession = async () => {
      try {
        console.log('🔍 Verificando sessão inicial...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Erro ao verificar sessão:', error);
          setUser(null);
        } else {
          console.log('✅ Sessão encontrada:', session?.user?.email || 'Nenhuma');
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('❌ Erro inesperado:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, 'User:', session?.user?.email || 'Nenhum');
      
      if (event === 'SIGNED_IN') {
        console.log('✅ Usuário logado:', session?.user?.email);
        setUser(session?.user ?? null);
      } else if (event === 'SIGNED_OUT') {
        console.log('🚪 Usuário saiu');
        setUser(null);
      } else if (event === 'TOKEN_REFRESHED') {
        console.log('🔄 Token renovado para:', session?.user?.email);
        setUser(session?.user ?? null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    try {
      console.log('🚪 Fazendo logout...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Erro ao fazer logout:', error);
      } else {
        console.log('✅ Logout realizado com sucesso');
      }
      setUser(null);
    } catch (error) {
      console.error('❌ Erro inesperado no logout:', error);
    }
  };

  // ✅ SIMPLIFICADO: Qualquer usuário autenticado é admin
  const isAdmin = !!user;
  
  console.log('👤 Estado atual:', {
    userEmail: user?.email || 'Nenhum',
    isAdmin,
    loading
  });

  return { 
    user, 
    loading, 
    logout,
    isAuthenticated: !!user,
    isAdmin
  };
}

export default useAuth;