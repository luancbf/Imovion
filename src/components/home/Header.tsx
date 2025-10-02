'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import { FiUser, FiLogOut, FiPlus } from 'react-icons/fi';
import { supabase } from '@/lib/supabase'

type UserProfile = {
  email: string;
  role: string;
  nome?: string;
};

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      
      if (data?.user?.id && data?.user?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, nome, email")
          .eq("id", data.user.id)
          .single();

        if (profile?.role) {
          setUser({
            email: profile.email || data.user.email,
            role: profile.role,
            nome: profile.nome || "",
          });
        } else {
          setUser({
            email: data.user.email,
            role: "user",
            nome: "",
          });
        }
      } else {
        setUser(null);
      }
    };

    fetchUser();

    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        return;
      }
      
      if (session?.user?.id && session?.user?.email) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, nome, email")
          .eq("id", session.user.id)
          .single();

        if (profile?.role) {
          setUser({
            email: profile.email || session.user.email,
            role: profile.role,
            nome: profile.nome || "",
          });
        } else {
          setUser({
            email: session.user.email,
            role: "user",
            nome: "",
          });
        }
      }
    });

    return () => {
      listener?.subscription?.unsubscribe();
    };
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleLogout = () => {
    setIsLoggingOut(true);
    setMenuOpen(false);
    setUser(null);
    
    // Logout do Supabase (não esperar resposta)
    supabase.auth.signOut().catch(console.error);
    
    // Limpar tudo imediatamente
    localStorage.clear();
    sessionStorage.clear();
    
    // Limpar todos os cookies de forma mais agressiva
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      // Limpar em todos os paths e domínios possíveis
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
    }
    
    // Forçar reload total da página
    setTimeout(() => {
      window.location.href = '/';
    }, 100);
  };

  // Função para direcionar corretamente conforme o tipo de usuário
  const handlePerfilClick = () => {
    // Debug removido
    
    if (user?.role === "admin") {
      router.push("/admin/cadastrar-imovel");
    } else {
      router.push("/painel-usuario");
    }
  };

  return (
    <header className="w-full bg-white shadow-md">
      <nav className={`flex items-center max-w-6xl mx-auto p-4 ${!user ? 'justify-center' : 'justify-between'}`}>
        <Link href="/" className="flex items-center">
          <Image
            src="/imovion.webp"
            alt="Imovion Logo"
            width={320}
            height={80}
            priority
            className="h-7 sm:h-11 w-auto"
          />
        </Link>
        {user && (
            <div className="relative" ref={menuRef}>
              {/* Botão do usuário com ícone e nome */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-3 px-4 py-2 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
              >
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <FiUser className="text-white" size={16} />
                </div>
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-sm text-blue-700 font-medium">
                    Olá, {user.nome || user.email?.split('@')[0] || 'Usuário'}
                  </span>
                </div>
                <div className="sm:hidden">
                  <span className="text-sm text-blue-700 font-medium">
                    {user.nome || user.email?.split('@')[0] || 'Usuário'}
                  </span>
                </div>
              </button>

              {/* Menu dropdown */}
              {menuOpen && (
                <div className="absolute right-0 top-full mt-2 z-50 bg-white shadow-xl rounded-xl border border-gray-200 min-w-[200px] overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                        <FiUser className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {user.nome || user.email?.split('@')[0]}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="p-2">
                    <button
                      onClick={() => {
                        handlePerfilClick();
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <FiUser size={18} />
                      <span className="font-medium">Meu Perfil</span>
                    </button>
                    
                    {user.role !== 'admin' && (
                      <Link
                        href="/anunciar"
                        onClick={() => setMenuOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <FiPlus size={18} />
                        <span className="font-medium">Anunciar</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                        isLoggingOut 
                          ? 'text-gray-400 bg-gray-50 cursor-not-allowed' 
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                    >
                      {isLoggingOut ? (
                        <div className="w-[18px] h-[18px] border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                      ) : (
                        <FiLogOut size={18} />
                      )}
                      <span className="font-medium">
                        {isLoggingOut ? 'Saindo...' : 'Sair'}
                      </span>
                    </button>
                  </nav>
                </div>
              )}
            </div>
        )}
      </nav>
    </header>
  );
}