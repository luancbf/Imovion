import { DataMapper } from './dataMapper';
import { ExternalAPIConfig, ExternalImovelData, FieldMapping, SyncResult } from '@/types/apiIntegration';
import { Imovel } from '@/types/Imovel';
import { supabase } from '@/lib/supabase';

interface ImovelExtended extends Partial<Imovel> {
  fonte_api?: string;
  data_sincronizacao?: string;
  external_id?: string;
  is_active?: boolean;
  deleted_at?: string | null;
  deletion_reason?: string;
}

interface DatabaseAPIConfig {
  id: string;
  name: string;
  base_url: string;
  auth_key: string | null;
  auth_type: 'none' | 'api-key' | 'bearer' | 'basic';
  mapping: Record<string, unknown>;
  rate_limit: number;
  is_active: boolean;
  enable_deletion: boolean;
  deletion_strategy: 'soft_delete' | 'archive' | 'hard_delete';
  keep_days_before_delete: number;
  webhook_secret: string | null;
}

function convertToFieldMapping(data: Record<string, unknown>): FieldMapping {
  const defaults: FieldMapping = {
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
  };

  return {
    id: (data.id as string) || defaults.id,
    cidade: (data.cidade as string) || defaults.cidade,
    bairro: (data.bairro as string) || defaults.bairro,
    valor: (data.valor as string) || defaults.valor,
    tipoImovel: (data.tipoImovel as string) || defaults.tipoImovel,
    tipoNegocio: (data.tipoNegocio as string) || defaults.tipoNegocio,
    setorNegocio: (data.setorNegocio as string) || defaults.setorNegocio,
    descricao: (data.descricao as string) || defaults.descricao,
    metragem: (data.metragem as string) || defaults.metragem,
    whatsapp: (data.whatsapp as string) || defaults.whatsapp,
    imagens: (data.imagens as string) || defaults.imagens,
    caracteristicas: (data.caracteristicas as Record<string, string>) || defaults.caracteristicas
  };
}

export class APIIntegrationService {
  private readonly BATCH_SIZE = 25;
  private readonly MAX_RETRIES = 3;
  private readonly REQUEST_TIMEOUT = 30000;

