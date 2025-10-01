'use client';

import { useState, useEffect, useCallback } from 'react';
import { FiUser, FiMail, FiPhone, FiStar, FiUsers, FiTrendingUp } from 'react-icons/fi';
import { useGerenciamentoUsuarios } from '@/hooks/useGerenciamentoUsuarios';

interface UsuarioElegivel {
  id: string;
  nome: string;
  sobrenome: string;
  email: string;
  telefone?: string;
  categoria: string;
  total_imoveis: number;
  created_at: string;
  pode_ser_patrocinador: boolean;
}

export default function UsuariosPatrocinadores() {
  const { filtrarUsuarios, alterarCategoriaUsuario, loading } = useGerenciamentoUsuarios();
  const [usuariosElegiveis, setUsuariosElegiveis] = useState<UsuarioElegivel[]>([]);
  const [filtro, setFiltro] = useState<'todos' | 'elegiveis' | 'patrocinadores'>('todos');

  const carregarUsuarios = useCallback(() => {
    const todosUsuarios = filtrarUsuarios({
      busca: '',
      categoria: 'todos',
      creci: 'todos',
      plano: 'todos',
      status: 'todos',
      ordenar_por: 'nome',
      ordem: 'asc'
    });
    
    const usuariosProcessados = todosUsuarios.map(usuario => ({
      id: usuario.id,
      nome: usuario.nome,
      sobrenome: usuario.sobrenome,
      email: usuario.email,
      telefone: usuario.telefone,
      categoria: usuario.categoria,
      total_imoveis: usuario.total_imoveis,
      created_at: usuario.created_at,
      pode_ser_patrocinador: usuario.categoria === 'usuario_comum' && usuario.total_imoveis > 0
    }));

    setUsuariosElegiveis(usuariosProcessados);
  }, [filtrarUsuarios]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  const promoverParaPatrocinador = async (usuarioId: string) => {
    if (confirm('Promover este usuário para patrocinador? Ele terá limite de 25 imóveis.')) {
      const sucesso = await alterarCategoriaUsuario(usuarioId, 'proprietario_com_plano');
      if (sucesso) {
        carregarUsuarios();
      }
    }
  };

  const rebaixarPatrocinador = async (usuarioId: string) => {
    if (confirm('Rebaixar este patrocinador para usuário comum? Ele voltará ao limite de 1 imóvel.')) {
      const sucesso = await alterarCategoriaUsuario(usuarioId, 'usuario_comum');
      if (sucesso) {
        carregarUsuarios();
      }
    }
  };

  const usuariosFiltrados = usuariosElegiveis.filter(usuario => {
    switch (filtro) {
      case 'elegiveis':
        return usuario.pode_ser_patrocinador;
      case 'patrocinadores':
        return usuario.categoria === 'proprietario_com_plano';
      default:
        return usuario.categoria === 'usuario_comum' || usuario.categoria === 'proprietario_com_plano';
    }
  });

  const estatisticas = {
    total: usuariosElegiveis.length,
    elegiveis: usuariosElegiveis.filter(u => u.pode_ser_patrocinador).length,
    patrocinadores: usuariosElegiveis.filter(u => u.categoria === 'proprietario_com_plano').length,
    usuariosComuns: usuariosElegiveis.filter(u => u.categoria === 'usuario_comum').length
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FiUsers className="text-blue-600" />
              Gerenciar Patrocinadores
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              Promova usuários comuns para patrocinadores ou gerencie os existentes
            </p>
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <button
              onClick={() => setFiltro('todos')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'todos'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todos ({estatisticas.total})
            </button>
            <button
              onClick={() => setFiltro('elegiveis')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'elegiveis'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Elegíveis ({estatisticas.elegiveis})
            </button>
            <button
              onClick={() => setFiltro('patrocinadores')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtro === 'patrocinadores'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Patrocinadores ({estatisticas.patrocinadores})
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="p-6 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{estatisticas.usuariosComuns}</div>
            <div className="text-sm text-gray-600">Usuários Comuns</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{estatisticas.elegiveis}</div>
            <div className="text-sm text-gray-600">Elegíveis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{estatisticas.patrocinadores}</div>
            <div className="text-sm text-gray-600">Patrocinadores</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{estatisticas.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
        </div>
      </div>

      {/* Lista de Usuários */}
      <div className="p-6">
        {usuariosFiltrados.length === 0 ? (
          <div className="text-center py-8">
            <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Nenhum usuário encontrado</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filtro === 'elegiveis' && 'Não há usuários elegíveis para patrocínio no momento.'}
              {filtro === 'patrocinadores' && 'Não há patrocinadores ativos no momento.'}
              {filtro === 'todos' && 'Não há usuários cadastrados.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {usuariosFiltrados.map((usuario) => (
              <div
                key={usuario.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  {/* Informações do Usuário */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          <FiUser className="text-white text-sm" />
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {usuario.nome} {usuario.sobrenome}
                          </h3>
                          
                          {/* Badge de Status */}
                          {usuario.categoria === 'proprietario_com_plano' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              <FiStar size={10} />
                              Patrocinador
                            </span>
                          )}
                          
                          {usuario.pode_ser_patrocinador && usuario.categoria === 'usuario_comum' && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <FiTrendingUp size={10} />
                              Elegível
                            </span>
                          )}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <FiMail size={14} />
                            <span className="truncate">{usuario.email}</span>
                          </div>
                          
                          {usuario.telefone && (
                            <div className="flex items-center gap-1">
                              <FiPhone size={14} />
                              <span>{usuario.telefone}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{usuario.total_imoveis}</span>
                            <span>imóvel(is)</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    {usuario.categoria === 'usuario_comum' && usuario.pode_ser_patrocinador && (
                      <button
                        onClick={() => promoverParaPatrocinador(usuario.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
                      >
                        <FiStar size={14} />
                        Promover
                      </button>
                    )}
                    
                    {usuario.categoria === 'proprietario_com_plano' && (
                      <button
                        onClick={() => rebaixarPatrocinador(usuario.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                      >
                        Rebaixar
                      </button>
                    )}
                    
                    {usuario.categoria === 'usuario_comum' && !usuario.pode_ser_patrocinador && (
                      <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm">
                        Sem imóveis
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}