"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { AdminIcons } from "@/components/common/OptimizedIcons";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
        return;
      }
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

  if (!user) {
    return null;
  }

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: AdminIcons.Home,
      shortName: "Início",
      description: "Visão geral",
    },
    {
      name: "Cadastrar Imóvel",
      href: "/admin/cadastrar-imovel",
      icon: AdminIcons.Plus,
      shortName: "Imóveis",
      description: "Adicionar novos imóveis",
    },
    {
      name: "Gerenciar Usuários",
      href: "/admin/usuarios",
      icon: AdminIcons.Users,
      shortName: "Usuários",
      description: "Administrar usuários",
    },
    {
      name: "Patrocinadores",
      href: "/admin/cadastrar-patrocinador",
      icon: AdminIcons.Briefcase,
      shortName: "Patrocinadores",
      description: "Gerenciar parcerias",
    },
    {
      name: "APIs",
      href: "/admin/api-integration",
      icon: AdminIcons.Link,
      shortName: "APIs",
      description: "Integrações externas",
    },
  ];

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const isActiveRoute = (href: string) => {
    if (href === "/admin") {
      return pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* DESKTOP SIDEBAR */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-72 lg:bg-gradient-to-b lg:from-slate-900 lg:to-slate-800 lg:shadow-2xl">
        {/* Desktop Sidebar Header */}
        <div className="flex items-center justify-center h-24 relative overflow-hidden">
          <Link href="/admin" className="relative z-10">
            <Image
              src="/imovion.webp"
              alt="Imovion Logo"
              width={160}
              height={40}
              className="brightness-0 invert"
            />
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
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg transform scale-105"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white hover:transform hover:scale-105 hover:shadow-md"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {isActiveRoute(item.href) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-20 animate-pulse"></div>
                )}

                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-lg mr-4 transition-all duration-200 ${
                    isActiveRoute(item.href)
                      ? "bg-white bg-opacity-20 shadow-inner"
                      : "bg-slate-600 group-hover:bg-slate-500"
                  }`}
                >
                  <IconComponent size={20} />
                </div>

                <div className="flex-1 relative z-10">
                  <div className="font-semibold">{item.name}</div>
                  <div
                    className={`text-xs mt-1 ${
                      isActiveRoute(item.href)
                        ? "text-blue-100"
                        : "text-slate-400 group-hover:text-slate-200"
                    }`}
                  >
                    {item.description}
                  </div>
                </div>

                {isActiveRoute(item.href) && (
                  <div className="absolute right-0 top-0 bottom-0 w-1 bg-white rounded-l-full"></div>
                )}
              </Link>
            );
          })}
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
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                Administrador
              </p>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl transition-all duration-200 text-sm font-semibold shadow-lg hover:shadow-xl hover:transform hover:scale-105 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <AdminIcons.LogOut />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* MOBILE HEADER */}
      <header className="lg:hidden bg-white shadow-lg sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
        <div className="px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo Mobile */}
            <Link href="/admin" className="flex items-center space-x-2">
              <Image
                src="/imovion.webp"
                alt="Imovion Logo"
                width={120}
                height={30}
              />
            </Link>

            {/* Mobile User Info */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center space-x-2 bg-slate-100 px-3 py-2 rounded-lg">
                <div className="w-6 h-6 bg-slate-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-slate-700 font-medium">
                  Administrador
                </span>
              </div>
              
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-lg"
              >
                {sidebarOpen ? <AdminIcons.X size={24} /> : <AdminIcons.Menu size={24} />}
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
                        ? 'bg-slate-50 text-slate-700'
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
                <AdminIcons.LogOut size={20} className="mr-3" />
                <span className="font-medium">Sair</span>
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* MAIN CONTENT */}
      <main className="lg:ml-72">
        <div className="p-4 lg:p-8 min-h-screen">
          <div className="max-w-full h-full">{children}</div>
        </div>
      </main>

    </div>
  );
}
