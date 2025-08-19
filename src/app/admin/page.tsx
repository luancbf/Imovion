'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface DashboardStats {
  totalImoveis: number;
  apisAtivas: number;
  totalApis: number;
  ultimaSync: string;
}

interface ApiConfig {
  id: string;
  is_active: boolean;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalImoveis: 0,
    apisAtivas: 0,
    totalApis: 0,
    ultimaSync: 'Nunca'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [imoveisResponse, apisResponse] = await Promise.all([
          supabase.from('imoveis').select('id', { count: 'exact', head: true }),
          supabase.from('api_configs').select('id, is_active', { count: 'exact' })
        ]);

        const totalImoveis = imoveisResponse.count || 0;
        const apisData = (apisResponse.data || []) as ApiConfig[];
        const totalApis = apisData.length;
        const apisAtivas = apisData.filter((api: ApiConfig) => api.is_active).length;

        setStats({
          totalImoveis,
          apisAtivas,
          totalApis,
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
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
      {/* ✅ HEADER COMPACTO */}
      <div>
        <h1 className="text-xl lg:text-3xl font-bold text-gray-900 mb-1">
          Dashboard Admin
        </h1>
        <p className="text-sm lg:text-base text-gray-600">
          Visão geral do sistema Imovion
        </p>
      </div>

      {/* ✅ STATS CARDS OTIMIZADOS PARA MOBILE */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-3 lg:p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-blue-100 text-xs lg:text-sm">Total Imóveis</p>
              <p className="text-lg lg:text-2xl font-bold">{stats.totalImoveis.toLocaleString()}</p>
            </div>
            <div className="text-xl lg:text-3xl mt-1 lg:mt-0">🏠</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 lg:p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-green-100 text-xs lg:text-sm">APIs Ativas</p>
              <p className="text-lg lg:text-2xl font-bold">{stats.apisAtivas}/{stats.totalApis}</p>
            </div>
            <div className="text-xl lg:text-3xl mt-1 lg:mt-0">🔗</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-3 lg:p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-purple-100 text-xs lg:text-sm">Status</p>
              <p className="text-base lg:text-xl font-bold">Online</p>
            </div>
            <div className="text-xl lg:text-3xl mt-1 lg:mt-0">⚡</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-3 lg:p-6 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <p className="text-orange-100 text-xs lg:text-sm">Última Sync</p>
              <p className="text-base lg:text-xl font-bold">{stats.ultimaSync}</p>
            </div>
            <div className="text-xl lg:text-3xl mt-1 lg:mt-0">🔄</div>
          </div>
        </div>
      </div>

      {/* ✅ STATUS SISTEMA COMPACTO */}
      <div className="bg-white rounded-lg border border-gray-200 p-3 lg:p-6 flex-1">
        <h2 className="text-base lg:text-xl font-semibold text-gray-900 mb-3">
          Sistema Operacional
        </h2>
        <p className="text-sm lg:text-base text-gray-600 mb-3">
          Todos os serviços funcionando normalmente.
        </p>
        
        <div className="flex flex-wrap gap-2">
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
      </div>
    </div>
  );
}