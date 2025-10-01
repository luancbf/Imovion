'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FiHome, 
  FiPlus, 
  FiList, 
  FiUser, 
  FiLogOut, 
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';

export default function PainelUsuarioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-700 font-medium">Carregando painel...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/painel-usuario',
      icon: FiHome,
      shortName: 'Início',
      description: 'Visão geral'
    },
    {
      name: 'Cadastrar Imóvel',
      href: '/painel-usuario/cadastrar-imovel',
      icon: FiPlus,
      shortName: 'Cadastrar',
      description: 'Anunciar imóvel'
    },
    {
      name: 'Meus Imóveis',
      href: '/painel-usuario/meus-imoveis',
      icon: FiList,
      shortName: 'Imóveis',
      description: 'Gerenciar anúncios'
    },
    {
      name: 'Perfil',
      href: '/painel-usuario/perfil',
      icon: FiUser,
      shortName: 'Perfil',
      description: 'Dados pessoais'
    }
  ];

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const isActiveRoute = (href: string) => {
    if (href === '/painel-usuario') {
      return pathname === '/painel-usuario';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-72 lg:bg-gradient-to-b lg:from-blue-900 lg:to-blue-800 lg:shadow-2xl">
        {/* Desktop Header */}
        <div className="flex items-center justify-center h-24 relative overflow-hidden">
          <Link href="/painel-usuario" className="relative z-10">
            <Image src="/imovion.webp" alt="Imovion" width={160} height={40} className="brightness-0 invert" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="flex-1 px-6 py-8 space-y-3">
          {navigationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center px-4 py-4 text-sm font-medium rounded-xl transition-all duration-200 relative overflow-hidden ${
                  isActiveRoute(item.href)
                    ? 'bg-gradient-to-r from-white to-blue-50 text-blue-700 shadow-lg transform scale-105'
                    : 'text-blue-200 hover:bg-blue-700 hover:text-white hover:transform hover:scale-105'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-4 transition-all duration-200 ${
                  isActiveRoute(item.href) 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'bg-blue-600 group-hover:bg-blue-500 text-white'
                }`}>
                  <IconComponent size={20} />
                </div>
                
                <div className="flex-1">
                  <div className="font-semibold">{item.name}</div>
                  <div className={`text-xs mt-1 ${
                    isActiveRoute(item.href) 
                      ? 'text-blue-500' 
                      : 'text-blue-300 group-hover:text-blue-100'
                  }`}>
                    {item.description}
                  </div>
                </div>

                {isActiveRoute(item.href) && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-600 rounded-l-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop User Info */}
        <div className="border-t border-blue-700 p-6 bg-blue-800">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-white to-blue-100 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-lg font-bold text-blue-600">
                {user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {user.user_metadata?.nome || 'Usuário'}
              </p>
              <p className="text-xs text-blue-200 truncate">
                {user.email}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:transform hover:scale-105 flex items-center justify-center space-x-2"
          >
            <FiLogOut size={16} />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <header className="lg:hidden bg-white shadow-lg sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <Link href="/painel-usuario" className="flex items-center space-x-2">
              <Image src="/imovion.webp" alt="Imovion" width={120} height={30} />
            </Link>

            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-blue-100 px-3 py-2 rounded-lg">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-blue-700 font-medium">
                  {user.user_metadata?.nome || user.email?.split('@')[0]}
                </span>
              </div>
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
              >
                {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-t shadow-lg z-30">
            <nav className="p-4 space-y-2">
              {navigationItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActiveRoute(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <IconComponent size={20} className="mr-3" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiLogOut size={20} className="mr-3" />
                <span className="font-medium">Sair</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72">
        <div className="p-4 lg:p-8 min-h-screen">
          {children}
        </div>
      </main>

    </div>
  );
}