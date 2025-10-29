'use client';

import { useState, useEffect, useRef } from 'react';
import { FiSearch, FiUser, FiX } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';

interface Usuario {
  id: string;
  nome: string;
  sobrenome: string;
  categoria: string;
  email?: string;
}

interface UsuarioSearchProps {
  onSelectUser: (user: Usuario | null) => void;
  selectedUser?: Usuario | null;
  disabled?: boolean;
}

export default function UsuarioSearch({ onSelectUser, selectedUser, disabled }: UsuarioSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const CATEGORIA_LABELS = {
    proprietario: 'Proprietário',
    corretor: 'Corretor', 
    imobiliaria: 'Imobiliária'
  };

  const CATEGORIA_COLORS = {
    proprietario: 'bg-blue-100 text-blue-800',
    corretor: 'bg-green-100 text-green-800',
    imobiliaria: 'bg-purple-100 text-purple-800'
  };

  // Buscar usuários quando o termo de busca mudar
  useEffect(() => {
    const searchUsers = async () => {
      if (searchTerm.length < 2) {
        setUsuarios([]);
        return;
      }

      setIsSearching(true);
      
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, nome, sobrenome, categoria, email')
          .or(`nome.ilike.%${searchTerm}%,sobrenome.ilike.%${searchTerm}%`)
          .limit(10);

        if (error) throw error;

        setUsuarios(data || []);
      } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        setUsuarios([]);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fechar results quando clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectUser = (user: Usuario) => {
    onSelectUser(user);
    setSearchTerm('');
    setShowResults(false);
    setUsuarios([]);
  };

  const handleClearSelection = () => {
    onSelectUser(null);
    setSearchTerm('');
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Vincular a Usuário da Plataforma (Opcional)
      </label>
      
      {selectedUser ? (
        // Usuário selecionado
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <FiUser className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedUser.nome} {selectedUser.sobrenome}
              </p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                CATEGORIA_COLORS[selectedUser.categoria as keyof typeof CATEGORIA_COLORS] || 'bg-gray-100 text-gray-800'
              }`}>
                {CATEGORIA_LABELS[selectedUser.categoria as keyof typeof CATEGORIA_LABELS] || selectedUser.categoria}
              </span>
            </div>
            {selectedUser.email && (
              <p className="text-xs text-gray-500 truncate">{selectedUser.email}</p>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleClearSelection}
            disabled={disabled}
            className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      ) : (
        // Campo de busca
        <div ref={searchRef} className="relative">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowResults(true);
              }}
              onFocus={() => setShowResults(true)}
              disabled={disabled}
              placeholder="Digite o nome do usuário para buscar..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
            />
          </div>

          {/* Resultados da busca */}
          {showResults && (searchTerm.length >= 2 || isSearching) && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-500">
                  <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                  Buscando usuários...
                </div>
              ) : usuarios.length > 0 ? (
                <div className="py-1">
                  {usuarios.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectUser(user)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <FiUser className="w-4 h-4 text-blue-600" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.nome} {user.sobrenome}
                          </p>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            CATEGORIA_COLORS[user.categoria as keyof typeof CATEGORIA_COLORS] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {CATEGORIA_LABELS[user.categoria as keyof typeof CATEGORIA_LABELS] || user.categoria}
                          </span>
                        </div>
                        {user.email && (
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : searchTerm.length >= 2 ? (
                <div className="p-4 text-center text-gray-500">
                  Nenhum usuário encontrado
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Digite pelo menos 2 caracteres para buscar
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <p className="text-xs text-gray-500">
        Você pode vincular este patrocinador a um usuário existente da plataforma (corretor, imobiliária ou proprietário) 
        ou deixar em branco para criar um patrocinador independente.
      </p>
    </div>
  );
}