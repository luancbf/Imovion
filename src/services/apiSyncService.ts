// src/services/apiSyncService.ts
import { supabase } from '@/lib/supabase';
import { transformApiDataToImovel } from '@/utils/apiDataTransform';
import { Imovel } from '@/types/Imovel';
// Interfaces para logs
interface SyncLogData {
  api_config_id: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning' | 'running';
  total_processed: number;
  total_errors: number;
  error_messages: string[];
  duration: number;
  total_deleted: number;
  deleted_ids: string[];
}

interface SyncLogUpdate {
  status?: 'success' | 'error' | 'warning' | 'running';
  total_processed?: number;
  total_errors?: number;
  error_messages?: string[];
  duration?: number;
  total_deleted?: number;
  deleted_ids?: string[];
}

// Funções para logs (não hook, para usar em classes)
const createSyncLog = async (dados: SyncLogData): Promise<string> => {
  const { data, error } = await supabase
    .from('sync_logs')
    .insert([{
      ...dados,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

const updateSyncLog = async (id: string, updates: SyncLogUpdate): Promise<void> => {
  const { error } = await supabase
    .from('sync_logs')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
};

interface ApiConfig {
  id: string;
  name: string;
  endpoint: string;
  token: string;
  is_active: boolean;
  headers?: Record<string, string>;
  timeout?: number;
}

interface ExternalApiData {
  imoveis?: Record<string, unknown>[];
  properties?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  [key: string]: unknown;
}

export class ApiSyncService {
  
  async syncFromApi(apiName: string, apiConfig: ApiConfig): Promise<void> {
    const startTime = Date.now();
    let logId: string | null = null;
    
    try {
      // Iniciar log de sincronização
      logId = await createSyncLog({
        api_config_id: apiConfig.id,
        timestamp: new Date().toISOString(),
        status: 'running',
        total_processed: 0,
        total_errors: 0,
        error_messages: [],
        duration: 0,
        total_deleted: 0,
        deleted_ids: []
      });

      const externalData = await this.fetchFromExternalApi(apiConfig);
      
      const transformedImoveis = externalData.map((item: Record<string, unknown>) => {
        return transformApiDataToImovel(item, apiName);
      });
      
      let processedCount = 0;
      let errorCount = 0;
      const errorMessages: string[] = [];
      
      for (const imovel of transformedImoveis) {
        try {
          await this.saveOrUpdateImovel(imovel, apiName);
          processedCount++;
        } catch (error) {
          errorCount++;
          errorMessages.push(error instanceof Error ? error.message : 'Erro desconhecido');
        }
      }

      // Finalizar log com sucesso
      const duration = Math.round((Date.now() - startTime) / 1000);
      await updateSyncLog(logId, {
        status: errorCount > 0 ? 'warning' : 'success',
        total_processed: processedCount,
        total_errors: errorCount,
        error_messages: errorMessages,
        duration
      });

    } catch (error) {
      // Finalizar log com erro
      if (logId) {
        const duration = Math.round((Date.now() - startTime) / 1000);
        await updateSyncLog(logId, {
          status: 'error',
          total_processed: 0,
          total_errors: 1,
          error_messages: [error instanceof Error ? error.message : 'Erro desconhecido'],
          duration
        });
      }
      throw new Error(`❌ Erro na sincronização da API ${apiName}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  private async fetchFromExternalApi(apiConfig: ApiConfig): Promise<Record<string, unknown>[]> {
    try {
      const response = await fetch(apiConfig.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiConfig.token}`,
          'Content-Type': 'application/json',
          ...apiConfig.headers
        },
        signal: apiConfig.timeout ? AbortSignal.timeout(apiConfig.timeout) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data: ExternalApiData = await response.json();
      
      if (data.imoveis && Array.isArray(data.imoveis)) {
        return data.imoveis;
      }
      
      if (data.properties && Array.isArray(data.properties)) {
        return data.properties;
      }
      
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
    
      if (Array.isArray(data)) {
        return data as Record<string, unknown>[];
      }
      return [];
      
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Falha na comunicação com API: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao buscar dados da API');
    }
  }

  private async saveOrUpdateImovel(imovel: Partial<Imovel>, apiName: string): Promise<void> {
    try {
      if (!imovel.external_id) {
        return;
      }

      const { data: existing, error: selectError } = await supabase
        .from('imoveis')
        .select('id')
        .eq('external_id', imovel.external_id)
        .eq('fonte_api', apiName)
        .maybeSingle();

      if (selectError) {
        throw selectError;
      }

      const imovelData = {
        ...imovel,
        data_atualizacao: new Date().toISOString(),
        fonte_api: apiName,
        ativo: true 
      };

      if (existing) {
        const { error: updateError } = await supabase
          .from('imoveis')
          .update(imovelData)
          .eq('id', existing.id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        const { error: insertError } = await supabase
          .from('imoveis')
          .insert({
            ...imovelData,
            data_sincronizacao: new Date().toISOString()
          });
          
        if (insertError) {
          throw insertError;
        }
      }
    } catch (error) {
      throw error;
    }
  }

  async testApiConnection(apiConfig: ApiConfig): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(apiConfig.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiConfig.token}`,
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(10000) // 10s timeout para teste
      });

      if (response.ok) {
        return {
          success: true,
          message: `Conexão bem-sucedida com ${apiConfig.name}`
        };
      } else {
        return {
          success: false,
          message: `Erro ${response.status}: ${response.statusText}`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async getSyncStats(apiName: string): Promise<{
    total: number;
    ativo: number;
    inativo: number;
    ultimaSync: string | null;
  }> {
    try {
      const { data, error } = await supabase
        .from('imoveis')
        .select('ativo, data_sincronizacao')
        .eq('fonte_api', apiName);

      if (error) throw error;

      const total = data.length;
      const ativo = data.filter(item => item.ativo).length;
      const inativo = total - ativo;
      
      const ultimaSync = data.reduce((latest, item) => {
        if (!item.data_sincronizacao) return latest;
        if (!latest) return item.data_sincronizacao;
        return new Date(item.data_sincronizacao) > new Date(latest) 
          ? item.data_sincronizacao 
          : latest;
      }, null as string | null);

      return { total, ativo, inativo, ultimaSync };
    } catch {
      return { total: 0, ativo: 0, inativo: 0, ultimaSync: null };
    }
  }
}