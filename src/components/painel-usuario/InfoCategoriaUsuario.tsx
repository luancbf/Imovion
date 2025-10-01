'use client';

import { FiUser, FiBriefcase, FiHome, FiInfo, FiTrendingUp, FiShield } from 'react-icons/fi';
import { CategoriaUsuario, LIMITES_POR_CATEGORIA } from '@/types/usuarios';

interface InfoCategoriaUsuarioProps {
  categoria: CategoriaUsuario;
  totalImoveis: number;
  nome: string;
}

const CATEGORIA_INFO = {
  usuario_comum: {
    nome: 'Usuário Comum',
    icon: FiUser,
    cor: 'blue',
    descricao: 'Categoria básica para usuários individuais'
  },
  proprietario_com_plano: {
    nome: 'Proprietário com Plano',
    icon: FiShield,
    cor: 'emerald',
    descricao: 'Proprietário com plano mensal para múltiplos imóveis'
  },
  corretor: {
    nome: 'Corretor',
    icon: FiTrendingUp,
    cor: 'green',
    descricao: 'Profissional licenciado do mercado imobiliário'
  },
  imobiliaria: {
    nome: 'Imobiliária',
    icon: FiBriefcase,
    cor: 'purple',
    descricao: 'Empresa do setor imobiliário'
  }
} as const;

export default function InfoCategoriaUsuario({ 
  categoria, 
  totalImoveis, 
  nome 
}: InfoCategoriaUsuarioProps) {
  const info = CATEGORIA_INFO[categoria];
  const limite = LIMITES_POR_CATEGORIA[categoria];
  const percentualUso = limite > 0 ? (totalImoveis / limite) * 100 : 0;
  const IconComponent = info.icon;

  const getProgressColor = () => {
    if (percentualUso >= 90) return 'bg-red-500';
    if (percentualUso >= 70) return 'bg-yellow-500';
    return `bg-${info.cor}-500`;
  };

  const getTextColor = () => `text-${info.cor}-600`;
  const getBgColor = () => `bg-${info.cor}-50`;
  const getBorderColor = () => `border-${info.cor}-200`;

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${getBorderColor()} border`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-lg ${getBgColor()}`}>
            <IconComponent className={getTextColor()} size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Categoria do Usuário</h3>
            <p className="text-sm text-gray-500">Olá, {nome}!</p>
          </div>
        </div>
      </div>

      {/* Categoria Atual */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full ${getBgColor()} ${getTextColor()}`}>
            <IconComponent size={14} className="mr-1" />
            {info.nome}
          </span>
        </div>
        <p className="text-sm text-gray-600">{info.descricao}</p>
      </div>

      {/* Limite de Imóveis */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Imóveis Cadastrados</span>
          <span className="text-sm font-semibold">
            {totalImoveis} / {limite > 0 ? limite : '∞'}
          </span>
        </div>
        
        {limite > 0 && (
          <>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${Math.min(percentualUso, 100)}%` }}
              />
            </div>
            
            {percentualUso >= 90 && (
              <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                <FiInfo className="text-red-500 flex-shrink-0" size={16} />
                <p className="text-sm text-red-700">
                  {percentualUso >= 100 ? 
                    'Você atingiu o limite de imóveis para sua categoria.' :
                    'Você está próximo do limite de imóveis.'
                  }
                </p>
              </div>
            )}
          </>
        )}

        {categoria === 'proprietario_com_plano' && (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 border border-emerald-200 rounded-lg">
            <FiShield className="text-emerald-500" size={16} />
            <p className="text-sm text-emerald-700">
              Ideal para proprietários com múltiplos imóveis
            </p>
          </div>
        )}

        {categoria === 'imobiliaria' && (
          <div className="flex items-center gap-2 p-2 bg-purple-50 border border-purple-200 rounded-lg">
            <FiHome className="text-purple-500" size={16} />
            <p className="text-sm text-purple-700">
              Maior limite de imóveis disponível
            </p>
          </div>
        )}
      </div>

      {/* Benefícios por Categoria */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Benefícios da sua categoria:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          {categoria === 'usuario_comum' && (
            <li>• Cadastro gratuito de até 1 imóvel</li>
          )}
          {categoria === 'proprietario_com_plano' && (
            <>
              <li>• Cadastro de até 25 imóveis</li>
              <li>• Plano mensal acessível</li>
              <li>• Não requer CRECI</li>
              <li>• Ideal para proprietários múltiplos</li>
            </>
          )}
          {categoria === 'corretor' && (
            <>
              <li>• Cadastro de até 50 imóveis</li>
              <li>• Badge de corretor verificado</li>
              <li>• Recursos profissionais</li>
            </>
          )}
          {categoria === 'imobiliaria' && (
            <>
              <li>• Cadastro de até 150 imóveis</li>
              <li>• Perfil empresarial</li>
              <li>• Gestão de equipe</li>
              <li>• Relatórios avançados</li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
}