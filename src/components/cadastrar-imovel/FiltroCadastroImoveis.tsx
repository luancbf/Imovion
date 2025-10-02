'use client';

import { useState, useCallback, useEffect, useRef, memo } from 'react';
import { FiFilter, FiX, FiSearch } from 'react-icons/fi';
import type { UsuarioFormulario } from '@/types/formularios';

interface FiltroCadastroImoveisProps {
  usuarios: UsuarioFormulario[];
  onFiltroChange: (filtros: {
    tipoNegocio: string;
    setorNegocio: string;
    usuario: string;
    codigoImovel: string;
  }) => void;
}

function FiltroCadastroImoveis({
  usuarios,
  onFiltroChange
}: FiltroCadastroImoveisProps) {
  const [filtros, setFiltros] = useState({
    tipoNegocio: '',
    setorNegocio: '',
    usuario: '',
    codigoImovel: '',
  });
  
  const isFirstMount = useRef(true);

  // Aplicar filtros quando mudarem (exceto no primeiro mount)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    onFiltroChange(filtros);
  }, [filtros, onFiltroChange]);

  const handleFiltroChange = useCallback((e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFiltros(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const limparFiltros = useCallback(() => {
    const filtrosLimpos = {
      tipoNegocio: '',
      setorNegocio: '',
      usuario: '',
      codigoImovel: '',
    };
    setFiltros(filtrosLimpos);
    onFiltroChange(filtrosLimpos);
  }, [onFiltroChange]);

  const hasActiveFilters = filtros.tipoNegocio || filtros.setorNegocio ||
                           filtros.usuario || filtros.codigoImovel;

  return (
    <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
      {/* Header da Seção */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FiFilter className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="font-poppins text-lg sm:text-xl font-bold text-blue-900">
              Filtros de Busca
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

      {/* Formulário de Filtros */}
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
              Usuário
            </label>
            <select
              name="usuario"
              value={filtros.usuario}
              onChange={handleFiltroChange}
              disabled={usuarios.length === 0}
              className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">Todos os usuários</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} {u.sobrenome}
                  {u.categoria !== 'proprietario' && ` (${u.categoria})`}
                </option>
              ))}
            </select>
            {usuarios.length === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                Nenhum usuário encontrado
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

        {/* Seção de Ações */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-4 border-t border-blue-100">
          {/* Informações dos Filtros */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            {hasActiveFilters ? (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>
                  {Object.values(filtros).filter(v => v).length} filtro(s) ativo(s)
                </span>
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

// Exportar com memo para otimização
export default memo(FiltroCadastroImoveis);