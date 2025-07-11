'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';

interface FiltroCadastroImoveisProps {
  patrocinadores: { id: string; nome: string }[];
  onFiltroChange: (filtros: {
    tipoNegocio: string;
    setorNegocio: string;
    patrocinador: string;
  }) => void;
}

export default function FiltroCadastroImoveis({
  patrocinadores,
  onFiltroChange
}: FiltroCadastroImoveisProps) {
  const [filtros, setFiltros] = useState({
    tipoNegocio: '',
    setorNegocio: '',
    patrocinador: ''
  });

  useEffect(() => {
    onFiltroChange(filtros);
  }, [filtros, onFiltroChange]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      tipoNegocio: '',
      setorNegocio: '',
      patrocinador: ''
    });
  };

  const hasActiveFilters = filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador;

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
      {/* Header da Seção */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiFilter className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-blue-900">
              🔍 Filtros de Busca
            </h2>
            <p className="text-blue-600 text-sm">
              Refine sua busca por imóveis
            </p>
          </div>
        </div>

        {/* Badge de Filtros Ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-2 rounded-xl">
            <FiSearch size={16} />
            <span className="text-sm font-medium">
              {Object.values(filtros).filter(v => v).length} filtro(s) ativo(s)
            </span>
          </div>
        )}
      </div>

      {/* Formulário de Filtros */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Filtro Setor */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-blue-900">
              Setor do Imóvel
            </label>
            <select
              name="tipoNegocio"
              value={filtros.tipoNegocio}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            >
              <option value="">🏢 Todos os setores</option>
              <option value="Residencial">🏠 Residencial</option>
              <option value="Comercial">🏪 Comercial</option>
              <option value="Rural">🌾 Rural</option>
            </select>
          </div>

          {/* Filtro Tipo de Negócio */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-blue-900">
              Tipo de Negócio
            </label>
            <select
              name="setorNegocio"
              value={filtros.setorNegocio}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
            >
              <option value="">💼 Todos os tipos</option>
              <option value="Venda">💰 Venda</option>
              <option value="Aluguel">🏠 Aluguel</option>
            </select>
          </div>

          {/* Filtro Patrocinador */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-blue-900">
              Patrocinador
            </label>
            <select
              name="patrocinador"
              value={filtros.patrocinador}
              onChange={handleFiltroChange}
              disabled={patrocinadores.length === 0}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">🏢 Todos os patrocinadores</option>
              {patrocinadores.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
            {patrocinadores.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Nenhum patrocinador encontrado
              </p>
            )}
          </div>
        </div>

        {/* Seção de Ações */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-blue-100">
          {/* Informações dos Filtros */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {hasActiveFilters ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>Filtros aplicados com sucesso</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span>Mostrando todos os imóveis</span>
              </div>
            )}
          </div>

          {/* Botão Limpar */}
          <button
            type="button"
            onClick={limparFiltros}
            disabled={!hasActiveFilters}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 shadow-lg hover:shadow-xl"
            aria-label="Limpar todos os filtros"
          >
            <FiX size={18} />
            <span>Limpar Filtros</span>
          </button>
        </div>
      </div>
    </section>
  );
}