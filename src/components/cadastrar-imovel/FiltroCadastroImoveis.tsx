'use client';

import { useState, useEffect } from 'react';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';

interface FiltroCadastroImoveisProps {
  patrocinadores: { id: string; nome: string }[];
  onFiltroChange: (filtros: {
    tipoNegocio: string;
    setorNegocio: string;
    patrocinador: string;
    codigoImovel: string; // <-- Adicione aqui
  }) => void;
}

export default function FiltroCadastroImoveis({
  patrocinadores,
  onFiltroChange
}: FiltroCadastroImoveisProps) {
  const [filtros, setFiltros] = useState({
    tipoNegocio: '',
    setorNegocio: '',
    patrocinador: '',
    codigoImovel: '', // <-- Adicione aqui
  });

  useEffect(() => {
    onFiltroChange(filtros);
  }, [filtros, onFiltroChange]);

  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
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
      patrocinador: '',
      codigoImovel: '', // <-- Adicione aqui
    });
  };

  const hasActiveFilters = filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador || filtros.codigoImovel;

  return (
    <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
      {/* Header da Seção - MAIS COMPACTO */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FiFilter className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="font-poppins text-lg sm:text-xl font-bold text-blue-900">
              🔍 Filtros de Busca
            </h2>
          </div>
        </div>

        {/* Badge de Filtros Ativos */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-sm">
            <FiSearch size={14} />
            <span className="font-medium">
              {Object.values(filtros).filter(v => v).length} ativo(s)
            </span>
          </div>
        )}
      </div>

      {/* Formulário de Filtros - ESPAÇAMENTO REDUZIDO */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Filtro Setor */}
          <div className="space-y-2">
            <label className="font-poppins block text-sm font-semibold text-blue-900">
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
            <label className="font-poppins block text-sm font-semibold text-blue-900">
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
            <label className="font-poppins block text-sm font-semibold text-blue-900">
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

          {/* Filtro Código do Imóvel */}
          <div className="space-y-2">
            <label className="font-poppins block text-sm font-semibold text-blue-900">
              Código do Imóvel
            </label>
            <input
              type="text"
              name="codigoImovel"
              value={filtros.codigoImovel}
              onChange={handleFiltroChange}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900"
              placeholder="Buscar pelo código"
              autoComplete="off"
            />
          </div>
        </div>

        {/* Seção de Ações - MAIS COMPACTA */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-blue-100">
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