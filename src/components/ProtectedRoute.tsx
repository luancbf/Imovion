'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    const logado = localStorage.getItem('logado');
    if (logado !== 'true') {
      router.push('/login');
    }
  }, [router]);

  return <>{children}</>;
}
