import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Logout automático após 30 minutos (1800000 ms)
    let logoutTimer: NodeJS.Timeout;
    if (user) {
      logoutTimer = setTimeout(() => {
        supabase.auth.signOut();
        setUser(null);
      }, 1800000); // 30 minutos
    }

    return () => {
      subscription.unsubscribe();
      if (logoutTimer) clearTimeout(logoutTimer);
    };
  }, [user]);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) setUser(null);
  };

  return { 
    user, 
    loading, 
    logout,
    isAuthenticated: !!user 
  };
}

export default useAuth;