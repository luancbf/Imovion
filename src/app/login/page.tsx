"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const router = useRouter();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const supabase = createBrowserClient(supabaseUrl, supabaseKey);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setCarregando(true);
    setErro("");
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });
    
    setCarregando(false);
    
    if (error || !data.user) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
        <div className="mb-6 flex flex-col items-center">
          <Image
              src="/imovion.png"
              alt="Imovion Logo"
              width={1000}
              height={1000}
              className="w-80 mb-5 object-cover"
            />
          <h1 className="font-poppins text-2xl font-extrabold text-blue-700 mb-1">Login</h1>
          <span className="font-inter text-gray-500 text-sm">Acesse sua conta para gerenciar seus imóveis</span>
        </div>
        <form onSubmit={handleLogin} className="font-inter w-full flex flex-col gap-4">
          <input
            type="email"
            placeholder="E-mail"
            className="border border-blue-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Senha"
            className="border border-blue-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 outline-none transition"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
          />
          {erro && <div className="text-red-600 text-sm text-center">{erro}</div>}
          <button
            type="submit"
            className="font-poppins bg-blue-700 hover:bg-blue-800 text-white rounded-lg py-3 font-semibold transition"
            disabled={carregando}
          >
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <div className="font-inter mt-6 text-center text-sm text-gray-600">
          Não tem uma conta?{" "}
          <Link href="/signup" className="text-blue-700 font-semibold hover:underline">
            Criar conta
          </Link>
        </div>
      </div>
    </div>
  );
}