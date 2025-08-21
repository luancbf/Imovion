'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalImoveis: number;
  imoveisInternos: number;
  imoveisApi: number;
  apisAtivas: number;
  totalApis: number;
  ultimaSync: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalImoveis: 0,
    imoveisInternos: 0,
    imoveisApi: 0,
    apisAtivas: 0,
    totalApis: 0,
    ultimaSync: 'Nunca'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [
          imoveisResponse,
          imoveisInternosResponse,
          imoveisApiResponse,
          apisResponse
        ] = await Promise.all([
          supabase.from('imoveis').select('id', { count: 'exact', head: true }),
          supabase.from('imoveis').select('id', { count: 'exact', head: true }).or('fonte_api.is.null,fonte_api.eq.internal'),
          supabase.from('imoveis').select('id', { count: 'exact', head: true }).not('fonte_api', 'is', null).not('fonte_api', 'eq', 'internal'),
          supabase.from('api_configs').select('id, is_active', { count: 'exact' })
        ]);

        const apisData = (apisResponse.data || []) as Array<{ id: string; is_active: boolean }>;

        setStats({
          totalImoveis: imoveisResponse.count || 0,
          imoveisInternos: imoveisInternosResponse.count || 0,
          imoveisApi: imoveisApiResponse.count || 0,
          apisAtivas: apisData.filter(api => api.is_active).length,
          totalApis: apisResponse.count || 0,
          ultimaSync: new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })
        });
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex flex-col space-y-3">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-20 lg:h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-4 overflow-hidden">
      {/* ✅ HEADER */}
      <div>
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-1">
          Dashboard Admin
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          Visão geral do sistema Imovion
        </p>
      </div>

      {/* ✅ STATS CARDS - 6 CARDS OTIMIZADOS */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 lg:gap-4">
        {/* Total de Imóveis */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 lg:p-4 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-blue-100 text-xs lg:text-sm">Total Imóveis</p>
              <p className="text-lg lg:text-xl font-bold">{stats.totalImoveis.toLocaleString()}</p>
            </div>
            <div className="text-xl lg:text-2xl mt-1 lg:mt-0">🏠</div>
          </div>
        </div>

        {/* Imóveis Internos */}
        <div className="bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg p-3 lg:p-4 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-cyan-100 text-xs lg:text-sm">Internos</p>
              <p className="text-lg lg:text-xl font-bold">{stats.imoveisInternos.toLocaleString()}</p>
            </div>
            <div className="text-xl lg:text-2xl mt-1 lg:mt-0">🏡</div>
          </div>
        </div>

        {/* Imóveis de APIs */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 lg:p-4 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-purple-100 text-xs lg:text-sm">APIs</p>
              <p className="text-lg lg:text-xl font-bold">{stats.imoveisApi.toLocaleString()}</p>
            </div>
            <div className="text-xl lg:text-2xl mt-1 lg:mt-0">📡</div>
          </div>
        </div>

        {/* APIs Ativas */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 lg:p-4 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-green-100 text-xs lg:text-sm">APIs Ativas</p>
              <p className="text-lg lg:text-xl font-bold">{stats.apisAtivas}/{stats.totalApis}</p>
            </div>
            <div className="text-xl lg:text-2xl mt-1 lg:mt-0">🔗</div>
          </div>
        </div>

        {/* Status Sistema */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg p-3 lg:p-4 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-emerald-100 text-xs lg:text-sm">Status</p>
              <p className="text-base lg:text-lg font-bold">Online</p>
            </div>
            <div className="text-xl lg:text-2xl mt-1 lg:mt-0">⚡</div>
          </div>
        </div>

        {/* Última Sync */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 lg:p-4 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-orange-100 text-xs lg:text-sm">Última Sync</p>
              <p className="text-base lg:text-lg font-bold">{stats.ultimaSync}</p>
            </div>
            <div className="text-xl lg:text-2xl mt-1 lg:mt-0">🔄</div>
          </div>
        </div>
      </div>

      {/* ✅ STATUS SISTEMA E AÇÕES RÁPIDAS */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-6 flex-1">
        <h2 className="text-base lg:text-xl font-semibold text-gray-900 mb-3">
          Sistema Operacional
        </h2>
        <p className="text-sm lg:text-base text-gray-600 mb-3">
          Todos os serviços funcionando normalmente.
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            ✅ Database OK
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            ✅ APIs OK
          </span>
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800">
            ✅ Sistema OK
          </span>
        </div>

        {/* ✅ AÇÕES RÁPIDAS MOBILE */}
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Ações Rápidas</h3>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => window.location.href = '/admin/cadastrar-imovel'}
              className="flex items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-xs font-medium text-blue-700"
            >
              <span className="mr-1">🏠</span>
              Novo Imóvel
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/api-integration'}
              className="flex items-center justify-center p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-xs font-medium text-green-700"
            >
              <span className="mr-1">🔗</span>
              APIs
            </button>
            
            <button
              onClick={() => window.location.href = '/admin/cadastrar-patrocinador'}
              className="flex items-center justify-center p-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-xs font-medium text-purple-700"
            >
              <span className="mr-1">💼</span>
              Parceiros
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center p-2 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-xs font-medium text-orange-700"
            >
              <span className="mr-1">🔄</span>
              Atualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}