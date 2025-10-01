"use client";

import { useState } from 'react';
import { Usuario } from '@/types/usuarios';
import { 
  TIPOS_USUARIO, 
  PLANOS, 
  TipoUsuario, 
  PlanoUsuario,
  getLabelTipoUsuario,
  getConfiguracaoPlano,
  podeAdicionarImovel
} from '@/constants/tiposUsuarioPlanos';

interface ConfigurarUsuarioModalProps {
  usuario: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onSave: (usuarioId: string, dados: { tipo_usuario: TipoUsuario; plano_ativo: PlanoUsuario }) => Promise<void>;
}

export default function ConfigurarUsuarioModal({
  usuario,
  isOpen,
  onClose,
  onSave
}: ConfigurarUsuarioModalProps) {
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario>(
    usuario.tipo_usuario || TIPOS_USUARIO.USUARIO
  );
  const [planoAtivo, setPlanoAtivo] = useState<PlanoUsuario>(
    usuario.plano_ativo || PLANOS.COMUM
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await onSave(usuario.id, {
        tipo_usuario: tipoUsuario,
        plano_ativo: planoAtivo
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar configurações');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const configPlanoAtual = getConfiguracaoPlano(planoAtivo);
  const labelTipoAtual = getLabelTipoUsuario(tipoUsuario);
  const podeAdicionarMais = podeAdicionarImovel(planoAtivo, usuario.imoveis_ativos_count || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Configurar Usuário
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {usuario.nome} {usuario.sobrenome} • {usuario.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-red-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Status Atual */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Status Atual</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Tipo de Usuário</p>
                <div className="flex items-center mt-1">
                  <span className="mr-2">{labelTipoAtual.icone}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${labelTipoAtual.cor}`}>
                    {labelTipoAtual.nome}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600">Plano Atual</p>
                <div className="flex items-center mt-1">
                  <span className="mr-2">{configPlanoAtual.icone}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${configPlanoAtual.cor}`}>
                    {configPlanoAtual.nome}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-gray-600">Imóveis Ativos</p>
                <p className="mt-1 font-medium">
                  {usuario.imoveis_ativos_count || 0}
                  {configPlanoAtual.limite_imoveis && ` / ${configPlanoAtual.limite_imoveis}`}
                </p>
                {!podeAdicionarMais && (
                  <p className="text-xs text-orange-600 mt-1">⚠️ Limite atingido</p>
                )}
              </div>
            </div>
          </div>

          {/* Configuração Tipo de Usuário */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Tipo de Usuário
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.values(TIPOS_USUARIO).map((tipo) => {
                const label = getLabelTipoUsuario(tipo);
                const isSelected = tipoUsuario === tipo;
                
                return (
                  <button
                    key={tipo}
                    onClick={() => setTipoUsuario(tipo)}
                    className={`p-4 border-2 rounded-lg text-left transition-all hover:border-blue-300 cursor-pointer ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">{label.icone}</span>
                      <span className="font-medium text-gray-900">{label.nome}</span>
                    </div>
                    <p className="text-sm text-gray-600">{label.descricao}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Configuração Plano */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Plano de Pagamento
            </label>
            <div className="space-y-3">
              {Object.values(PLANOS).map((plano) => {
                const config = getConfiguracaoPlano(plano);
                const isSelected = planoAtivo === plano;
                
                return (
                  <button
                    key={plano}
                    onClick={() => setPlanoAtivo(plano)}
                    className={`w-full p-4 border-2 rounded-lg text-left transition-all hover:border-blue-300 cursor-pointer ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">{config.icone}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{config.nome}</h4>
                          <p className="text-sm text-gray-600">{config.descricao}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {config.preco_mensal && (
                          <p className="font-semibold text-green-600">
                            R$ {config.preco_mensal}/mês
                          </p>
                        )}
                        {config.preco_imovel && (
                          <p className="font-semibold text-blue-600">
                            R$ {config.preco_imovel}/imóvel
                          </p>
                        )}
                        {config.limite_imoveis && (
                          <p className="text-xs text-gray-500 mt-1">
                            Até {config.limite_imoveis} imóveis
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center cursor-pointer"
          >
            {isLoading && (
              <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            Salvar Configurações
          </button>
        </div>
      </div>
    </div>
  );
}