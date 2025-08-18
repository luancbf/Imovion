// src/components/admin/APIConfigManager.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiPlay } from 'react-icons/fi';
import { ExternalAPIConfig } from '@/types/apiIntegration';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function APIConfigManager() {
  const [configs, setConfigs] = useState<ExternalAPIConfig[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('api_configs')
        .select('*')
        .order('name');

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      alert(`Erro ao carregar configurações: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (configId: string) => {
    try {
      setLoading(true);
      const response = await fetch('/api/sync/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiConfigId: configId })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Sincronização realizada com sucesso!');
        await loadConfigs();
      } else {
        alert('Erro na sincronização: ' + result.error);
      }
    } catch (error) {
      console.error('Erro ao executar sincronização:', error);
      alert('Erro ao executar sincronização');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (configId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('api_configs')
        .update({ is_active: !currentStatus })
        .eq('id', configId);

      if (error) throw error;
      
      await loadConfigs();
      alert(`API ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`);
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      alert('Erro ao alterar status da API');
    }
  };

  const handleDelete = async (configId: string, configName: string) => {
    if (!confirm(`Tem certeza que deseja excluir a configuração "${configName}"?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('api_configs')
        .delete()
        .eq('id', configId);

      if (error) throw error;
      
      await loadConfigs();
      alert('Configuração excluída com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir configuração:', error);
      alert('Erro ao excluir configuração');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Configurações de API</h2>
        <button
          onClick={() => {
            window.location.href = '/admin/api-integration/new';
          }}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
        >
          <FiPlus /> Nova API
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <p className="mt-2">Carregando...</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {configs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Nenhuma configuração de API encontrada.</p>
              <p className="text-sm mt-2">Clique em &ldquo;Nova API&rdquo; para adicionar sua primeira configuração.</p>
            </div>
          ) : (
            configs.map((config) => (
              <div key={config.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{config.name}</h3>
                    <p className="text-gray-600 text-sm">{config.baseUrl}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        config.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {config.isActive ? 'Ativa' : 'Inativa'}
                      </span>
                      <span className="text-xs text-gray-500">
                        Autenticação: {config.authType}
                      </span>
                      <span className="text-xs text-gray-500">
                        Rate Limit: {config.rateLimit}/min
                      </span>
                      {config.enableDeletion && (
                        <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          Exclusão: {config.deletionStrategy}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleSync(config.id)}
                      disabled={!config.isActive || loading}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Sincronizar agora"
                    >
                      <FiPlay />
                    </button>
                    
                    <button
                      onClick={() => handleToggleActive(config.id, config.isActive)}
                      className={`p-2 rounded ${
                        config.isActive 
                          ? 'text-orange-500 hover:bg-orange-50' 
                          : 'text-green-500 hover:bg-green-50'
                      }`}
                      title={config.isActive ? 'Desativar API' : 'Ativar API'}
                    >
                      {config.isActive ? '⏸️' : '▶️'}
                    </button>
                    
                    <button
                      onClick={() => {
                        window.location.href = `/admin/api-integration/edit/${config.id}`;
                      }}
                      className="p-2 text-gray-500 hover:bg-gray-50 rounded"
                      title="Editar configuração"
                    >
                      <FiEdit />
                    </button>
                    
                    <button
                      onClick={() => handleDelete(config.id, config.name)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                      title="Excluir configuração"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Campos mapeados:</span>
                      <p className="font-medium">
                        {Object.keys(config.mapping || {}).length} campos
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Webhook:</span>
                      <p className="font-medium">
                        {config.webhookSecret ? 'Configurado' : 'Não configurado'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Exclusões:</span>
                      <p className="font-medium">
                        {config.enableDeletion ? 'Habilitadas' : 'Desabilitadas'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Última sync:</span>
                      <p className="font-medium text-gray-400">
                        Não disponível
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {configs.length > 0 && (
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => handleSync('')}
            disabled={loading || configs.filter(c => c.isActive).length === 0}
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sincronizando...' : 'Sincronizar Todas as APIs Ativas'}
          </button>
        </div>
      )}

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Como usar:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• <strong>Nova API:</strong> Clique no botão &ldquo;Nova API&rdquo; para adicionar uma configuração</li>
          <li>• <strong>Sincronizar:</strong> Use o botão ▶️ para sincronizar uma API específica</li>
          <li>• <strong>Ativar/Desativar:</strong> Use ⏸️/▶️ para controlar se a API está ativa</li>
          <li>• <strong>Webhook:</strong> Configure o webhook secret para receber atualizações automáticas</li>
          <li>• <strong>Exclusões:</strong> Habilite para detectar quando imóveis são removidos da API externa</li>
        </ul>
      </div>
    </div>
  );
}