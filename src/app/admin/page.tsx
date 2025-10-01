'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { AdminIcons } from '@/components/common/OptimizedIcons';

interface DashboardStats {
  totalImoveis: number;
  totalUsuarios: number;
  totalPatrocinadores: number;
  imoveisRecentes: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalImoveis: 0,
    totalUsuarios: 0,
    totalPatrocinadores: 0,
    imoveisRecentes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar total de imóveis
        const { count: totalImoveis } = await supabase
          .from('imoveis')
          .select('*', { count: 'exact', head: true });

        // Buscar total de usuários
        const { count: totalUsuarios } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Buscar total de patrocinadores
        const { count: totalPatrocinadores } = await supabase
          .from('patrocinadores')
          .select('*', { count: 'exact', head: true });

        // Buscar imóveis recentes (últimos 7 dias)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const { count: imoveisRecentes } = await supabase
          .from('imoveis')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', sevenDaysAgo.toISOString());

        setStats({
          totalImoveis: totalImoveis || 0,
          totalUsuarios: totalUsuarios || 0,
          totalPatrocinadores: totalPatrocinadores || 0,
          imoveisRecentes: imoveisRecentes || 0,
        });
      } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'Total de Imóveis',
      value: stats.totalImoveis,
      icon: AdminIcons.Home,
      color: 'bg-gradient-to-r from-blue-500 to-blue-600',
      description: 'Imóveis cadastrados'
    },
    {
      title: 'Usuários Ativos',
      value: stats.totalUsuarios,
      icon: AdminIcons.Users,
      color: 'bg-gradient-to-r from-green-500 to-green-600',
      description: 'Usuários registrados'
    },
    {
      title: 'Patrocinadores',
      value: stats.totalPatrocinadores,
      icon: AdminIcons.Briefcase,
      color: 'bg-gradient-to-r from-purple-500 to-purple-600',
      description: 'Parcerias ativas'
    },
    {
      title: 'Novos esta semana',
      value: stats.imoveisRecentes,
      icon: AdminIcons.Plus,
      color: 'bg-gradient-to-r from-orange-500 to-orange-600',
      description: 'Últimos 7 dias'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-32 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Painel Administrativo
          </h1>
          <p className="text-gray-600">
            Bem-vindo ao dashboard de administração da Imovion
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border">
            <span className="text-sm text-gray-500">Última atualização:</span>
            <span className="ml-2 text-sm font-medium text-gray-900">
              {new Date().toLocaleString('pt-BR')}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <div
              key={card.title}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {card.value.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {card.description}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg shadow-lg`}>
                  <IconComponent size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/admin/cadastrar-imovel"
            className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 group"
          >
            <AdminIcons.Plus size={20} className="text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-blue-900">Cadastrar Imóvel</p>
              <p className="text-sm text-blue-600">Adicionar novo imóvel</p>
            </div>
          </Link>

          <Link
            href="/admin/usuarios"
            className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 group"
          >
            <AdminIcons.Users size={20} className="text-green-600 mr-3" />
            <div>
              <p className="font-medium text-green-900">Gerenciar Usuários</p>
              <p className="text-sm text-green-600">Administrar usuários</p>
            </div>
          </Link>

          <Link
            href="/admin/cadastrar-patrocinador"
            className="flex items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 group"
          >
            <AdminIcons.Briefcase size={20} className="text-purple-600 mr-3" />
            <div>
              <p className="font-medium text-purple-900">Patrocinadores</p>
              <p className="text-sm text-purple-600">Gerenciar parcerias</p>
            </div>
          </Link>

          <Link
            href="/admin/api-integration"
            className="flex items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 group"
          >
            <AdminIcons.Link size={20} className="text-orange-600 mr-3" />
            <div>
              <p className="font-medium text-orange-900">APIs</p>
              <p className="text-sm text-orange-600">Integrações externas</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Atividade Recente</h2>
        <div className="space-y-4">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <AdminIcons.Home size={16} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {stats.imoveisRecentes} novos imóveis cadastrados
              </p>
              <p className="text-xs text-gray-500">nos últimos 7 dias</p>
            </div>
          </div>

          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <div className="bg-green-100 p-2 rounded-full mr-3">
              <AdminIcons.Users size={16} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Sistema funcionando normalmente
              </p>
              <p className="text-xs text-gray-500">todos os serviços ativos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}