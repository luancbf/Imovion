'use client';

import { useState } from 'react';
import { FiUsers, FiSearch, FiFilter, FiAward, FiShield, FiTrendingUp, FiUserCheck, FiAlertTriangle, FiHome, FiMapPin, FiGrid, FiLayers } from 'react-icons/fi';
import { useGerenciamentoUsuarios } from '@/hooks/useGerenciamentoUsuarios';
import { FiltrosUsuarios } from '@/types/usuarios';
import GerenciamentoUsuariosList from '../../../components/admin/GerenciamentoUsuariosList';

export default function UsuariosPage() {
  const { obterEstatisticas, loading, error } = useGerenciamentoUsuarios();
  const [filtros, setFiltros] = useState<FiltrosUsuarios>({
    busca: '',
    categoria: 'todos',
    creci: 'todos',
    plano: 'todos',
    status: 'todos',
    ordenar_por: 'data_cadastro',
    ordem: 'desc'
  });

  const stats = obterEstatisticas();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FiUsers className="text-blue-600" />
              Gerenciar Usuarios
              {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>}
            </h1>
            <p className="text-gray-500 mt-1">
              Administre os usuarios cadastrados na plataforma
            </p>
            
            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <FiAlertTriangle className="text-red-500 mt-0.5" />
                <div>
                  <p className="text-red-700 font-medium">Erro ao carregar dados</p>
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Estatisticas - Primeira Fileira */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FiUsers className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Corretores</p>
              <p className="text-2xl font-bold text-blue-600">{stats.corretores}</p>
            </div>
            <FiAward className="text-blue-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Imobiliarias</p>
              <p className="text-2xl font-bold text-purple-600">{stats.imobiliarias || 0}</p>
            </div>
            <FiShield className="text-purple-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Usuarios Comum</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.proprietarios || 0}</p>
            </div>
            <FiUsers className="text-emerald-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Receita Mensal</p>
              <p className="text-2xl font-bold text-green-600">R$ {stats.receita_mensal.toLocaleString()}</p>
            </div>
            <FiTrendingUp className="text-green-600" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Novos este mes</p>
              <p className="text-2xl font-bold text-blue-600">{stats.novos_este_mes}</p>
            </div>
            <FiUserCheck className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      {/* Estatisticas por Plano - Segunda Fileira */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Plano Comum */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Plano Comum</p>
              <p className="text-2xl font-bold text-gray-800">{stats.plano_comum || 0}</p>
              <p className="text-xs text-gray-500 mt-1">R$ 50/imovel</p>
            </div>
            <FiHome className="text-gray-600" size={24} />
          </div>
        </div>

        {/* Plano 5 Imoveis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-500">Plano 5 Imoveis</p>
              <p className="text-2xl font-bold text-blue-600">{stats.plano_5_imoveis || 0}</p>
              <p className="text-xs text-blue-500 mt-1">R$ 150/mes</p>
            </div>
            <FiMapPin className="text-blue-600" size={24} />
          </div>
        </div>

        {/* Plano 30 Imoveis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-500">Plano 30 Imoveis</p>
              <p className="text-2xl font-bold text-green-600">{stats.plano_30_imoveis || 0}</p>
              <p className="text-xs text-green-500 mt-1">R$ 300/mes</p>
            </div>
            <FiAward className="text-green-600" size={24} />
          </div>
        </div>

        {/* Plano 50 Imoveis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-500">Plano 50 Imoveis</p>
              <p className="text-2xl font-bold text-orange-600">{stats.plano_50_imoveis || 0}</p>
              <p className="text-xs text-orange-500 mt-1">R$ 450/mes</p>
            </div>
            <FiGrid className="text-orange-600" size={24} />
          </div>
        </div>

        {/* Plano 100 Imoveis */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-500">Plano 100 Imoveis</p>
              <p className="text-2xl font-bold text-purple-600">{stats.plano_100_imoveis || 0}</p>
              <p className="text-xs text-purple-500 mt-1">R$ 700/mes</p>
            </div>
            <FiLayers className="text-purple-600" size={24} />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filtros e Ordenacao</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Buscar por nome, email, telefone ou CRECI..."
              value={filtros.busca}
              onChange={(e) => setFiltros(prev => ({ ...prev, busca: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <select
            value={filtros.categoria}
            onChange={(e) => setFiltros(prev => ({ ...prev, categoria: e.target.value as 'todos' | 'proprietario' | 'corretor' | 'imobiliaria' | 'proprietario_com_plano' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todas as categorias</option>
            <option value="proprietario">Proprietário</option>
            <option value="corretor">Corretor</option>
            <option value="imobiliaria">Imobiliaria</option>
            <option value="proprietario_com_plano">Proprietario com Plano</option>
          </select>

          <select
            value={filtros.creci}
            onChange={(e) => setFiltros(prev => ({ ...prev, creci: e.target.value as 'todos' | 'com' | 'sem' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">CRECI - Todos</option>
            <option value="com">Com CRECI</option>
            <option value="sem">Sem CRECI</option>
          </select>

          <select
            value={filtros.plano}
            onChange={(e) => setFiltros(prev => ({ ...prev, plano: e.target.value as 'todos' | 'mensal' | 'por_anuncio' | 'sem_plano' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="todos">Todos os planos</option>
            <option value="mensal">Plano Mensal</option>
            <option value="por_anuncio">Por Anuncio</option>
            <option value="sem_plano">Sem Plano</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <select
            value={filtros.ordenar_por}
            onChange={(e) => setFiltros(prev => ({ ...prev, ordenar_por: e.target.value as 'nome' | 'data_cadastro' | 'ultimo_acesso' | 'total_imoveis' | 'receita' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="nome">Ordenar por Nome</option>
            <option value="data_cadastro">Data de Cadastro</option>
            <option value="total_imoveis">Quantidade de Imoveis</option>
            <option value="receita">Receita Total</option>
          </select>

          <select
            value={filtros.ordem}
            onChange={(e) => setFiltros(prev => ({ ...prev, ordem: e.target.value as 'asc' | 'desc' }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </select>
        </div>
      </div>

      <GerenciamentoUsuariosList filtros={filtros} />
    </div>
  );
}
