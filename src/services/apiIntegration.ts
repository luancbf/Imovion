// src/services/apiIntegration.ts
import { DataMapper } from './dataMapper';
import { ExternalAPIConfig, SyncLog, ExternalImovelData, FieldMapping } from '@/types/apiIntegration';
import { Imovel } from '@/types/Imovel';
import { createClient } from '@supabase/supabase-js';

// ✅ Interface para dados estendidos do imóvel
interface ImovelExtended extends Partial<Imovel> {
  fonte_api?: string;
  data_sincronizacao?: Date | string;
  external_id?: string;
  is_active?: boolean;
  deleted_at?: Date | string | null;
  deletion_reason?: string;
}

// ✅ Interface para config do banco de dados
interface DatabaseAPIConfig {
  id: string;
  name: string;
  base_url: string;
  auth_key: string | null;
  auth_type: 'none' | 'api-key' | 'bearer' | 'basic';
  mapping: Record<string, unknown>; // Será convertido para FieldMapping
  rate_limit: number;
  is_active: boolean;
  enable_deletion: boolean;
  deletion_strategy: 'soft_delete' | 'archive' | 'hard_delete';
  keep_days_before_delete: number;
  webhook_secret: string | null;
  created_at?: string;
  updated_at?: string;
}

// ✅ CORRIGIDO: Função única para converter mapping do banco para FieldMapping
function convertToFieldMapping(data: Record<string, unknown>): FieldMapping {
  // Garantir que todos os campos obrigatórios existam
  const defaultMapping: FieldMapping = {
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

  // Mesclar com dados existentes, mantendo defaults para campos ausentes
  return {
    id: (data.id as string) || defaultMapping.id,
    cidade: (data.cidade as string) || defaultMapping.cidade,
    bairro: (data.bairro as string) || defaultMapping.bairro,
    valor: (data.valor as string) || defaultMapping.valor,
    tipoImovel: (data.tipoImovel as string) || defaultMapping.tipoImovel,
    tipoNegocio: (data.tipoNegocio as string) || defaultMapping.tipoNegocio,
    setorNegocio: (data.setorNegocio as string) || defaultMapping.setorNegocio,
    descricao: (data.descricao as string) || defaultMapping.descricao,
    metragem: (data.metragem as string) || defaultMapping.metragem,
    whatsapp: (data.whatsapp as string) || defaultMapping.whatsapp,
    imagens: (data.imagens as string) || defaultMapping.imagens,
    caracteristicas: (data.caracteristicas as Record<string, string>) || defaultMapping.caracteristicas
  };
}

export class APIIntegrationService {
  private supabase;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  // ✅ Buscar dados de uma API externa com tipos seguros
  async fetchFromExternalAPI(config: ExternalAPIConfig, limit = 10): Promise<ExternalImovelData[]> {
    console.log(`🔄 Iniciando busca na API: ${config.name}`);
    
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'User-Agent': 'Projeto-Imobiliario-Integration/1.0'
      };

      // Configurar autenticação baseada no tipo
      switch (config.authType) {
        case 'api-key':
          headers['X-API-Key'] = config.authKey || '';
          break;
        case 'bearer':
          headers['Authorization'] = `Bearer ${config.authKey || ''}`;
          break;
        case 'basic':
          if (config.authKey) {
            headers['Authorization'] = `Basic ${Buffer.from(config.authKey).toString('base64')}`;
          }
          break;
        case 'none':
        default:
          // Sem autenticação
          break;
      }

      // Construir URL com parâmetros
      const url = new URL(config.baseUrl);
      if (limit && limit > 0) {
        url.searchParams.set('limit', limit.toString());
      }

      console.log(`🔗 Fazendo requisição para: ${url.toString()}`);

      // Fazer requisição com timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API retornou status ${response.status}: ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('API não retornou JSON válido');
      }

      const data: unknown = await response.json();
      
      // ✅ Normalizar diferentes formatos de resposta inline
      let items: ExternalImovelData[] = [];
      
      if (Array.isArray(data)) {
        items = data;
      } else if (data && typeof data === 'object') {
        const dataObj = data as Record<string, unknown>;
        
        if (dataObj.data && Array.isArray(dataObj.data)) {
          items = dataObj.data;
        } else if (dataObj.results && Array.isArray(dataObj.results)) {
          items = dataObj.results;
        } else if (dataObj.items && Array.isArray(dataObj.items)) {
          items = dataObj.items;
        } else if (dataObj.properties && Array.isArray(dataObj.properties)) {
          items = dataObj.properties;
        } else {
          // Se for um objeto único, tratar como array de 1 item
          items = [data as ExternalImovelData];
        }
      } else {
        throw new Error('Formato de resposta da API não reconhecido');
      }

      console.log(`✅ Recebidos ${items.length} itens da API ${config.name}`);
      return items;

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout na requisição para a API');
      }
      
      console.error(`❌ Erro ao buscar dados de ${config.name}:`, error);
      throw error;
    }
  }

  // ✅ Função de sincronização com conversão correta de tipos
  async syncAPI(config: DatabaseAPIConfig): Promise<SyncLog> {
    const startTime = Date.now();
    
    try {
      // ✅ Converter config do banco para o tipo esperado usando função auxiliar
      const apiConfig: ExternalAPIConfig = {
        id: config.id,
        name: config.name,
        baseUrl: config.base_url,
        authKey: config.auth_key || undefined,
        authType: config.auth_type,
        mapping: convertToFieldMapping(config.mapping), // ✅ Conversão type-safe
        rateLimit: config.rate_limit,
        isActive: config.is_active,
        enableDeletion: config.enable_deletion,
        deletionStrategy: config.deletion_strategy,
        keepDaysBeforeDelete: config.keep_days_before_delete,
        webhookSecret: config.webhook_secret || undefined
      };

      // Buscar dados da API externa
      const externalData = await this.fetchFromExternalAPI(apiConfig);
      
      if (!externalData || externalData.length === 0) {
        const duration = Date.now() - startTime;
        return {
          id: crypto.randomUUID(),
          apiConfigId: config.id,
          timestamp: new Date(),
          status: 'success',
          totalProcessed: 0,
          totalErrors: 0,
          totalDeleted: 0,
          errorMessages: [],
          deletedIds: [],
          duration
        };
      }

      // Processar dados usando o método existente
      const result = await this.processWebhookData(apiConfig, externalData);
      
      const duration = Date.now() - startTime;
      
      const syncLog: SyncLog = {
        id: crypto.randomUUID(),
        apiConfigId: config.id,
        timestamp: new Date(),
        status: result.errors > 0 ? 'partial' : 'success',
        totalProcessed: result.processed,
        totalErrors: result.errors,
        totalDeleted: 0, // TODO: Implementar detecção de exclusões
        errorMessages: result.errorMessages,
        deletedIds: [],
        duration
      };

      await this.saveSyncLog(syncLog);
      return syncLog;

    } catch (error) {
      const duration = Date.now() - startTime;
      
      const errorLog: SyncLog = {
        id: crypto.randomUUID(),
        apiConfigId: config.id,
        timestamp: new Date(),
        status: 'error',
        totalProcessed: 0,
        totalErrors: 1,
        totalDeleted: 0,
        errorMessages: [error instanceof Error ? error.message : 'Erro desconhecido'],
        deletedIds: [],
        duration
      };

      await this.saveSyncLog(errorLog);
      return errorLog;
    }
  }

  // ✅ Sincronizar todas as APIs ativas
  async syncAllAPIs(): Promise<SyncLog[]> {
    console.log('🔄 Iniciando sincronização de todas as APIs...');
    
    try {
      // Buscar todas as APIs ativas
      const { data: configs, error } = await this.supabase
        .from('api_configs')
        .select('*')
        .eq('is_active', true);

      if (error) {
        throw new Error(`Erro ao buscar configurações: ${error.message}`);
      }

      if (!configs || configs.length === 0) {
        console.log('📭 Nenhuma API ativa encontrada');
        return [];
      }

      const results: SyncLog[] = [];

      // Cast explícito dos dados do banco para o tipo esperado
      const typedConfigs = configs as DatabaseAPIConfig[];

      // Sincronizar cada API sequencialmente para respeitar rate limits
      for (const config of typedConfigs) {
        try {
          console.log(`🔄 Sincronizando API: ${config.name}`);
          
          const result = await this.syncAPI(config);
          results.push(result);
          
          // Aguardar um pouco entre APIs para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 1000));
          
        } catch (error) {
          console.error(`❌ Erro na sincronização de ${config.name}:`, error);
          
          // Criar log de erro
          const errorLog: SyncLog = {
            id: crypto.randomUUID(),
            apiConfigId: config.id,
            timestamp: new Date(),
            status: 'error',
            totalProcessed: 0,
            totalErrors: 1,
            totalDeleted: 0,
            errorMessages: [error instanceof Error ? error.message : 'Erro desconhecido'],
            deletedIds: [],
            duration: 0
          };
          
          await this.saveSyncLog(errorLog);
          results.push(errorLog);
        }
      }

      console.log(`✅ Sincronização completa. ${results.length} APIs processadas`);
      return results;

    } catch (error) {
      console.error('❌ Erro na sincronização geral:', error);
      throw error;
    }
  }

  // ✅ Função de upsert com tipos corretos
  private async upsertImoveis(imoveis: ImovelExtended[]): Promise<void> {
    console.log(`💾 Salvando/atualizando ${imoveis.length} imóveis...`);

    try {
      const batchSize = 50;
      for (let i = 0; i < imoveis.length; i += batchSize) {
        const batch = imoveis.slice(i, i + batchSize);
        
        const { error } = await this.supabase
          .from('imoveis')
          .upsert(batch, {
            onConflict: 'external_id,fonte_api'
          });

        if (error) {
          throw new Error(`Erro ao salvar lote: ${error.message}`);
        }

        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Upsert concluído: ${imoveis.length} imóveis`);
      
    } catch (error) {
      console.error('❌ Erro no upsert:', error);
      throw error;
    }
  }

  // ✅ Limpeza com tipagem correta para resposta do Supabase
  async cleanupOldDeletedImoveis(config: ExternalAPIConfig): Promise<number> {
    if (config.deletionStrategy !== 'soft_delete' || !config.keepDaysBeforeDelete) {
      return 0;
    }

    console.log(`🧹 Limpando imóveis excluídos há mais de ${config.keepDaysBeforeDelete} dias`);

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - config.keepDaysBeforeDelete);

      // ✅ Primeiro contar quantos registros serão deletados
      const { count, error: countError } = await this.supabase
        .from('imoveis')
        .select('*', { count: 'exact', head: true })
        .eq('fonte_api', config.id)
        .eq('is_active', false)
        .not('deleted_at', 'is', null)
        .lt('deleted_at', cutoffDate.toISOString());

      if (countError) {
        throw new Error(`Erro ao contar registros: ${countError.message}`);
      }

      const recordCount = count || 0;

      if (recordCount === 0) {
        console.log('✅ Nenhum registro para limpar');
        return 0;
      }

      // Agora fazer a deleção
      const { error: deleteError } = await this.supabase
        .from('imoveis')
        .delete()
        .eq('fonte_api', config.id)
        .eq('is_active', false)
        .not('deleted_at', 'is', null)
        .lt('deleted_at', cutoffDate.toISOString());

      if (deleteError) {
        throw new Error(`Erro na limpeza: ${deleteError.message}`);
      }

      console.log(`✅ Limpeza concluída: ${recordCount} imóveis removidos definitivamente`);
      return recordCount;

    } catch (error) {
      console.error('❌ Erro na limpeza:', error);
      return 0;
    }
  }

  // ✅ Implementação do saveSyncLog
  private async saveSyncLog(log: SyncLog): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('sync_logs')
        .insert([{
          api_config_id: log.apiConfigId,
          timestamp: log.timestamp.toISOString(),
          status: log.status,
          total_processed: log.totalProcessed,
          total_errors: log.totalErrors,
          total_deleted: log.totalDeleted || 0,
          error_messages: log.errorMessages || [],
          deleted_ids: log.deletedIds || [],
          duration: log.duration
        }]);

      if (error) {
        console.error('Erro ao salvar log:', error);
      }
    } catch (error) {
      console.error('Erro ao salvar log:', error);
    }
  }

  // ✅ Processar dados recebidos via webhook
  async processWebhookData(config: ExternalAPIConfig, payload: unknown): Promise<{
    processed: number;
    errors: number;
    errorMessages: string[];
  }> {
    console.log(`🔄 Processando webhook data para ${config.name}`);
    
    try {
      const mapper = new DataMapper(config.mapping);
      const processedData: ImovelExtended[] = [];
      const errorMessages: string[] = [];

      // Normalizar payload para array de forma type-safe
      let items: unknown[] = [];
      
      if (Array.isArray(payload)) {
        items = payload;
      } else if (payload && typeof payload === 'object') {
        items = [payload];
      } else {
        throw new Error('Payload inválido recebido no webhook');
      }

      for (const item of items) {
        try {
          // Type assertion segura após validação
          const mappedItem = mapper.mapToInternal(item as ExternalImovelData);
          const validation = mapper.validateMappedData(mappedItem);
          
          if (validation.valid) {
            processedData.push({
              ...mappedItem,
              external_id: mappedItem.id,
              fonte_api: config.id,
              is_active: true,
              deleted_at: null,
              data_sincronizacao: new Date()
            });
          } else {
            errorMessages.push(`Item ${mappedItem.id}: ${validation.errors.join(', ')}`);
          }
        } catch (error) {
          errorMessages.push(`Erro ao processar item: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }

      // Salvar dados válidos usando o método existente
      if (processedData.length > 0) {
        await this.upsertImoveis(processedData);
      }

      // Criar e salvar log do webhook
      const syncLog: SyncLog = {
        id: this.generateId(),
        apiConfigId: config.id,
        timestamp: new Date(),
        status: errorMessages.length > 0 ? 'partial' : 'success',
        totalProcessed: processedData.length,
        totalErrors: errorMessages.length,
        totalDeleted: 0,
        errorMessages,
        deletedIds: [],
        duration: 0 // Processamento instantâneo para webhook
      };

      await this.saveSyncLog(syncLog);

      return {
        processed: processedData.length,
        errors: errorMessages.length,
        errorMessages
      };

    } catch (error) {
      console.error('❌ Erro no processamento do webhook:', error);
      throw error;
    }
  }

  private generateId(): string {
    // Gerar ID único para o log
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}