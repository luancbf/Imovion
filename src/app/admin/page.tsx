'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import useAuthGuard from '@/hooks/useAuthGuard';

export default function AdminRedirect() {
  const router = useRouter();
  const carregando = useAuthGuard();

  useEffect(() => {
    if (!carregando) {
      // Redirecionamento imediato após verificação de auth
      const timer = setTimeout(() => {
        router.replace('/admin/cadastrar-imovel');
      }, 1000); // 1 segundo para mostrar a tela

      return () => clearTimeout(timer);
    }
  }, [carregando, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 pb-20 md:pb-0">
      <div className="text-center px-4">
        <div className="mb-8">
          <Image
            src="/imovion.png"
            alt="Imovion Logo"
            width={200}
            height={80}
            className="h-16 w-auto object-contain mx-auto"
          />
        </div>
        
        <div className="flex items-center justify-center space-x-2 text-blue-700 font-poppins text-lg font-medium mb-4">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        
        <p className="text-gray-600 font-medium">
          {carregando ? 'Verificando autenticação...' : 'Redirecionando para o painel...'}
        </p>
      </div>
    </div>
  );
}