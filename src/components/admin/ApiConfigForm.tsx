'use client';

import React, { useState, useEffect } from 'react';
import { ExternalAPIConfig } from '@/types/apiIntegration';

interface APIConfigFormProps {
  config?: ExternalAPIConfig | null;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  baseUrl: string;
  authType: 'none' | 'api-key' | 'bearer' | 'basic';
  authKey: string;
  rateLimit: number;
  isActive: boolean;
  webhookSecret?: string;
  enableDeletion: boolean;
  deletionStrategy: 'soft_delete' | 'archive' | 'hard_delete';
  keepDaysBeforeDelete: number;
}

export default function APIConfigForm({ config, onSuccess, onCancel }: APIConfigFormProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    baseUrl: '',
    authType: 'none',
    authKey: '',
    rateLimit: 60,
    isActive: true,
    webhookSecret: '',
    enableDeletion: false,
    deletionStrategy: 'soft_delete',
    keepDaysBeforeDelete: 30,
  });

  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    if (config) {
      setFormData({
        name: config.name || '',
        baseUrl: config.baseUrl || '',
        authType: config.authType || 'none',
        authKey: config.authKey || '',
        rateLimit: config.rateLimit || 60,
        isActive: config.isActive ?? true,
        webhookSecret: config.webhookSecret || '',
        enableDeletion: config.enableDeletion || false,
        deletionStrategy: config.deletionStrategy || 'soft_delete',
        keepDaysBeforeDelete: config.keepDaysBeforeDelete || 30,
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = config 
        ? `/api/admin/api-configs/${config.id}` 
        : '/api/admin/api-configs';
      
      const method = config ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        mapping: config?.mapping || {
          id: 'id',
          cidade: 'city',
          bairro: 'neighborhood', 
          valor: 'price',
          tipoImovel: 'type',
          tipoNegocio: 'business_type',
          setorNegocio: 'sector',
          descricao: 'description',
          metragem: 'area',
          whatsapp: 'whatsapp',
          imagens: 'images',
          caracteristicas: {}
        }
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar configuração');
      }

      alert('Configuração salva com sucesso!');
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Erro desconhecido ao salvar configuração';
      alert(errorMessage);
      console.error('Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestAPI = async () => {
    if (!formData.baseUrl) {
      alert('Por favor, preencha a URL da API primeiro');
      return;
    }

    setTesting(true);
    try {
      const response = await fetch('/api/admin/api-configs/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Teste bem-sucedido! API está respondendo.');
      } else {
        alert(`Erro no teste: ${result.error}`);
      }
    } catch (error) {
      alert('Erro ao testar API: Verifique a URL e conectividade');
      console.error('Erro no teste:', error);
    } finally {
      setTesting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      {/* Informações Básicas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nome da API *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ex: Imobiliária XYZ"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Base da API *
          </label>
          <input
            type="url"
            required
            value={formData.baseUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="https://api.imobiliaria.com/v1/imoveis"
          />
        </div>
      </div>

      {/* Autenticação */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Autenticação</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Autenticação
            </label>
            <select
              value={formData.authType}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                authType: e.target.value as FormData['authType']
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="none">Nenhuma</option>
              <option value="api-key">API Key</option>
              <option value="bearer">Bearer Token</option>
              <option value="basic">Basic Auth</option>
            </select>
          </div>

          {formData.authType !== 'none' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chave/Token de Autenticação
              </label>
              <input
                type="password"
                value={formData.authKey}
                onChange={(e) => setFormData(prev => ({ ...prev, authKey: e.target.value }))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Sua chave de API"
              />
            </div>
          )}
        </div>
      </div>

      {/* Configurações Avançadas */}
      <div className="border-t pt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Configurações</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Limit (requests/min)
            </label>
            <input
              type="number"
              min="1"
              max="300"
              value={formData.rateLimit}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                rateLimit: parseInt(e.target.value) || 60 
              }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Secret (opcional)
            </label>
            <input
              type="password"
              value={formData.webhookSecret}
              onChange={(e) => setFormData(prev => ({ ...prev, webhookSecret: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Secret para validar webhooks"
            />
          </div>
        </div>

        {/* Checkboxes */}
        <div className="mt-6 space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              API ativa (habilitar sincronização)
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.enableDeletion}
              onChange={(e) => setFormData(prev => ({ ...prev, enableDeletion: e.target.checked }))}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">
              Habilitar detecção de exclusões
            </span>
          </label>

          {formData.enableDeletion && (
            <div className="ml-6 space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estratégia de Exclusão
                </label>
                <select
                  value={formData.deletionStrategy}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    deletionStrategy: e.target.value as FormData['deletionStrategy']
                  }))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="soft_delete">Exclusão Suave (manter histórico)</option>
                  <option value="archive">Arquivar</option>
                  <option value="hard_delete">Exclusão Definitiva</option>
                </select>
              </div>

              {formData.deletionStrategy === 'soft_delete' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dias para manter registros excluídos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={formData.keepDaysBeforeDelete}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      keepDaysBeforeDelete: parseInt(e.target.value) || 30
                    }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Teste da API */}
      <div className="border-t pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Testar Conectividade</h3>
          <button
            type="button"
            onClick={handleTestAPI}
            disabled={testing || !formData.baseUrl}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {testing ? 'Testando...' : 'Testar API'}
          </button>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Salvando...' : (config ? 'Atualizar' : 'Criar')}
        </button>
      </div>

      {/* Nota sobre mapeamento */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-blue-800 font-medium">📋 Sobre o Mapeamento de Campos</h4>
        <p className="text-blue-700 text-sm mt-1">
          Esta versão usa um mapeamento padrão de campos. Para personalizar completamente 
          o mapeamento, será necessário editar a configuração após criá-la.
        </p>
        <div className="mt-2 text-xs text-blue-600">
          <strong>Mapeamento padrão:</strong> id → id, cidade → city, bairro → neighborhood, 
          valor → price, tipo → type, etc.
        </div>
      </div>
    </form>
  );
}