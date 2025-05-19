'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import useAuthGuard from '@/hooks/useAuthGuard';

export default function LoginPage() {
  const router = useRouter();
  useAuthGuard();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.push('/cadastrar-imovel');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, senha);
      router.push('/cadastrar-imovel');
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message.includes('auth/invalid-credential')) {
          setErro('Email ou senha inválidos.');
        } else {
          setErro('Erro ao fazer login. Tente novamente.');
        }
      } else {
        setErro('Erro inesperado ao fazer login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-400">
      <div className="bg-white p-12 rounded shadow-md w-full max-w-md">
        <h2 className="text-4xl font-bold mb-8 text-center text-black">Login</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 border rounded text-black"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition cursor-pointer disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          {erro && <p className="text-red-500 text-center">{erro}</p>}
        </form>
      </div>
    </div>
  );
}
