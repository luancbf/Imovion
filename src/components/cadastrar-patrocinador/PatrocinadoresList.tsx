'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiUser, FiRefreshCw, FiPhone, FiArrowUp } from 'react-icons/fi';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import { Patrocinador } from '@/types/cadastrar-patrocinador';

interface PatrocinadoresListProps {
  onEdit?: (patrocinador: Patrocinador) => void;
  refreshTrigger?: number;
}

export default function PatrocinadoresList({ onEdit, refreshTrigger }: PatrocinadoresListProps) {
  const { patrocinadores, loading, deletePatrocinador, loadPatrocinadores } = usePatrocinadores();
  const [busca, setBusca] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Carregar dados
  useEffect(() => {
    loadPatrocinadores();
  }, [loadPatrocinadores]);

  useEffect(() => {
    if (refreshTrigger !== undefined && refreshTrigger > 0) {
      loadPatrocinadores();
    }
  }, [refreshTrigger, loadPatrocinadores]);

  // Handlers
  const handleRefresh = () => loadPatrocinadores();

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Excluir "${nome}"?`)) return;
    
    setDeleting(id);
    try {
      await deletePatrocinador(id);
      alert('Patrocinador excluído!');
      await loadPatrocinadores();
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Erro ao excluir');
    } finally {
      setDeleting(null);
    }
  };

  // ✅ NOVO: Handler otimizado para edição com feedback visual
  const handleEdit = (patrocinador: Patrocinador) => {
    // Chamar a função de edição do componente pai
    onEdit?.(patrocinador);
    
    // ✅ NOVO: Não fazer scroll aqui, deixar o PatrocinadorForm fazer
    // O scroll será feito pelo useEffect do PatrocinadorForm
  };

  // Filtros
  const patrocinadoresFiltrados = patrocinadores.filter(p =>
    p.nome?.toLowerCase().includes(busca.toLowerCase()) ||
    p.slug?.toLowerCase().includes(busca.toLowerCase()) ||
    p.telefone?.toLowerCase().includes(busca.toLowerCase())
  );

  const formatDate = (date?: string) => 
    date ? new Date(date).toLocaleDateString('pt-BR') : '';

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiSearch className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              Patrocinadores Cadastrados
            </h2>
            <p className="text-blue-600 text-sm">
              {loading ? 'Carregando...' : 
                patrocinadores.length === 0 
                  ? 'Nenhum patrocinador' 
                  : `${patrocinadores.length} ${patrocinadores.length === 1 ? 'patrocinador' : 'patrocinadores'}`
              }
              {busca && patrocinadoresFiltrados.length !== patrocinadores.length && 
                ` (${patrocinadoresFiltrados.length} encontrados)`
              }
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all disabled:opacity-50"
            title="Atualizar lista"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={18} />
            <span className="hidden sm:inline">
              {loading ? 'Carregando...' : 'Atualizar'}
            </span>
          </button>
          
          <div className="relative w-full lg:w-80">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-500"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Estados */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando...</span>
        </div>
      ) : patrocinadoresFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-2xl border border-blue-200">
          <FiSearch className="mx-auto text-blue-400 mb-4" size={48} />
          <h3 className="text-blue-700 font-semibold text-lg mb-2">
            {busca ? 'Nenhum resultado' : 'Nenhum patrocinador'}
          </h3>
          <p className="text-blue-600 mb-4">
            {busca 
              ? `Não encontramos "${busca}".`
              : 'Cadastre seu primeiro patrocinador.'
            }
          </p>
          <button
            onClick={busca ? () => setBusca('') : handleRefresh}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            {busca ? 'Limpar Busca' : 'Tentar Novamente'}
          </button>
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {patrocinadoresFiltrados.map((patrocinador) => (
            <div
              key={patrocinador.id}
              className="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
            >
              {/* Header do Card */}
              <div className="flex items-start gap-4 mb-4">
                {/* Ícone ao invés de imagem */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-200 group-hover:border-blue-300 transition-colors">
                    <FiUser className="text-blue-500" size={28} />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-blue-900 text-lg truncate mb-1 group-hover:text-blue-700 transition-colors">
                    {patrocinador.nome}
                  </h3>
                  
                  {/* Mostrar telefone */}
                  {patrocinador.telefone && (
                    <div className="flex items-center gap-1 text-blue-600 text-sm mb-1">
                      <FiPhone size={14} />
                      <span>{patrocinador.telefone}</span>
                    </div>
                  )}
                  
                  <span className="text-gray-500 text-xs">
                    {formatDate(patrocinador.criadoEm)}
                  </span>
                </div>
              </div>
              
              {/* Ações */}
              <div className="flex gap-2 justify-end pt-4 border-t border-blue-100">
                <button
                  onClick={() => handleEdit(patrocinador)}
                  className="flex items-center gap-2 p-3 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all duration-200 transform hover:scale-105 group/edit"
                  title={`Editar ${patrocinador.nome}`}
                >
                  <div className="relative">
                    <FiEdit2 size={18} />
                    {/* ✅ NOVO: Ícone de seta indicando scroll para cima */}
                    <FiArrowUp 
                      size={10} 
                      className="absolute -top-1 -right-1 text-amber-500 opacity-0 group-hover/edit:opacity-100 transition-opacity animate-bounce" 
                    />
                  </div>
                  <span className="text-sm font-medium hidden sm:inline">Editar</span>
                </button>
                
                <button
                  onClick={() => handleDelete(patrocinador.id, patrocinador.nome)}
                  disabled={deleting === patrocinador.id}
                  className="flex items-center gap-2 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50"
                  title={`Excluir ${patrocinador.nome}`}
                >
                  {deleting === patrocinador.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-600 border-t-transparent" />
                  ) : (
                    <FiTrash2 size={18} />
                  )}
                  <span className="text-sm font-medium hidden sm:inline">
                    {deleting === patrocinador.id ? 'Excluindo...' : 'Excluir'}
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      {patrocinadoresFiltrados.length > 0 && (
        <div className="mt-6 pt-6 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              Mostrando {patrocinadoresFiltrados.length} de {patrocinadores.length} patrocinadores
            </span>
            {busca && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                &quot;{busca}&quot;
              </span>
            )}
          </div>
        </div>
      )}
    </section>
  );
}