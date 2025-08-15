'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

// Tempo máximo de inatividade (em milissegundos)
const TEMPO_MAX_INATIVIDADE = 20 * 60 * 1000; // 20 minutos

export default function useAuthGuard() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const idleTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let ignore = false;

    // Função para logout automático (agora dentro do useEffect)
    const logout = async () => {
      await supabase.auth.signOut();
      router.replace('/login');
    };

    // Reseta o timer de inatividade
    const resetIdleTimer = () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        logout();
      }, TEMPO_MAX_INATIVIDADE);
    };

    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!ignore) {
        if (!data.session) {
          router.replace('/login');
        } else {
          setCarregando(false);
          resetIdleTimer();
        }
      }
    }
    checkSession();

    // Eventos que resetam o timer de inatividade
    const eventos = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    eventos.forEach(ev => window.addEventListener(ev, resetIdleTimer));

    // Opcional: logout ao fechar a aba/navegador
    // window.addEventListener('beforeunload', logout);

    return () => {
      ignore = true;
      if (idleTimer.current) clearTimeout(idleTimer.current);
      eventos.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
      // window.removeEventListener('beforeunload', logout);
    };
  }, [router]);

  return carregando;
}