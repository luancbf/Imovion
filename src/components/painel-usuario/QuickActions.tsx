"use client";

import Link from "next/link";
import { FiPlus, FiHome, FiUser } from "react-icons/fi";

export default function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Link
        href="/painel-usuario/cadastrar-imovel"
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center transition-colors">
            <FiPlus className="text-blue-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Cadastrar Imóvel</h3>
            <p className="text-gray-600 text-sm">Anuncie um novo imóvel</p>
          </div>
        </div>
      </Link>

      <Link
        href="/painel-usuario/meus-imoveis"
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 group-hover:bg-green-200 rounded-xl flex items-center justify-center transition-colors">
            <FiHome className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Meus Imóveis</h3>
            <p className="text-gray-600 text-sm">Gerenciar anúncios</p>
          </div>
        </div>
      </Link>

      <Link
        href="/painel-usuario/perfil"
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-200 hover:scale-105 group"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 group-hover:bg-purple-200 rounded-xl flex items-center justify-center transition-colors">
            <FiUser className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Meu Perfil</h3>
            <p className="text-gray-600 text-sm">Editar informações</p>
          </div>
        </div>
      </Link>
    </div>
  );
}