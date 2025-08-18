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
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Dashboard Administrativo
        </h1>
        <p className="text-gray-600">
          Visão geral do sistema Imovion
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total de Imóveis</p>
              <p className="text-2xl font-bold">{stats.totalImoveis.toLocaleString()}</p>
            </div>
            <div className="text-3xl">🏠</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">APIs Ativas</p>
              <p className="text-2xl font-bold">{stats.apisAtivas}/{stats.totalApis}</p>
            </div>
            <div className="text-3xl">🔗</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Status Sistema</p>
              <p className="text-xl font-bold">Online</p>
            </div>
            <div className="text-3xl">⚡</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm">Última Sync</p>
              <p className="text-xl font-bold">{stats.ultimaSync}</p>
            </div>
            <div className="text-3xl">🔄</div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Sistema Funcionando
        </h2>
        <p className="text-gray-600">
          Use a navegação acima para acessar as funcionalidades do sistema.
        </p>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
            ✅ Banco de dados conectado
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
            ✅ APIs configuradas
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 text-purple-800">
            ✅ Sistema online
          </span>
        </div>
      </div>
    </div>
  );
}