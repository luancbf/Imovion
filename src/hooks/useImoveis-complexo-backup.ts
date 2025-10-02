/**
 * Hook para carregamento otimizado de imóveis com cache e debounce
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import logger from '@/utils/logger';
import type { Imovel } from '@/types/Imovel';

interface FiltrosImoveis {
  tipoNegocio: string;
  setorNegocio: string;
  usuario: string;
  codigoImovel: string;
}

interface UseImoveisResult {
  imoveis: Imovel[];
  carregando: boolean;
  erro: string | null;
  recarregar: () => void;
}

// Cache global para imóveis
const imoveisCache = new Map<string, { data: Imovel[]; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos

export const useImoveis = (filtros: FiltrosImoveis): UseImoveisResult => {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  
  // Log de debug para verificar se o hook está sendo chamado
  useEffect(() => {
    logger.hooks.debug('useImoveis', 'Hook inicializado com filtros:', filtros);
  }, [filtros]);
  
  // Refs para controle
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const lastFiltersRef = useRef<string>('');
  const hasLoadedRef = useRef(false);

  // Verificar se cache é válido
  const isCacheValid = useCallback((key: string): boolean => {
    const cached = imoveisCache.get(key);
    if (!cached) return false;
    
    const now = Date.now();
    const isValid = (now - cached.timestamp) < CACHE_DURATION;
    
    if (!isValid) {
      imoveisCache.delete(key);
    }
    
    return isValid;
  }, []);

  // Função para carregar imóveis
  const carregarImoveis = useCallback(async (
    filtrosAtivos: FiltrosImoveis, 
    forceReload = false
  ) => {
    if (!isMountedRef.current) return;

    logger.hooks.info('useImoveis', 'Iniciando carregamento de imóveis:', filtrosAtivos);

    const key = `imoveis-${JSON.stringify(filtrosAtivos)}`;
    
    // Verificar cache primeiro (apenas se não for força reload)
    if (!forceReload && isCacheValid(key)) {
      const cached = imoveisCache.get(key)!;
      logger.hooks.debug('useImoveis', 'Usando cache de imóveis');
      setImoveis(cached.data);
      setCarregando(false);
      return;
    }

    // Cancelar requisições anteriores
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Nova requisição
    abortControllerRef.current = new AbortController();
    setCarregando(true);
    setErro(null);
    
    logger.hooks.info('useImoveis', 'Fazendo consulta ao Supabase...');

    try {
      let query = supabase
        .from('imoveis')
        .select('*')
        .order('datacadastro', { ascending: false })
        .abortSignal(abortControllerRef.current.signal);
      
      // Aplicar filtros
      if (filtrosAtivos.tipoNegocio) {
        query = query.eq('tiponegocio', filtrosAtivos.tipoNegocio);
      }
      if (filtrosAtivos.setorNegocio) {
        query = query.eq('setornegocio', filtrosAtivos.setorNegocio);
      }
      if (filtrosAtivos.usuario) {
        query = query.eq('user_id', filtrosAtivos.usuario);
      }
      if (filtrosAtivos.codigoImovel) {
        query = query.ilike('codigoimovel', `%${filtrosAtivos.codigoImovel}%`);
      }
      
      const { data: imoveisData, error: imoveisError } = await query;
      
      logger.hooks.info('useImoveis', 'Resultado da consulta:', { 
        data: imoveisData ? `${imoveisData.length} imóveis` : 'null', 
        error: imoveisError?.message || 'nenhum erro' 
      });
      
      if (!isMountedRef.current) return;
      
      if (imoveisError) {
        logger.hooks.error('useImoveis', 'Erro ao carregar imóveis:', imoveisError);
        setErro(`Erro ao carregar imóveis: ${imoveisError.message}`);
        setImoveis([]);
      } else {
        const resultados = (imoveisData as Imovel[]) || [];
        
        logger.hooks.info('useImoveis', `✅ ${resultados.length} imóveis carregados com sucesso`);
        
        // Atualizar cache
        imoveisCache.set(key, {
          data: resultados,
          timestamp: Date.now()
        });
        
        setImoveis(resultados);
        setErro(null);
        
        logger.hooks.info('useImoveis', `Carregados ${resultados.length} imóveis`);
      }
      
    } catch (error: unknown) {
      if (!isMountedRef.current) return;
      
      // Ignorar erros de abort
      if (error instanceof Error && error.name === 'AbortError') {
        logger.hooks.debug('useImoveis', 'Requisição cancelada');
        return;
      }
      
      logger.hooks.error('useImoveis', 'Erro inesperado:', error);
      setErro('Erro inesperado ao carregar imóveis');
      setImoveis([]);
    } finally {
      if (isMountedRef.current) {
        setCarregando(false);
      }
    }
  }, [isCacheValid]);

  // Debounced carregamento
  const debouncedCarregar = useCallback((filtrosAtivos: FiltrosImoveis) => {
    // Limpar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Verificar se filtros mudaram
    const newFiltersString = JSON.stringify(filtrosAtivos);
    logger.hooks.debug('useImoveis', 'debouncedCarregar:', { 
      newFilters: newFiltersString, 
      lastFilters: lastFiltersRef.current,
      changed: newFiltersString !== lastFiltersRef.current
    });
    
    if (newFiltersString === lastFiltersRef.current) {
      logger.hooks.debug('useImoveis', 'Filtros não mudaram - ignorando');
      return; // Filtros não mudaram
    }
    
    lastFiltersRef.current = newFiltersString;

    // Debounce de 300ms para filtros de texto
    const hasTextFilter = filtrosAtivos.codigoImovel.length > 0;
    const debounceTime = hasTextFilter ? 300 : 100;

    logger.hooks.debug('useImoveis', `Agendando carregamento com debounce de ${debounceTime}ms`);

    debounceTimeoutRef.current = setTimeout(() => {
      carregarImoveis(filtrosAtivos);
    }, debounceTime);
  }, [carregarImoveis]);

  // Effect para reagir a mudanças nos filtros
  useEffect(() => {
    logger.hooks.debug('useImoveis', 'Effect dos filtros chamado:', { 
      filtros, 
      hasLoaded: hasLoadedRef.current,
      isMounted: isMountedRef.current 
    });
    
    // Na primeira vez ou quando há filtros ativos, carregar imediatamente
    if (!hasLoadedRef.current) {
      logger.hooks.info('useImoveis', '🚀 PRIMEIRA CARGA DE IMÓVEIS');
      hasLoadedRef.current = true;
      carregarImoveis(filtros);
      return;
    }
    
    // Para mudanças subsequentes, usar debounce
    logger.hooks.debug('useImoveis', 'Usando debounce para filtros subsequentes');
    debouncedCarregar(filtros);
  }, [filtros, debouncedCarregar, carregarImoveis]);

  // Função para recarregar forçadamente
  const recarregar = useCallback(() => {
    logger.hooks.info('useImoveis', 'Recarregamento forçado solicitado');
    carregarImoveis(filtros, true);
  }, [filtros, carregarImoveis]);

  return {
    imoveis,
    carregando,
    erro,
    recarregar
  };
};

// Função para limpar cache (útil para invalidação)
export const limparCacheImoveis = () => {
  imoveisCache.clear();
  logger.hooks.info('useImoveis', 'Cache de imóveis limpo');
};

export default useImoveis;