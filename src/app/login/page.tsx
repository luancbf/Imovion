'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Login fixo
    const emailCorreto = 'admin@admin.com';
    const senhaCorreta = '123456';

    if (email === emailCorreto && senha === senhaCorreta) {
      // Salva login no localStorage (pra manter o login ativo)
      localStorage.setItem('logado', 'true');
      router.push('/cadastrar-imovel'); // redireciona para a área que quiser
    } else {
      setErro('Email ou senha incorretos.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
          >
            Entrar
          </button>
          {erro && <p className="text-red-500 text-center">{erro}</p>}
        </form>
      </div>
    </div>
  );
}
