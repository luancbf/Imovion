"use client";

import Link from "next/link";
import { FiPlus } from "react-icons/fi";
import type { User } from '@supabase/supabase-js';

interface DashboardHeaderProps {
  user: User;
}

export default function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">
            Olá, {user?.user_metadata?.nome || "Usuário"}! 👋
          </h1>
          <p className="text-blue-100 text-lg">
            Bem-vindo ao seu painel de controle
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link
            href="/painel-usuario/cadastrar-imovel"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <FiPlus size={20} />
            Anunciar Imóvel
          </Link>
        </div>
      </div>
    </div>
  );
}