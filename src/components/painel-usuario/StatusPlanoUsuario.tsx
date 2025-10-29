"use client";

import { useUsuarioCompleto } from '@/hooks/useUsuarioCompleto';
import { 
  getConfiguracaoPlano, 
  getLabelTipoUsuario, 
  podeAdicionarImovel,
  PlanoUsuario,
  TipoUsuario 
} from '@/constants/tiposUsuarioPlanos';
import { FiUser, FiCreditCard, FiHome, FiAlertTriangle, FiCheck } from 'react-icons/fi';

interface StatusPlanoUsuarioProps {
  className?: string;
}

export default function StatusPlanoUsuario({ 
  className = "" 
}: StatusPlanoUsuarioProps) {
  const { usuario, loading } = useUsuarioCompleto();

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!usuario) return null;

  const tipoUsuario = (usuario.tipo_usuario || 'proprietario') as TipoUsuario;
  const planoAtivo = (usuario.plano_ativo || 'comum') as PlanoUsuario;
  const imoveisAtivos = usuario.imoveis_ativos_count || 0;
  
  const configPlano = getConfiguracaoPlano(planoAtivo);
  const labelTipo = getLabelTipoUsuario(tipoUsuario);
  const podeAdicionar = podeAdicionarImovel(planoAtivo, imoveisAtivos);
  
  const porcentagemUso = configPlano.limite_imoveis 
    ? Math.min((imoveisAtivos / configPlano.limite_imoveis) * 100, 100)
    : 0;

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Seu Plano
        </h3>
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{configPlano.icone}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${configPlano.cor}`}>
            {configPlano.nome}
          </span>
        </div>
      </div>

      {/* Tipo de Usuário */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-2">
          <FiUser className="text-gray-500" size={18} />
          <h4 className="font-medium text-gray-700">Tipo de Conta</h4>
        </div>
        <div className="flex items-center space-x-2 ml-6">
          <span className="text-lg">{labelTipo.icone}</span>
          <span className={`px-2 py-1 rounded-full text-sm font-medium ${labelTipo.cor}`}>
            {labelTipo.nome}
          </span>
        </div>
      </div>

      {/* Informações do Plano */}
      <div className="mb-6">
        <div className="flex items-center space-x-3 mb-3">
          <FiCreditCard className="text-gray-500" size={18} />
          <h4 className="font-medium text-gray-700">Detalhes do Plano</h4>
        </div>
        
        <div className="ml-6 space-y-3">
          <p className="text-sm text-gray-600">{configPlano.descricao}</p>
          
          {/* Preço */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Valor:</span>
            {configPlano.preco_mensal && (
              <span className="font-semibold text-green-600">
                R$ {configPlano.preco_mensal}/mês
              </span>
            )}
            {configPlano.preco_imovel && (
              <span className="font-semibold text-blue-600">
                R$ {configPlano.preco_imovel}/imóvel
              </span>
            )}
          </div>

          {/* Status do Plano */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-green-600">
                {usuario.status_plano || 'Ativo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Uso de Imóveis */}
      <div>
        <div className="flex items-center space-x-3 mb-3">
          <FiHome className="text-gray-500" size={18} />
          <h4 className="font-medium text-gray-700">Uso de Imóveis</h4>
        </div>
        
        <div className="ml-6 space-y-3">
          {configPlano.limite_imoveis ? (
            <>
              {/* Barra de Progresso */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Imóveis Ativos</span>
                  <span className="font-medium">
                    {imoveisAtivos} / {configPlano.limite_imoveis}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      porcentagemUso >= 90 
                        ? 'bg-red-500' 
                        : porcentagemUso >= 70 
                        ? 'bg-yellow-500' 
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${porcentagemUso}%` }}
                  />
                </div>
                
                <div className="text-xs text-gray-500">
                  {porcentagemUso.toFixed(1)}% do seu limite utilizado
                </div>
              </div>

              {/* Alerta de Limite */}
              {!podeAdicionar && (
                <div className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <FiAlertTriangle className="text-red-500 mt-0.5 flex-shrink-0" size={16} />
                  <div className="text-sm">
                    <p className="font-medium text-red-800">Limite Atingido</p>
                    <p className="text-red-600">
                      Você atingiu o limite de imóveis do seu plano. 
                      Para adicionar mais imóveis, considere fazer upgrade.
                    </p>
                  </div>
                </div>
              )}

              {podeAdicionar && porcentagemUso >= 70 && (
                <div className="flex items-start space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <FiAlertTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" size={16} />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Atenção</p>
                    <p className="text-yellow-600">
                      Você está próximo do limite do seu plano. 
                      Restam {configPlano.limite_imoveis - imoveisAtivos} vagas.
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <FiCheck className="text-blue-500" size={16} />
              <div className="text-sm">
                <p className="font-medium text-blue-800">Plano Flexível</p>
                <p className="text-blue-600">
                  Sem limite de imóveis. Você paga por cada imóvel publicado.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Data de Início do Plano */}
      {usuario.data_inicio_plano && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Plano ativo desde: {new Date(usuario.data_inicio_plano).toLocaleDateString('pt-BR')}
          </div>
        </div>
      )}
    </div>
  );
}