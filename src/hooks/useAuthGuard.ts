'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function useAuthGuard() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ignore = false;
    async function checkSession() {
      const { data } = await supabase.auth.getSession();
      if (!ignore) {
        if (!data.session) {
          router.replace('/login');
        } else {
          setCarregando(false);
        }
      }
    }
    checkSession();
    return () => {
      ignore = true;
    };
  }, [router]);

  return carregando;
}