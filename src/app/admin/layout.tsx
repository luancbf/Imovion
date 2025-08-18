'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, loading, logout } = useAuth(); 

  useEffect(() => {
    console.log('🏢 AdminLayout - Estado:', { 
      userEmail: user?.email || 'Nenhum', 
      loading 
    });

    if (!loading) {
      if (!user) {
        console.log('❌ AdminLayout: Usuário não logado, redirecionando...');
        router.push('/login');
        return;
      }

      console.log('✅ AdminLayout: Acesso autorizado para:', user.email);
    }
  }, [user, loading, router]); 

  if (loading) {
    console.log('⏳ AdminLayout: Carregando autenticação...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('🚫 AdminLayout: Acesso negado, não renderizando');
    return null;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: '📊',
      shortName: 'Home'
    },
    {
      name: 'Cadastrar Imóvel',
      href: '/admin/cadastrar-imovel',
      icon: '🏠',
      shortName: 'Imóveis'
    },
    {
      name: 'Patrocinadores',
      href: '/admin/cadastrar-patrocinador',
      icon: '💼',
      shortName: 'Patrocinadores'
    },
    {
      name: 'APIs',
      href: '/admin/api-integration',
      icon: '🔗',
      shortName: 'APIs'
    }
  ];

  const handleLogout = async () => {
    console.log('🚪 AdminLayout: Iniciando logout...');
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-xl sm:text-2xl font-bold text-blue-600">
                🏢 Imovion
              </Link>
            </div>

            {/* Desktop Logout */}
            <div className="hidden sm:flex items-center space-x-4">
              <span className="text-sm text-gray-600">👤 {user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>

            {/* Mobile Logout */}
            <button
              onClick={handleLogout}
              className="sm:hidden bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8">
          <div className="max-w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Bottom Navigation Mobile/Tablet */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium text-center leading-tight">
                {item.shortName}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}