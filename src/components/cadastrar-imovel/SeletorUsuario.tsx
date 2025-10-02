"use client";

import { useState, useMemo } from "react";
import { FiUser, FiSearch, FiUsers } from "react-icons/fi";
import type { UsuarioFormulario } from "@/types/formularios";
import type { CategoriaUsuario } from "@/types/usuarios";

interface SeletorUsuarioProps {
  usuarios: UsuarioFormulario[];
  value?: string;
  onChange: (usuarioId: string) => void;
  placeholder?: string;
  className?: string;
}

const CATEGORIA_LABELS: Record<CategoriaUsuario, string> = {
  proprietario: "Proprietário",
  corretor: "Corretor", 
  imobiliaria: "Imobiliária",
  proprietario_com_plano: "Proprietário Premium"
};

const CATEGORIA_COLORS: Record<CategoriaUsuario, string> = {
  proprietario: "bg-gray-100 text-gray-700",
  corretor: "bg-blue-100 text-blue-700",
  imobiliaria: "bg-purple-100 text-purple-700", 
  proprietario_com_plano: "bg-green-100 text-green-700"
};

export default function SeletorUsuario({ 
  usuarios, 
  value, 
  onChange, 
  placeholder = "Selecione um usuário",
  className = ""
}: SeletorUsuarioProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState<CategoriaUsuario | "todos">("todos");

  const usuarioSelecionado = usuarios.find(u => u.id === value);

  const usuariosFiltrados = useMemo(() => {
    let resultado = usuarios;

    // Filtrar por categoria
    if (categoriaFiltro !== "todos") {
      resultado = resultado.filter(u => u.categoria === categoriaFiltro);
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const termo = searchTerm.toLowerCase();
      resultado = resultado.filter(u => 
        u.nome.toLowerCase().includes(termo) ||
        u.sobrenome.toLowerCase().includes(termo) ||
        u.email.toLowerCase().includes(termo) ||
        (u.creci && u.creci.toLowerCase().includes(termo))
      );
    }

    return resultado;
  }, [usuarios, categoriaFiltro, searchTerm]);

  const handleSelect = (usuario: UsuarioFormulario) => {
    onChange(usuario.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const renderUsuarioInfo = (usuario: UsuarioFormulario) => {
    const nomeCompleto = `${usuario.nome} ${usuario.sobrenome}`.trim();
    const mostrarCreci = usuario.categoria === 'corretor' || usuario.categoria === 'imobiliaria';
    
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <FiUser className="text-blue-600" size={18} />
          </div>
          <div>
            <div className="font-medium text-gray-900">{nomeCompleto}</div>
            <div className="text-sm text-gray-500">{usuario.email}</div>
            {mostrarCreci && usuario.creci && (
              <div className="text-xs text-gray-400">CRECI: {usuario.creci}</div>
            )}
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${CATEGORIA_COLORS[usuario.categoria]}`}>
          {CATEGORIA_LABELS[usuario.categoria]}
        </span>
      </div>
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Campo de seleção */}
      <div 
        className="w-full p-3 border border-gray-300 rounded-lg bg-white cursor-pointer hover:border-blue-400 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {usuarioSelecionado ? (
          renderUsuarioInfo(usuarioSelecionado)
        ) : (
          <div className="flex items-center gap-2 text-gray-500">
            <FiUsers size={18} />
            <span>{placeholder}</span>
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Header com filtros */}
          <div className="p-4 border-b border-gray-200">
            {/* Campo de busca */}
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por nome, email ou CRECI..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filtro por categoria */}
            <select
              value={categoriaFiltro}
              onChange={(e) => setCategoriaFiltro(e.target.value as CategoriaUsuario | "todos")}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todas as categorias</option>
              <option value="proprietario">Proprietário</option>
              <option value="corretor">Corretor</option>
              <option value="imobiliaria">Imobiliária</option>
              <option value="proprietario_com_plano">Proprietário</option>
            </select>
          </div>

          {/* Lista de usuários */}
          <div className="max-h-64 overflow-y-auto">
            {usuariosFiltrados.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <FiUsers size={24} className="mx-auto mb-2 opacity-50" />
                <p>Nenhum usuário encontrado</p>
              </div>
            ) : (
              usuariosFiltrados.map(usuario => (
                <div
                  key={usuario.id}
                  className="p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSelect(usuario)}
                >
                  {renderUsuarioInfo(usuario)}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay para fechar */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}