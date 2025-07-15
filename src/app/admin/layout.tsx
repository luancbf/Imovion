'use client';

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from 'next/navigation';
import useAuthGuard from '@/hooks/useAuthGuard';
import useAuth from '@/hooks/useAuth';
import { FiPlusSquare, FiUsers, FiHome, FiLogOut } from "react-icons/fi";

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
  const router = useRouter();
  const { logout } = useAuth();

  if (carregando) return null;

  const isLinkAtivo = (href: string) => pathname === href;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 via-white to-blue-100">
      {/* HEADER MOBILE */}
      <header className="lg:hidden fixed top-0 left-0 right-0 w-full bg-white border-b border-blue-200 flex items-center justify-center px-4 py-3 shadow-sm z-50">
        <Link href="/" className="flex items-center">
          <Image
            src="/imovion.png"
            alt="Imovion Logo"
            width={120}
            height={40}
            className="h-8 w-auto object-contain"
          />
        </Link>
      </header>

      <div className="flex min-h-screen w-full">
        {/* MENU LATERAL DESKTOP */}
        <aside className="hidden lg:block w-64 fixed top-0 left-0 h-screen bg-white border-r border-blue-200 text-gray-800 shadow-sm z-30">
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
            
            {/* Menu Navigation */}
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
            
            {/* Footer do Menu Desktop */}
            <div className="border-t border-gray-200 p-6 flex-shrink-0">
              <Link
                href="/"
                className="flex items-center px-4 py-3 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-gray-800 transition-all duration-200 font-medium mb-4"
              >
                <FiHome size={20} className="mr-3" />
                Voltar ao Site
              </Link>
              <button
                onClick={async () => {
                  await logout();
                  router.replace('/login');
                }}
                className="flex items-center px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition-all duration-200 font-medium w-full"
              >
                <FiLogOut size={20} className="mr-3" />
                Sair da conta
              </button>
              <div className="text-xs text-gray-400 text-center mt-4">
                &copy; {new Date().getFullYear()} Imovion
              </div>
            </div>
          </div>
        </aside>

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex-1 w-full min-h-screen max-w-none px-0 pt-16 pb-20 lg:pt-0 lg:pb-0 lg:ml-64 flex flex-col">
          <div className="flex-1 flex flex-col w-full h-full">
            {children}
          </div>
        </main>
      </div>

      {/* MENU INFERIOR MOBILE/TABLET */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center py-2">
          {menuLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`
                flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 flex-1 mx-1
                focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50
                ${isLinkAtivo(link.href) 
                  ? 'text-blue-600 bg-blue-50 shadow-sm' 
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                }
              `}
            >
              <span className="mb-1">{link.icon}</span>
              <span className="text-xs font-medium leading-tight">{link.shortLabel}</span>
            </Link>
          ))}
          
          {/* Botão Voltar ao Site */}
          <Link
            href="/"
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 flex-1 mx-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-opacity-50"
          >
            <FiHome size={20} className="mb-1" />
            <span className="text-xs font-medium leading-tight">Site</span>
          </Link>
          {/* Botão Logout */}
          <button
            onClick={async () => {
              await logout();
              router.replace('/login');
            }}
            className="flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 flex-1 mx-1 text-red-600 hover:text-red-800 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50"
          >
            <FiLogOut size={20} className="mb-1" />
            <span className="text-xs font-medium leading-tight">Sair</span>
          </button>
        </div>
      </nav>
    </div>
  );
}