'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface SyncLog {
  id: string;
  api_config_id: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning' | 'running';
  total_processed: number;
  total_errors: number;
  error_messages: string[];
  duration: number; // em segundos
  created_at: string;
  total_deleted: number;
  deleted_ids: string[];
}

export interface SyncStats {
  total_syncs: number;
  successful_syncs: number;
  failed_syncs: number;
  total_processed: number;
  total_errors: number;
  average_duration: number;
  last_sync: string | null;
}

export const useSyncLogs = () => {
  const [logs, setLogs] = useState<SyncLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar logs de sincronização
  const loadSyncLogs = useCallback(async (apiConfigId?: string, limit = 50) => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (apiConfigId) {
        query = query.eq('api_config_id', apiConfigId);
      }

      const { data, error: supabaseError } = await query;

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      setLogs(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar logs');
      console.error('Erro ao carregar sync logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criar novo log de sincronização
  const createSyncLog = useCallback(async (dados: Omit<SyncLog, 'id' | 'created_at'>): Promise<string> => {
    try {
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
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar log');
    }
  }, []);

  // Atualizar log existente (para logs em andamento)
  const updateSyncLog = useCallback(async (
    id: string, 
    updates: Partial<Omit<SyncLog, 'id' | 'api_config_id' | 'created_at'>>
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from('sync_logs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar log');
    }
  }, []);

  // Obter estatísticas de sincronização
  const getSyncStats = useCallback(async (apiConfigId?: string): Promise<SyncStats> => {
    try {
      let query = supabase.from('sync_logs').select('*');
      
      if (apiConfigId) {
        query = query.eq('api_config_id', apiConfigId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const logs = data || [];
      
      const stats: SyncStats = {
        total_syncs: logs.length,
        successful_syncs: logs.filter(log => log.status === 'success').length,
        failed_syncs: logs.filter(log => log.status === 'error').length,
        total_processed: logs.reduce((sum, log) => sum + (log.total_processed || 0), 0),
        total_errors: logs.reduce((sum, log) => sum + (log.total_errors || 0), 0),
        average_duration: logs.length > 0 
          ? logs.reduce((sum, log) => sum + (log.duration || 0), 0) / logs.length 
          : 0,
        last_sync: logs.length > 0 
          ? logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
          : null
      };

      return stats;
    } catch (err) {
      console.error('Erro ao calcular estatísticas:', err);
      return {
        total_syncs: 0,
        successful_syncs: 0,
        failed_syncs: 0,
        total_processed: 0,
        total_errors: 0,
        average_duration: 0,
        last_sync: null
      };
    }
  }, []);

  // Limpar logs antigos (manutenção)
  const cleanOldLogs = useCallback(async (daysToKeep = 30): Promise<number> => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { data, error } = await supabase
        .from('sync_logs')
        .delete()
        .lt('created_at', cutoffDate.toISOString())
        .select('id');

      if (error) throw error;

      return (data || []).length;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao limpar logs');
    }
  }, []);

  // Helper para iniciar um novo log de sincronização
  const startSyncSession = useCallback(async (apiConfigId: string): Promise<{
    logId: string;
    updateLog: (updates: Partial<SyncLog>) => Promise<void>;
    finishLog: (status: 'success' | 'error', finalData?: Partial<SyncLog>) => Promise<void>;
  }> => {
    const startTime = Date.now();
    
    const logId = await createSyncLog({
      api_config_id: apiConfigId,
      timestamp: new Date().toISOString(),
      status: 'running',
      total_processed: 0,
      total_errors: 0,
      error_messages: [],
      duration: 0,
      total_deleted: 0,
      deleted_ids: []
    });

    const updateLog = async (updates: Partial<SyncLog>) => {
      await updateSyncLog(logId, updates);
    };

    const finishLog = async (status: 'success' | 'error', finalData?: Partial<SyncLog>) => {
      const duration = Math.round((Date.now() - startTime) / 1000);
      
      await updateSyncLog(logId, {
        status,
        duration,
        ...finalData
      });
    };

    return { logId, updateLog, finishLog };
  }, [createSyncLog, updateSyncLog]);

  return {
    logs,
    loading,
    error,
    // Métodos de leitura
    loadSyncLogs,
    getSyncStats,
    // Métodos de escrita
    createSyncLog,
    updateSyncLog,
    // Métodos de manutenção
    cleanOldLogs,
    // Helper para sessões de sync
    startSyncSession
  };
};