"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Redirecionar se já estiver logado (qualquer usuário)
  useEffect(() => {
    if (!loading && user) {
      console.log("Usuário já logado, redirecionando...", user.email);
      router.push("/admin");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
        return;
      }

      // ✅ SIMPLIFICADO: Qualquer login válido é aceito
      if (data.user) {
        console.log("Login bem-sucedido, redirecionando...", data.user.email);
        router.push("/admin");
      } else {
        setError("Erro no login. Tente novamente.");
      }
    } catch (error) {
      console.error("Erro no login:", error);
      setError("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <Image
            src="/imovion.png"
            alt="Imovion Logo"
            width={320}
            height={80}
            className="w-80 mb-5 object-cover"
            priority
          />
          <h1 className="font-poppins text-2xl font-extrabold text-blue-700 mb-1">
            Login
          </h1>
          <span className="font-inter text-gray-500 text-sm">
            Acesse sua conta para gerenciar seus imóveis
          </span>
        </div>

        <form
          onSubmit={handleLogin}
          className="font-inter w-full flex flex-col gap-4"
        >
          <input
            type="email"
            placeholder="E-mail"
            className="border border-blue-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            autoComplete="email"
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Senha"
            className="border border-blue-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            disabled={isLoading}
          />

          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="font-poppins bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-3 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}