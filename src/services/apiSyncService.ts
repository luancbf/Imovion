// src/services/apiSyncService.ts
import { supabase } from '@/lib/supabase';
import { transformApiDataToImovel } from '@/utils/apiDataTransform';
import { Imovel } from '@/types/Imovel';

// ✅ Interfaces específicas para configuração da API
interface ApiConfig {
  id: string;
  name: string;
  endpoint: string;
  token: string;
  is_active: boolean;
  headers?: Record<string, string>;
  timeout?: number;
}

// ✅ Interface para dados externos da API
interface ExternalApiData {
  imoveis?: Record<string, unknown>[];
  properties?: Record<string, unknown>[];
  data?: Record<string, unknown>[];
  [key: string]: unknown;
}

export class ApiSyncService {
  
  async syncFromApi(apiName: string, apiConfig: ApiConfig): Promise<void> {
    try {
      console.log(`🔄 Iniciando sincronização da API: ${apiName}`);
      
      // 1. Buscar dados da API externa
      const externalData = await this.fetchFromExternalApi(apiConfig);
      
      // 2. Transformar cada item usando o mapeamento
      const transformedImoveis = externalData.map((item: Record<string, unknown>) => {
        return transformApiDataToImovel(item, apiName);
      });
      
      // 3. Salvar no banco de dados
      for (const imovel of transformedImoveis) {
        await this.saveOrUpdateImovel(imovel, apiName);
      }
      
      console.log(`✅ Sincronização concluída: ${transformedImoveis.length} imóveis`);
      
    } catch (error) {
      console.error(`❌ Erro na sincronização da API ${apiName}:`, error);
      throw error;
    }
  }

  private async fetchFromExternalApi(apiConfig: ApiConfig): Promise<Record<string, unknown>[]> {
    try {
      // Implementação específica para cada API
      const response = await fetch(apiConfig.endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiConfig.token}`,
          'Content-Type': 'application/json',
          ...apiConfig.headers // Headers adicionais se necessário
        },
        signal: apiConfig.timeout ? AbortSignal.timeout(apiConfig.timeout) : undefined
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${response.statusText}`);
      }
      
      const data: ExternalApiData = await response.json();
      
      // Extrair array de imóveis da resposta (adaptar conforme a estrutura)
      if (data.imoveis && Array.isArray(data.imoveis)) {
        return data.imoveis;
      }
      
      if (data.properties && Array.isArray(data.properties)) {
        return data.properties;
      }
      
      if (data.data && Array.isArray(data.data)) {
        return data.data;
      }
      
      // Se a resposta for diretamente um array
      if (Array.isArray(data)) {
        return data as Record<string, unknown>[];
      }
      
      console.warn('Estrutura de dados desconhecida da API:', data);
      return [];
      
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Erro ao buscar dados da API: ${error.message}`);
        throw new Error(`Falha na comunicação com API: ${error.message}`);
      }
      throw new Error('Erro desconhecido ao buscar dados da API');
    }
  }

  private async saveOrUpdateImovel(imovel: Partial<Imovel>, apiName: string): Promise<void> {
    try {
      if (!imovel.external_id) {
        console.warn('Imóvel sem external_id, pulando:', imovel);
        return;
      }

      // Verificar se já existe pelo external_id
      const { data: existing, error: selectError } = await supabase
        .from('imoveis')
        .select('id')
        .eq('external_id', imovel.external_id)
        .eq('fonte_api', apiName)
        .maybeSingle(); // Use maybeSingle em vez de single para evitar erro se não existir

      if (selectError) {
        console.error('Erro ao verificar imóvel existente:', selectError);
        throw selectError;
      }

      const imovelData = {
        ...imovel,
        data_atualizacao: new Date().toISOString(),
        fonte_api: apiName,
        ativo: true // Imóveis de API são ativos por padrão
      };

      if (existing) {
        // Atualizar existente
        const { error: updateError } = await supabase
          .from('imoveis')
          .update(imovelData)
          .eq('id', existing.id);
          
        if (updateError) {
          console.error('Erro ao atualizar imóvel:', updateError);
          throw updateError;
        }
        
        console.log(`📝 Imóvel atualizado: ${imovel.external_id}`);
      } else {
        // Criar novo
        const { error: insertError } = await supabase
          .from('imoveis')
          .insert({
            ...imovelData,
            data_sincronizacao: new Date().toISOString()
          });
          
        if (insertError) {
          console.error('Erro ao inserir imóvel:', insertError);
          throw insertError;
        }
        
        console.log(`✅ Novo imóvel criado: ${imovel.external_id}`);
      }
    } catch (error) {
      console.error(`Erro ao salvar imóvel ${imovel.external_id}:`, error);
      throw error;
    }
  }

  // ✅ Método para testar conectividade da API
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

  // ✅ Método para obter estatísticas da sincronização
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
      
      // Encontrar a sync mais recente
      const ultimaSync = data.reduce((latest, item) => {
        if (!item.data_sincronizacao) return latest;
        if (!latest) return item.data_sincronizacao;
        return new Date(item.data_sincronizacao) > new Date(latest) 
          ? item.data_sincronizacao 
          : latest;
      }, null as string | null);

      return { total, ativo, inativo, ultimaSync };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return { total: 0, ativo: 0, inativo: 0, ultimaSync: null };
    }
  }
}