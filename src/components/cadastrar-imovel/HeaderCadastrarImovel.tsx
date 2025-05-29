'use client';

import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';

interface HeaderCadastrarImovelProps {
  onHome: () => void;
}

export default function HeaderCadastrarImovel({ onHome }: HeaderCadastrarImovelProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur shadow-md flex justify-between items-center px-6 py-4 mb-6">
      <h1 className="font-poppins text-2xl md:text-4xl font-extrabold text-blue-800 tracking-tight">
        Cadastrar Imóvel
      </h1>
      <div className="flex gap-3">
        <button
          onClick={onHome}
          className="font-poppins text-sm bg-gradient-to-r from-blue-600 to-blue-400 text-white px-5 py-2 rounded-lg shadow hover:from-blue-700 hover:to-blue-500 transition font-semibold cursor-pointer"
        >
          Página Inicial
        </button>
        <button
          onClick={() => {
            signOut(auth);
            localStorage.removeItem('logado');
            router.push('/login');
          }}
          className="font-poppins text-sm bg-gradient-to-r from-red-600 to-red-400 text-white px-5 py-2 rounded-lg shadow hover:from-red-700 hover:to-red-500 transition font-semibold cursor-pointer"
        >
          Sair
        </button>
      </div>
    </header>
  );
}