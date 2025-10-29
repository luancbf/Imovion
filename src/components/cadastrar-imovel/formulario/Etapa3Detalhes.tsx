"use client";

import { FiDollarSign, FiUser } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { useState, useEffect, useMemo } from "react";

const CLASSES = {
  input: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500",
  select: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 cursor-pointer",
  textarea: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none",
  dropdown: "absolute z-10 w-full mt-1 bg-white border border-blue-200 rounded-xl shadow-lg max-h-60 overflow-auto",
  dropdownItem: "px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-0",
};

interface UsuarioFormulario {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone?: string;
  creci?: string;
  categoria: string;
}

interface FormularioState {
  valor: string;
  metragem: string;
  descricao: string;
  codigoImovel: string;
  usuario_id: string;
}

interface Etapa3Props {
  formulario: FormularioState;
  usuarios?: UsuarioFormulario[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  isAdmin?: boolean;
}

export default function Etapa3Detalhes({ formulario, usuarios = [], onChange, isAdmin = false }: Etapa3Props) {
  const { user } = useAuth();
  const [userCategoria, setUserCategoria] = useState<string>("");
  const [buscarUsuario, setBuscarUsuario] = useState("");
  const [mostrarDropdown, setMostrarDropdown] = useState(false);
  
  // Buscar usuário selecionado para mostrar informações
  const usuarioSelecionado = usuarios.find(u => u.id === formulario.usuario_id);
  
  // Filtrar usuários baseado na busca
  const usuariosFiltrados = useMemo(() => {
    if (!buscarUsuario.trim()) return usuarios;
    const termo = buscarUsuario.toLowerCase();
    return usuarios.filter(usuario => 
      `${usuario.nome} ${usuario.sobrenome}`.toLowerCase().includes(termo) ||
      usuario.email.toLowerCase().includes(termo) ||
      (usuario.creci && usuario.creci.toLowerCase().includes(termo))
    );
  }, [usuarios, buscarUsuario]);

  const selecionarUsuario = (usuario: UsuarioFormulario) => {
    // Simular evento de mudança para o campo usuario_id
    const event = {
      target: {
        name: 'usuario_id',
        value: usuario.id
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(event);
    setBuscarUsuario(`${usuario.nome} ${usuario.sobrenome}`);
    setMostrarDropdown(false);
  };
  
  // Buscar categoria do usuário no perfil
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('categoria')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserCategoria(profile.categoria || '');
        }
      };
      
      fetchUserProfile();
    }
  }, [user]);
  
  // Verificar se o usuário é corretor ou imobiliária
  const mostrarCodigoImovel = userCategoria === 'corretor' || userCategoria === 'imobiliaria';

  return (
    <div className="space-y-6">
      {/* Seleção de Usuário - Somente para Admin */}
      {isAdmin && (
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2 font-poppins">
            <FiUser size={20} />
            Proprietário do Imóvel
          </h3>
          
          <div className="space-y-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-green-900 font-inter mb-2">
                Buscar Imobiliária ou Corretor
              </label>
              <input
                type="text"
                placeholder="Digite o nome, email ou CRECI..."
                className={CLASSES.input}
                value={buscarUsuario}
                onChange={(e) => {
                  setBuscarUsuario(e.target.value);
                  setMostrarDropdown(true);
                }}
                onFocus={() => setMostrarDropdown(true)}
                onBlur={() => setTimeout(() => setMostrarDropdown(false), 200)}
              />
              
              {mostrarDropdown && usuariosFiltrados.length > 0 && (
                <div className={CLASSES.dropdown}>
                  {usuariosFiltrados.map((usuario) => (
                    <div
                      key={usuario.id}
                      className={CLASSES.dropdownItem}
                      onClick={() => selecionarUsuario(usuario)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-900">
                            {usuario.nome} {usuario.sobrenome}
                          </div>
                          <div className="text-sm text-gray-600">{usuario.email}</div>
                          <div className="text-xs text-blue-600">
                            {usuario.categoria} {usuario.creci && `- CRECI: ${usuario.creci}`}
                          </div>
                        </div>
                        {usuario.telefone && (
                          <div className="text-sm text-gray-500">
                            📱 {usuario.telefone}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Mostrar informações do usuário selecionado */}
            {usuarioSelecionado && (
              <div className="bg-white p-3 rounded-lg border border-green-300">
                <div className="text-sm font-semibold text-green-800 mb-1">
                  ✅ Usuário Selecionado:
                </div>
                <div className="text-gray-900 font-medium">
                  {usuarioSelecionado.nome} {usuarioSelecionado.sobrenome}
                </div>
                <div className="text-sm text-gray-600">
                  📧 {usuarioSelecionado.email}
                </div>
                {usuarioSelecionado.telefone && (
                  <div className="text-sm text-gray-600">
                    📱 {usuarioSelecionado.telefone}
                  </div>
                )}
                {usuarioSelecionado.creci && (
                  <div className="text-sm text-blue-600">
                    🏢 CRECI: {usuarioSelecionado.creci}
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  Categoria: {usuarioSelecionado.categoria}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Detalhes Comerciais */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
      <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2 font-poppins">
        <FiDollarSign size={20} />
        Detalhes Comerciais
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            Valor do Imóvel
          </label>
          <input
            name="valor"
            placeholder="R$ 0,00"
            value={formulario.valor}
            onChange={onChange}
            className={CLASSES.input}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            Metragem
          </label>
          <input
            name="metragem"
            placeholder="0 m²"
            value={formulario.metragem}
            onChange={onChange}
            className={CLASSES.input}
            required
          />
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <label className="block text-sm font-semibold text-purple-900 font-inter">
          Descrição do Imóvel
        </label>
        <textarea
          name="descricao"
          placeholder="Descreva as principais características do imóvel..."
          value={formulario.descricao}
          onChange={onChange}
          className={CLASSES.textarea}
          rows={4}
          required
        />
      </div>
      
      {mostrarCodigoImovel && (
        <div className="mt-6 space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            Código do Imóvel
          </label>
          <input
            name="codigoImovel"
            placeholder="Digite o código do imóvel (opcional)"
            value={formulario.codigoImovel || ""}
            onChange={onChange}
            className={CLASSES.input}
            autoComplete="off"
          />
          <p className="text-xs text-purple-600">Campo opcional para organização interna</p>
        </div>
      )}
      </div>
    </div>
  );
}