  private async makeRequest(url: string, headers: Record<string, string>): Promise<Response> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT);

        const response = await fetch(url, {
          method: 'GET',
          headers,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) return response;

        if (response.status === 429 && attempt < this.MAX_RETRIES) {
          await this.delay(2000 * attempt);
          continue;
        }

        throw new Error(`HTTP ${response.status}: ${response.statusText}`);

      } catch (error) {
        if (attempt === this.MAX_RETRIES) throw error;
        await this.delay(1000 * attempt);
      }
    }
    throw new Error('Max retries exceeded');
  }

  private normalizeAPIResponse(data: unknown): ExternalImovelData[] {
    if (Array.isArray(data)) return data;
    
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      const keys = ['data', 'results', 'items', 'properties', 'listings', 'imoveis'];
      
      for (const key of keys) {
        if (Array.isArray(obj[key])) return obj[key] as ExternalImovelData[];
      }
      
      return [data as ExternalImovelData];
    }
    
    throw new Error('Invalid API response format');
  }

  private getAuthHeaders(config: ExternalAPIConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'Projeto-Imobiliario-Integration/1.0',
      'Accept': 'application/json'
    };

    switch (config.authType) {
      case 'api-key':
        if (config.authKey) headers['X-API-Key'] = config.authKey;
        break;
      case 'bearer':
        if (config.authKey) headers['Authorization'] = `Bearer ${config.authKey}`;
        break;
      case 'basic':
        if (config.authKey) headers['Authorization'] = `Basic ${btoa(config.authKey)}`;
        break;
    }

    return headers;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async fetchFromExternalAPI(config: ExternalAPIConfig, limit = 100): Promise<ExternalImovelData[]> {
    const headers = this.getAuthHeaders(config);
    const url = new URL(config.baseUrl);
    
    if (limit > 0) url.searchParams.set('limit', limit.toString());

    const response = await this.makeRequest(url.toString(), headers);
    
    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      throw new Error('Invalid content type');
    }

    const data = await response.json();
    const items = this.normalizeAPIResponse(data);

    return items;
  }

  async syncAPI(config: DatabaseAPIConfig): Promise<SyncResult> {
    const startTime = Date.now();
    
    try {
      const apiConfig: ExternalAPIConfig = {
        id: config.id,
        name: config.name,
        baseUrl: config.base_url,
        authKey: config.auth_key || undefined,
        authType: config.auth_type,
        mapping: convertToFieldMapping(config.mapping),
        rateLimit: config.rate_limit,
        isActive: config.is_active,
        enableDeletion: config.enable_deletion,
        deletionStrategy: config.deletion_strategy,
        keepDaysBeforeDelete: config.keep_days_before_delete,
        webhookSecret: config.webhook_secret || undefined
      };

      const externalData = await this.fetchFromExternalAPI(apiConfig);
      
      if (externalData.length === 0) {
        return this.createSyncResult(config.id, 'success', 0, 0, [], Date.now() - startTime);
      }

      const result = await this.processData(apiConfig, externalData);
      const syncResult = this.createSyncResult(
        config.id,
        result.errors > 0 ? 'partial' : 'success',
        result.processed,
        result.errors,
        result.errorMessages,
        Date.now() - startTime
      );

      await this.saveSyncLog(syncResult);
      return syncResult;

    } catch (error) {
      const errorResult = this.createSyncResult(
        config.id,
        'error',
        0,
        1,
        [error instanceof Error ? error.message : 'Unknown error'],
        Date.now() - startTime
      );

      await this.saveSyncLog(errorResult);
      return errorResult;
    }
  }

  async syncAllAPIs(): Promise<SyncResult[]> {
    const { data: configs, error } = await supabase
      .from('api_configs')
      .select('*')
      .eq('is_active', true);

    if (error) throw new Error(`Failed to fetch configs: ${error.message}`);
    if (!configs?.length) return [];

    const results: SyncResult[] = [];

    for (const config of configs as DatabaseAPIConfig[]) {
      try {
        const result = await this.syncAPI(config);
        results.push(result);
        
        const delay = Math.max(1000, 60000 / config.rate_limit);
        await this.delay(delay);
        
      } catch (error) {
        const errorResult = this.createSyncResult(
          config.id,
          'error',
          0,
          1,
          [error instanceof Error ? error.message : 'Unknown error'],
          0
        );
        results.push(errorResult);
      }
    }
    return results;
  }

  async processData(config: ExternalAPIConfig, payload: unknown): Promise<{
    processed: number;
    errors: number;
    errorMessages: string[];
  }> {
    const mapper = new DataMapper(config.mapping);
    const processedData: ImovelExtended[] = [];
    const errorMessages: string[] = [];

    const items = this.normalizeAPIResponse(payload);

    for (const [index, item] of items.entries()) {
      try {
        const mappedItem = mapper.mapToInternal(item);
        const validation = mapper.validateMappedData(mappedItem);
        
        if (validation.valid) {
          processedData.push({
            ...mappedItem,
            external_id: mappedItem.id,
            fonte_api: config.id,
            is_active: true,
            deleted_at: null,
            data_sincronizacao: new Date().toISOString()
          });
        } else {
          errorMessages.push(`Item ${index + 1}: ${validation.errors.join(', ')}`);
        }
      } catch (error) {
        errorMessages.push(`Item ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (processedData.length > 0) {
      await this.upsertImoveis(processedData);
    }

    return {
      processed: processedData.length,
      errors: errorMessages.length,
      errorMessages
    };
  }

  async processWebhookData(config: ExternalAPIConfig, payload: unknown): Promise<{
    processed: number;
    errors: number;
    errorMessages: string[];
  }> {
    return this.processData(config, payload);
  }

  private async upsertImoveis(imoveis: ImovelExtended[]): Promise<void> {
    if (imoveis.length === 0) return;

    for (let i = 0; i < imoveis.length; i += this.BATCH_SIZE) {
      const batch = imoveis.slice(i, i + this.BATCH_SIZE);
      
      const { error } = await supabase
        .from('imoveis')
        .upsert(batch, {
          onConflict: 'external_id,fonte_api',
          ignoreDuplicates: false
        });

      if (error) throw new Error(`Batch upsert failed: ${error.message}`);
      
      if (i + this.BATCH_SIZE < imoveis.length) {
        await this.delay(200);
      }
    }

  }

  private createSyncResult(
    apiConfigId: string,
    status: 'success' | 'error' | 'partial',
    processed: number,
    errors: number,
    errorMessages: string[],
    duration: number
  ): SyncResult {
    return {
      apiConfigId,
      status,
      totalProcessed: processed,
      totalErrors: errors,
      totalDeleted: 0,
      errorMessages,
      deletedIds: [],
      duration
    };
  }

  private async saveSyncLog(result: SyncResult): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_logs')
        .insert([{
          api_config_id: result.apiConfigId,
          timestamp: new Date().toISOString(),
          status: result.status,
          total_processed: result.totalProcessed,
          total_errors: result.totalErrors,
          total_deleted: result.totalDeleted,
          error_messages: result.errorMessages,
          deleted_ids: result.deletedIds,
          duration: result.duration
        }]);

      if (error) {
      }
    } catch {
    }
  }

  async testConnection(config: ExternalAPIConfig): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      await this.fetchFromExternalAPI(config, 1);
      return {
        success: true,
        message: 'Connection successful',
        responseTime: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async cleanOldData(apiConfigId: string, daysOld: number): Promise<{
    deleted: number;
    errors: number;
  }> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { data, error } = await supabase
        .from('imoveis')
        .update({ 
          deleted_at: new Date().toISOString(),
          deletion_reason: `Auto-cleanup: ${daysOld} days old`
        })
        .eq('fonte_api', apiConfigId)
        .lt('data_sincronizacao', cutoffDate.toISOString())
        .is('deleted_at', null)
        .select('id');

      if (error) throw error;

      return {
        deleted: data?.length || 0,
        errors: 0
      };

    } catch {
      return { deleted: 0, errors: 1 };
    }
  }

  async getStats(apiConfigId?: string): Promise<{
    totalSyncs: number;
    successfulSyncs: number;
    errorSyncs: number;
    lastSync?: Date;
    avgDuration?: number;
  }> {
    try {
      let query = supabase
        .from('sync_logs')
        .select('status, duration, timestamp');

      if (apiConfigId) {
        query = query.eq('api_config_id', apiConfigId);
      }

      const { data: logs, error } = await query
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error || !logs?.length) {
        return { totalSyncs: 0, successfulSyncs: 0, errorSyncs: 0 };
      }

      const totalSyncs = logs.length;
      const successfulSyncs = logs.filter(log => log.status === 'success').length;
      const errorSyncs = logs.filter(log => log.status === 'error').length;
      const avgDuration = Math.round(
        logs.reduce((sum, log) => sum + (log.duration || 0), 0) / totalSyncs
      );

      return {
        totalSyncs,
        successfulSyncs,
        errorSyncs,
        lastSync: new Date(logs[0].timestamp),
        avgDuration
      };

    } catch {
      return { totalSyncs: 0, successfulSyncs: 0, errorSyncs: 0 };
    }
  }
}