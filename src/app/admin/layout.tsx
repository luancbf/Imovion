'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import useAuthGuard from '@/hooks/useAuthGuard';
import { FiPlusSquare, FiUsers, FiMenu, FiX, FiHome } from "react-icons/fi";

const menuLinks = [
  {
    href: "/admin/cadastrar-imovel",
    label: "Cadastrar Imóvel",
    shortLabel: "Imóvel",
    icon: <FiPlusSquare size={20} />,
  },
  {
    href: "/admin/cadastrar-patrocinador",
    label: "Cadastrar Patrocinador", 
    shortLabel: "Patrocinador",
    icon: <FiUsers size={20} />,
  }
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const carregando = useAuthGuard();
  const pathname = usePathname();
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);

  if (carregando) return null;

  const isLinkAtivo = (href: string) => pathname === href;

  const toggleMenuMobile = () => setMenuMobileAberto(!menuMobileAberto);
  const fecharMenuMobile = () => setMenuMobileAberto(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      
      {/* ========================================= */}
      {/* HEADER MOBILE */}
      {/* ========================================= */}
      <header className="md:hidden fixed top-0 left-0 right-0 w-full bg-white border-b border-blue-200 text-gray-800 flex items-center justify-between px-4 py-3 shadow-sm z-50">
        <Link href="/" className="flex items-center">
          <Image
            src="/imovion.png"
            alt="Imovion Logo"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </Link>
        
        <button
          onClick={toggleMenuMobile}
          className="p-2 rounded-lg hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
          aria-label="Menu"
        >
          {menuMobileAberto ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </header>

      {/* ========================================= */}
      {/* OVERLAY MOBILE (quando menu está aberto) */}
      {/* ========================================= */}
      {menuMobileAberto && (
        <div 
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={fecharMenuMobile}
        />
      )}

      {/* ========================================= */}
      {/* MENU LATERAL MOBILE (slide) */}
      {/* ========================================= */}
      <nav className={`
        md:hidden fixed top-16 left-0 bottom-0 w-64 bg-white shadow-xl z-50 
        transform transition-transform duration-300 ease-in-out
        ${menuMobileAberto ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full p-6">
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
            {menuLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={fecharMenuMobile}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium text-base
                  focus:outline-none focus:ring-2 focus:ring-blue-300 flex-shrink-0
                  ${isLinkAtivo(link.href) 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                  }
                `}
              >
                <span className="mr-3">{link.icon}</span>
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="border-t border-gray-200 pt-4 mt-4 flex-shrink-0">
            <Link
              href="/"
              onClick={fecharMenuMobile}
              className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 font-medium"
            >
              <FiHome size={20} className="mr-3" />
              Voltar ao Site
            </Link>
          </div>
          
          <div className="text-xs text-gray-400 text-center pt-4 mt-4 border-t border-gray-100 flex-shrink-0">
            &copy; {new Date().getFullYear()} Imovion
          </div>
        </div>
      </nav>

      <div className="flex min-h-screen">
        {/* ========================================= */}
        {/* MENU LATERAL DESKTOP (100% fixo na tela) */}
        {/* ========================================= */}
        <aside className="hidden md:block w-64 fixed top-0 left-0 h-screen bg-white border-r border-blue-200 text-gray-800 shadow-sm z-30">
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex justify-center py-8 px-6 border-b border-blue-100 flex-shrink-0">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <Image
                  src="/imovion.png"
                  alt="Imovion Logo"
                  width={180}
                  height={60}
                  className="h-12 w-auto object-contain"
                />
              </Link>
            </div>
            
            {/* Menu Navigation - com scroll interno se necessário */}
            <nav className="flex flex-col gap-2 p-6 flex-1 overflow-y-auto">
              {menuLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center px-4 py-3 rounded-lg transition-all duration-200 font-medium text-base flex-shrink-0
                    focus:outline-none focus:ring-2 focus:ring-blue-300
                    ${isLinkAtivo(link.href) 
                      ? 'bg-blue-600 text-white shadow-md transform scale-[1.02]' 
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 hover:transform hover:scale-[1.01]'
                    }
                  `}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
            
            {/* Footer do Menu */}
            <div className="border-t border-gray-200 p-6 flex-shrink-0">
              <Link
                href="/"
                className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 font-medium mb-4"
              >
                <FiHome size={20} className="mr-3" />
                Voltar ao Site
              </Link>
              
              <div className="text-xs text-gray-400 text-center">
                &copy; {new Date().getFullYear()} Imovion
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================= */}
        {/* CONTEÚDO PRINCIPAL - com margem para o menu lateral */}
        {/* ========================================= */}
        <main className="flex-1 w-full min-h-screen pt-16 md:pt-0 md:ml-64 pb-20 md:pb-0">
          <div className="w-full h-full">
            {children}
          </div>
        </main>
      </div>

      {/* ========================================= */}
      {/* MENU INFERIOR MOBILE (fixo) */}
      {/* ========================================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center py-2">
          {menuLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 flex-1 mx-1
                focus:outline-none
                ${isLinkAtivo(link.href) 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }
              `}
            >
              <span className="mb-1">{link.icon}</span>
              <span className="text-xs font-medium">{link.shortLabel}</span>
            </Link>
          ))}
          
          <Link
            href="/"
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 flex-1 mx-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none"
          >
            <FiHome size={20} className="mb-1" />
            <span className="text-xs font-medium">Site</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}