'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Carregando painel...</p>
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
      shortName: 'Home',
      description: 'Visão geral do sistema'
    },
    {
      name: 'Cadastrar Imóvel',
      href: '/admin/cadastrar-imovel',
      icon: '🏠',
      shortName: 'Imóveis',
      description: 'Adicionar novos imóveis'
    },
    {
      name: 'Patrocinadores',
      href: '/admin/cadastrar-patrocinador',
      icon: '💼',
      shortName: 'Patrocinadores',
      description: 'Gerenciar parcerias'
    },
    {
      name: 'APIs',
      href: '/admin/api-integration',
      icon: '🔗',
      shortName: 'APIs',
      description: 'Integrações externas'
    }
  ];

  const handleLogout = async () => {
    console.log('🚪 AdminLayout: Iniciando logout...');
    await logout();
    router.push('/login');
  };

  const isActiveRoute = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* ✅ DESKTOP SIDEBAR */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-72 lg:bg-gradient-to-b lg:from-slate-900 lg:to-slate-800 lg:shadow-2xl">
        {/* Desktop Sidebar Header */}
        <div className="flex items-center justify-center h-20 bg-gradient-to-r from-blue-600 to-indigo-600 relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <Link href="/admin" className="relative z-10 text-center">
            <div className="text-3xl mb-1">🏢</div>
            <div className="text-white font-bold text-lg tracking-wide">Imovion</div>
            <div className="text-blue-200 text-xs font-medium">Admin Panel</div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 px-6 py-8 space-y-3">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-2">
            Navegação Principal
          </div>
          {navigationItems.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${
                isActiveRoute(item.href)
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105 hover:shadow-md'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {isActiveRoute(item.href) && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 animate-pulse"></div>
              )}
              
              <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-4 transition-all duration-200 ${
                isActiveRoute(item.href) 
                  ? 'bg-white bg-opacity-20 shadow-inner' 
                  : 'bg-slate-600 group-hover:bg-slate-500'
              }`}>
                <span className="text-xl">{item.icon}</span>
              </div>
              
              <div className="flex-1 relative z-10">
                <div className="font-semibold">{item.name}</div>
                <div className={`text-xs mt-1 ${
                  isActiveRoute(item.href) 
                    ? 'text-blue-100' 
                    : 'text-slate-400 group-hover:text-slate-200'
                }`}>
                  {item.description}
                </div>
              </div>

              {isActiveRoute(item.href) && (
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
              )}
            </Link>
          ))}
        </nav>

        {/* Desktop User Info */}
        <div className="border-t border-slate-700 p-6 bg-slate-800">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-lg font-bold text-white">
                  {user.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-slate-800"></div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                Administrador
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user.email}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-xs text-green-400 font-medium">Online</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>🚪</span>
            <span>Sair do Sistema</span>
          </button>
        </div>
      </div>

      {/* ✅ MOBILE HEADER NORMAL - MANTIDO TAMANHO ORIGINAL */}
      <header className="lg:hidden bg-white shadow-lg border-b sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo Mobile Normal */}
            <Link href="/admin" className="flex items-center space-x-2">
              <span className="text-2xl">🏢</span>
              <div>
                <div className="text-xl font-bold text-slate-800">Imovion</div>
                <div className="text-xs text-slate-500 font-medium">Admin Panel</div>
              </div>
            </Link>

            {/* Mobile User Info Normal */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-slate-700 font-medium">
                  {user.email?.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
              >
                Sair
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ✅ MAIN CONTENT COM ALTURA AJUSTADA PARA HEADER NORMAL */}
      <main className="lg:ml-72">
        <div className="p-4 sm:p-6 lg:p-8 pb-20 lg:pb-8 min-h-[calc(100vh-4rem)] lg:min-h-screen">
          <div className="max-w-full h-full">
            {children}
          </div>
        </div>
      </main>

      {/* ✅ BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-2xl backdrop-blur-md bg-opacity-95">
        <div className="grid grid-cols-4 gap-1 p-3">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-3 px-2 rounded-xl transition-all duration-200 ${
                isActiveRoute(item.href)
                  ? 'text-blue-600 bg-blue-50 transform scale-105 shadow-md'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600'
              }`}
            >
              <div className={`p-2 rounded-lg transition-all duration-200 ${
                isActiveRoute(item.href) 
                  ? 'bg-blue-100' 
                  : 'bg-transparent'
              }`}>
                <span className="text-lg">{item.icon}</span>
              </div>
              <span className="text-xs font-medium text-center leading-tight mt-1">
                {item.shortName}
              </span>
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}