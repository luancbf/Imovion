'use client';

import { useState } from 'react';
import { FiHome, FiSearch, FiGrid, FiList } from 'react-icons/fi';
import ImovelCardCadastro from './ImovelCardCadastro';
import type { Imovel } from '@/types/Imovel';

interface ListaImoveisProps {
  imoveis: Imovel[];
  carregando: boolean;
  onDelete: (id: string) => void;
  onEdit: (imovel: Imovel) => void;
  patrocinadores: { id: string; nome: string }[];
  cidadesComBairros: Record<string, string[]>;
}

export default function ListaImoveis({
  imoveis,
  carregando,
  onDelete,
  onEdit,
  patrocinadores,
  cidadesComBairros
}: ListaImoveisProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [busca, setBusca] = useState('');

  const imoveisFiltrados = imoveis.filter(imovel => {
    const buscarEm = busca.toLowerCase();
    return (
      (imovel.tipoimovel || '').toLowerCase().includes(buscarEm) ||
      (imovel.enderecodetalhado || '').toLowerCase().includes(buscarEm) ||
      (imovel.cidade || '').toLowerCase().includes(buscarEm) ||
      (imovel.bairro || '').toLowerCase().includes(buscarEm) ||
      (imovel.descricao || '').toLowerCase().includes(buscarEm) ||
      (imovel.tiponegocio || '').toLowerCase().includes(buscarEm) ||
      (imovel.setornegocio || '').toLowerCase().includes(buscarEm)
    );
  });

  const stats = {
    total: imoveis.length,
    residencial: imoveis.filter(i => i.tiponegocio === 'Residencial').length,
    comercial: imoveis.filter(i => i.tiponegocio === 'Comercial').length,
    rural: imoveis.filter(i => i.tiponegocio === 'Rural').length,
    venda: imoveis.filter(i => i.setornegocio === 'Venda').length,
    aluguel: imoveis.filter(i => i.setornegocio === 'Aluguel').length,
    resultados: imoveisFiltrados.length
  };

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
      {/* Header da Seção */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiHome className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              🏠 Imóveis Cadastrados
            </h2>
            <p className="text-blue-600 text-sm">
              {imoveis.length === 0 
                ? 'Nenhum imóvel encontrado' 
                : `${imoveis.length} ${imoveis.length === 1 ? 'imóvel' : 'imóveis'} no sistema`
              }
              {busca && imoveisFiltrados.length !== imoveis.length && 
                ` (${imoveisFiltrados.length} na busca)`
              }
            </p>
          </div>
        </div>
        
        {/* Campo de Busca e Controles */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Campo de Busca */}
          <div className="relative w-full sm:w-80">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por tipo, endereço, cidade, bairro..."
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

          {/* Toggle View Mode */}
          <div className="flex bg-blue-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-600 hover:bg-blue-200'
              }`}
              title="Visualização em grid"
            >
              <FiGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-blue-600 hover:bg-blue-200'
              }`}
              title="Visualização em lista"
            >
              <FiList size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Estatísticas Rápidas */}
      {imoveis.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="text-blue-600 text-sm font-medium">Total</div>
            <div className="text-blue-900 text-2xl font-bold">{stats.total}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <div className="text-green-600 text-sm font-medium">🏠 Residencial</div>
            <div className="text-green-900 text-2xl font-bold">{stats.residencial}</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
            <div className="text-purple-600 text-sm font-medium">🏪 Comercial</div>
            <div className="text-purple-900 text-2xl font-bold">{stats.comercial}</div>
          </div>
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-200">
            <div className="text-orange-600 text-sm font-medium">🌾 Rural</div>
            <div className="text-orange-900 text-2xl font-bold">{stats.rural}</div>
          </div>
          <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
            <div className="text-emerald-600 text-sm font-medium">💰 Venda</div>
            <div className="text-emerald-900 text-2xl font-bold">{stats.venda}</div>
          </div>
          <div className="bg-teal-50 p-4 rounded-xl border border-teal-200">
            <div className="text-teal-600 text-sm font-medium">🏠 Aluguel</div>
            <div className="text-teal-900 text-2xl font-bold">{stats.aluguel}</div>
          </div>
          <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
            <div className="text-indigo-600 text-sm font-medium">📊 Resultados</div>
            <div className="text-indigo-900 text-2xl font-bold">{stats.resultados}</div>
          </div>
        </div>
      )}

      {/* Estados da Lista */}
      {carregando ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando imóveis...</span>
        </div>
      ) : imoveisFiltrados.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-2xl border border-blue-200">
          <FiSearch className="mx-auto text-blue-400 mb-4" size={48} />
          <h3 className="text-blue-700 font-semibold text-lg mb-2">
            {busca ? '🔍 Nenhum resultado encontrado' : '🏠 Nenhum imóvel cadastrado'}
          </h3>
          <p className="text-blue-600 mb-4">
            {busca 
              ? `Não encontramos imóveis com "${busca}". Tente outros termos.`
              : 'Comece cadastrando seu primeiro imóvel usando o formulário acima.'
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
        /* Grid/Lista de Imóveis */
        <div className={`${
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
            : 'space-y-4'
        }`}>
          {imoveisFiltrados.map((imovel, index) => (
            <div 
              key={imovel.id}
              className={`${viewMode === 'list' ? 'border border-blue-200 rounded-xl' : ''}`}
              style={{ 
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.6s ease-out forwards'
              }}
            >
              <ImovelCardCadastro
                imovel={{
                  ...imovel,
                  tipoImovel: imovel.tipoimovel,
                  enderecoDetalhado: imovel.enderecodetalhado,
                  tipoNegocio: imovel.tiponegocio,
                  setorNegocio: imovel.setornegocio,
                  dataCadastro: imovel.datacadastro,
                  itens: Object.fromEntries(
                    Object.entries(imovel.itens ?? {}).map(([k, v]) => [k, Number(v)])
                  )
                }}
                onDelete={onDelete}
                onEdit={onEdit}
                cidadesComBairros={cidadesComBairros}
                patrocinadores={patrocinadores}
                viewMode={viewMode}
              />
            </div>
          ))}
        </div>
      )}

      {/* Rodapé com Informações */}
      {imoveisFiltrados.length > 0 && (
        <div className="mt-6 pt-6 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              Mostrando {imoveisFiltrados.length} de {imoveis.length} imóveis
            </span>
            {busca && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                Filtrado por: &quot;{busca}&quot;
              </span>
            )}
          </div>
          
          <div className="text-right">
            <p className="text-xs text-gray-500">
              💡 Clique em &quot;Editar&quot; para carregar no formulário acima
            </p>
          </div>
        </div>
      )}

      {/* CSS para animações */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}