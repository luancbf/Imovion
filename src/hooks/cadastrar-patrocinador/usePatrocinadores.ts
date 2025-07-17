import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from '@supabase/supabase-js';
import { Patrocinador } from '@/types/cadastrar-patrocinador';

// CONFIGURAÇÃO
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabase = createBrowserClient(supabaseUrl!, supabaseKey!);
  } catch {
    // Nenhuma ação necessária
  }
}

// TIPOS ATUALIZADOS

// Tipo para dados brutos do Supabase
interface PatrocinadorDB {
  id: string;
  nome: string;
  slug: string;
  telefone?: string;
  creci?: string;
  ownerId: string;
  criadoEm: string;
  atualizadoEm: string;
}

// Tipo para dados desconhecidos vindos do Supabase
interface SupabaseRowUnknown {
  id?: unknown;
  nome?: unknown;
  slug?: unknown;
  telefone?: unknown;
  creci?: unknown;
  ownerId?: unknown;
  criadoEm?: unknown;
  atualizadoEm?: unknown;
}

interface PatrocinadorValidation {
  valid: boolean;
  error?: string;
}

interface PatrocinadoresStats {
  total: number;
  comTelefone: number;
  thisMonth: number;
}

// HOOK PRINCIPAL
export const usePatrocinadores = () => {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // UTILITÁRIOS
  const gerarSlug = useCallback((texto: string): string => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');
  }, []);

  const validarTelefone = useCallback((telefone: string): boolean => {
    if (!telefone?.trim()) return true;
    
    const numeros = telefone.replace(/\D/g, '');
    
    return numeros.length >= 10 && numeros.length <= 11;
  }, []);

  const formatarTelefone = useCallback((telefone: string): string => {
    if (!telefone?.trim()) return '';
    
    const numeros = telefone.replace(/\D/g, '');
    
    if (numeros.length === 10) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    } else if (numeros.length === 11) {
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    
    return telefone;
  }, []);

  const mapPatrocinadorFromDB = (item: PatrocinadorDB): Patrocinador => ({
    id: item.id,
    nome: item.nome,
    slug: item.slug,
    telefone: item.telefone || undefined,
    creci: item.creci || undefined,
    ownerId: item.ownerId,
    criadoEm: item.criadoEm,
    atualizadoEm: item.atualizadoEm
  });

  const isValidPatrocinadorDB = (item: SupabaseRowUnknown): item is PatrocinadorDB => {
    return typeof item?.id === 'string' && 
           typeof item?.nome === 'string' && 
           typeof item?.slug === 'string' &&
           typeof item?.ownerId === 'string' &&
           typeof item?.criadoEm === 'string' &&
           typeof item?.atualizadoEm === 'string' &&
           item.id.length > 0 &&
           item.nome.length > 0 &&
           item.slug.length > 0;
  };

  // OPERAÇÕES DE LEITURA
  const loadPatrocinadores = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    if (!supabase) {
      setError('Supabase não configurado');
      setLoading(false);
      return;
    }

    try {
      const { data, error: supabaseError } = await supabase
        .from('patrocinadores')
        .select('id, nome, slug, telefone, creci, ownerId, criadoEm, atualizadoEm')
        .order('criadoEm', { ascending: false });

      if (supabaseError) {
        setError(`Erro: ${supabaseError.message}`);
        setPatrocinadores([]);
        setLoading(false);
        return;
      }

      const validPatrocinadores = (data || [])
        .filter(isValidPatrocinadorDB)
        .map(mapPatrocinadorFromDB);

      setPatrocinadores(validPatrocinadores);
    } catch {
      setError('Erro de conexão.');
      setPatrocinadores([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // VALIDAÇÕES ATUALIZADAS
  const validatePatrocinador = useCallback((nome: string, telefone?: string, editingId?: string): PatrocinadorValidation => {
    const nomeTrim = nome?.trim();
    
    if (!nomeTrim) return { valid: false, error: 'Nome é obrigatório' };
    if (nomeTrim.length < 2) return { valid: false, error: 'Mínimo 2 caracteres' };
    if (nomeTrim.length > 100) return { valid: false, error: 'Máximo 100 caracteres' };

    if (telefone?.trim() && !validarTelefone(telefone)) {
      return { valid: false, error: 'Telefone inválido (use formato: (11) 99999-1234)' };
    }

    const slug = gerarSlug(nomeTrim);
    const slugExists = patrocinadores.some(p => p.slug === slug && p.id !== editingId);
    
    if (slugExists) return { valid: false, error: 'Nome já existe' };
    return { valid: true };
  }, [patrocinadores, gerarSlug, validarTelefone]);

  // OPERAÇÕES CRUD ATUALIZADAS
  const createPatrocinador = useCallback(
    async (nome: string, telefone?: string, creci?: string, userId = 'system'): Promise<string> => {
      setError(null);

      const validation = validatePatrocinador(nome, telefone);
      if (!validation.valid) throw new Error(validation.error);

      if (!supabase) throw new Error('Supabase não configurado');

      const dados = {
        nome: nome.trim(),
        slug: gerarSlug(nome.trim()),
        telefone: telefone?.trim() ? formatarTelefone(telefone.trim()) : null,
        creci: creci?.trim() || null, // <-- Agora funciona!
        ownerId: userId
      };

      const { data, error: supabaseError } = await supabase
        .from('patrocinadores')
        .insert([dados])
        .select()
        .single();

      if (supabaseError) {
        if (supabaseError.code === '23505') throw new Error('Nome já existe');
        throw new Error(`Erro: ${supabaseError.message}`);
      }

      await loadPatrocinadores();
      return data.id;
    }, [validatePatrocinador, gerarSlug, formatarTelefone, loadPatrocinadores]);

  const updatePatrocinador = useCallback(
    async (id: string, nome: string, telefone?: string, creci?: string): Promise<void> => {
      setError(null);

      const validation = validatePatrocinador(nome, telefone, id);
      if (!validation.valid) throw new Error(validation.error);

      if (!supabase) throw new Error('Supabase não configurado');

      const dados = {
        nome: nome.trim(),
        slug: gerarSlug(nome.trim()),
        telefone: telefone?.trim() ? formatarTelefone(telefone.trim()) : null,
        creci: creci?.trim() || null // <-- Adicione aqui
      };

      const { error: supabaseError } = await supabase
        .from('patrocinadores')
        .update(dados)
        .eq('id', id);

      if (supabaseError) {
        if (supabaseError.code === '23505') throw new Error('Nome já existe');
        throw new Error(`Erro: ${supabaseError.message}`);
      }

      await loadPatrocinadores();
    }, [validatePatrocinador, gerarSlug, formatarTelefone, loadPatrocinadores]);

  const deletePatrocinador = useCallback(async (id: string): Promise<void> => {
    setError(null);

    if (!supabase) throw new Error('Supabase não configurado');

    const { error: supabaseError } = await supabase
      .from('patrocinadores')
      .delete()
      .eq('id', id);

    if (supabaseError) throw new Error(`Erro: ${supabaseError.message}`);
    await loadPatrocinadores();
  }, [loadPatrocinadores]);

  // CONSULTAS
  const getPatrocinadorById = useCallback((id: string): Patrocinador | undefined => {
    return patrocinadores.find(p => p.id === id);
  }, [patrocinadores]);

  const searchPatrocinadores = useCallback((term: string): Patrocinador[] => {
    if (!term?.trim()) return patrocinadores;
    
    const search = term.toLowerCase().trim();
    return patrocinadores.filter(p => 
      p.nome?.toLowerCase().includes(search) ||
      p.slug?.toLowerCase().includes(search) ||
      p.telefone?.toLowerCase().includes(search) 
    );
  }, [patrocinadores]);

  const getStats = useCallback((): PatrocinadoresStats => {
    const total = patrocinadores.length;
    const comTelefone = patrocinadores.filter(p => p.telefone).length;
    const thisMonth = patrocinadores.filter(p => {
      if (!p.criadoEm) return false;
      const created = new Date(p.criadoEm);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;

    return { total, comTelefone, thisMonth };
  }, [patrocinadores]);

  // UTILITÁRIOS
  const clearError = useCallback(() => setError(null), []);
  
  // EFEITO INICIAL
  useEffect(() => {
    loadPatrocinadores();
  }, [loadPatrocinadores]);

  return {
    // Estados
    patrocinadores,
    loading,
    error,
    
    // CRUD
    loadPatrocinadores,
    createPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    
    // Consultas
    getPatrocinadorById,
    searchPatrocinadores,
    getStats,
    
    // Validações
    validatePatrocinador,
    gerarSlug,
    validarTelefone,
    formatarTelefone,
    
    // Controles
    clearError,
    
    // Info
    isConfigured: isSupabaseConfigured,
    stats: getStats()
  } as const;
};

export type UsePatrocinadoresReturn = ReturnType<typeof usePatrocinadores>;
export type { PatrocinadorValidation, PatrocinadoresStats };

export const usePatrocinadorById = (id: string | null) => {
  const { getPatrocinadorById } = usePatrocinadores();
  return id ? getPatrocinadorById(id) : undefined;
};