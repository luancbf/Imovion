"use client";

import { FiHome, FiTrendingUp } from "react-icons/fi";

interface DashboardStats {
  totalImoveis: number;
  imoveisAtivos: number;
}

interface StatsCardsProps {
  stats: DashboardStats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">
              Total de Imóveis
            </p>
            <p className="text-3xl font-bold text-gray-900">
              {stats.totalImoveis}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FiHome className="text-blue-600" size={24} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-600 text-sm font-medium">
              Imóveis Ativos
            </p>
            <p className="text-3xl font-bold text-green-600">
              {stats.imoveisAtivos}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <FiTrendingUp className="text-green-600" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
}