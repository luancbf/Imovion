'use client';

import { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiSearch, FiImage } from 'react-icons/fi';
import { usePatrocinadores } from '@/hooks/cadastrar-patrocinador/usePatrocinadores';
import { Patrocinador } from '@/types/cadastrar-patrocinador';
import Image from "next/image";

interface PatrocinadoresListProps {
  onEdit?: (patrocinador: Patrocinador) => void;
  refreshTrigger?: number;
}

export default function PatrocinadoresList({ onEdit, refreshTrigger }: PatrocinadoresListProps) {
  const { patrocinadores, loading, deletePatrocinador, loadPatrocinadores } = usePatrocinadores();
  const [busca, setBusca] = useState('');
  const [deleting, setDeleting] = useState<string | null>(null);

  // Usar refreshTrigger para recarregar os dados quando necessário
  useEffect(() => {
    if (refreshTrigger !== undefined) {
      loadPatrocinadores();
    }
  }, [refreshTrigger, loadPatrocinadores]);

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir o patrocinador "${nome}"?`)) return;
    
    setDeleting(id);
    try {
      await deletePatrocinador(id);
      alert('Patrocinador excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir patrocinador:', error);
      alert(error instanceof Error ? error.message : 'Erro ao excluir patrocinador');
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (patrocinador: Patrocinador) => {
    onEdit?.(patrocinador);
    // Scroll suave para o formulário
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Filtrar patrocinadores
  const patrocinadoresFiltrados = patrocinadores.filter(p =>
    (p.nome || '').toLowerCase().includes(busca.toLowerCase()) ||
    (p.slug || '').toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
      {/* Header da Seção */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiSearch className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              📋 Patrocinadores Cadastrados
            </h2>
            <p className="text-blue-600 text-sm">
              {patrocinadores.length === 0 
                ? 'Nenhum patrocinador encontrado' 
                : `${patrocinadores.length} ${patrocinadores.length === 1 ? 'patrocinador' : 'patrocinadores'} no sistema`
              }
              {busca && patrocinadoresFiltrados.length !== patrocinadores.length && 
                ` (${patrocinadoresFiltrados.length} na busca)`
              }
            </p>
          </div>
        </div>
        
        {/* Campo de Busca */}
        <div className="relative w-full lg:w-80">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou URL..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 placeholder-gray-500"
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

      {/* Estatísticas Rápidas */}
      {patrocinadores.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="text-blue-600 text-sm font-medium">Total</div>
            <div className="text-blue-900 text-2xl font-bold">{patrocinadores.length}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="text-green-600 text-sm font-medium">Com Banner</div>
            <div className="text-green-900 text-2xl font-bold">
              {patrocinadores.filter(p => p.bannerUrl).length}
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="text-purple-600 text-sm font-medium">Este Mês</div>
            <div className="text-purple-900 text-2xl font-bold">
              {patrocinadores.filter(p => {
                if (!p.criadoEm) return false;
                const created = new Date(p.criadoEm);
                const now = new Date();
                return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="text-orange-600 text-sm font-medium">Resultados</div>
            <div className="text-orange-900 text-2xl font-bold">{patrocinadoresFiltrados.length}</div>
          </div>
        </div>
      )}

      {/* Estados da Lista */}
      {loading && patrocinadores.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando patrocinadores...</span>
        </div>
      ) : patrocinadoresFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-2xl border border-blue-200">
          <FiSearch className="mx-auto text-blue-400 mb-4" size={48} />
          <h3 className="text-blue-700 font-semibold text-lg mb-2">
            {busca ? '🔍 Nenhum resultado encontrado' : '📝 Nenhum patrocinador cadastrado'}
          </h3>
          <p className="text-blue-600 mb-4">
            {busca 
              ? `Não encontramos patrocinadores com "${busca}". Tente outros termos.`
              : 'Comece cadastrando seu primeiro patrocinador usando o formulário acima.'
            }
          </p>
          {busca && (
            <button
              onClick={() => setBusca('')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Limpar Busca
            </button>
          )}
        </div>
      ) : (
        /* Grid de Patrocinadores */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {patrocinadoresFiltrados.map((patrocinador, index) => (
            <div
              key={patrocinador.id}
              className="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 animate-fadeInUp"
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animationFillMode: 'forwards'
              }}
            >
              {/* Cabeçalho do Card */}
              <div className="flex items-start gap-4 mb-4">
                {/* Banner/Avatar */}
                <div className="relative flex-shrink-0">
                  {patrocinador.bannerUrl ? (
                    <div className="relative">
                      <Image
                        src={patrocinador.bannerUrl}
                        alt={`Banner do ${patrocinador.nome}`}
                        width={80}
                        height={60}
                        className="w-20 h-15 object-cover rounded-xl shadow-md border-2 border-blue-100 group-hover:border-blue-200 transition-colors"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-200" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" title="Com banner" />
                    </div>
                  ) : (
                    <div className="w-20 h-15 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-200 group-hover:border-blue-300 transition-colors">
                      <FiImage className="text-blue-400" size={24} />
                    </div>
                  )}
                </div>

                {/* Informações */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-blue-900 text-lg truncate mb-1 group-hover:text-blue-700 transition-colors">
                    {patrocinador.nome}
                  </h3>
                  <p className="text-blue-600 text-sm font-mono bg-blue-50 px-2 py-1 rounded-md inline-block">
                    /{patrocinador.slug}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-gray-500 text-xs">
                      📅 {formatDate(patrocinador.criadoEm)}
                    </span>
                    {patrocinador.atualizadoEm && patrocinador.atualizadoEm !== patrocinador.criadoEm && (
                      <span className="text-blue-500 text-xs" title="Última atualização">
                        ✏️ {formatDate(patrocinador.atualizadoEm)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Tags/Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {patrocinador.bannerUrl && (
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                    🖼️ Com Banner
                  </span>
                )}
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  🔗 URL Personalizada
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="flex gap-2 justify-end pt-4 border-t border-blue-100">
                <button
                  onClick={() => handleEdit(patrocinador)}
                  className="flex items-center gap-2 p-3 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-xl transition-all duration-200 group-hover:shadow-md transform hover:scale-105"
                  title={`Editar ${patrocinador.nome}`}
                >
                  <FiEdit2 size={18} />
                  <span className="text-sm font-medium hidden sm:inline">Editar</span>
                </button>
                
                <button
                  onClick={() => handleDelete(patrocinador.id, patrocinador.nome)}
                  disabled={deleting === patrocinador.id}
                  className="flex items-center gap-2 p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-200 group-hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Rodapé com Informações */}
      {patrocinadoresFiltrados.length > 0 && (
        <div className="mt-6 pt-6 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              Mostrando {patrocinadoresFiltrados.length} de {patrocinadores.length} patrocinadores
            </span>
            {busca && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                Filtrado por: &quot;{busca}&quot;
              </span>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">
              💡 Clique em &quot;Editar&quot; para modificar as informações
            </p>
          </div>
        </div>
      )}
    </section>
  );
}