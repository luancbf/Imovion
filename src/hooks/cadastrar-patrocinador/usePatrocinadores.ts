import { useState, useEffect, useCallback } from 'react';
import { Patrocinador } from '@/types/cadastrar-patrocinador';
import { supabase } from '@/lib/supabase';

// TIPOS ATUALIZADOS
interface PatrocinadorDB {
  id: string;
  nome: string;
  slug: string;
  telefone?: string;
  creci?: string;
  ownerid: string;
  criadoem: string;
  atualizadoem: string;
  user_id?: string | null;
}

interface SupabaseRowUnknown {
  id?: unknown;
  nome?: unknown;
  slug?: unknown;
  telefone?: unknown;
  creci?: unknown;
  ownerid?: unknown;
  criadoem?: unknown;
  atualizadoem?: unknown;
  user_id?: unknown;
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
    ownerId: item.ownerid,
    criadoEm: item.criadoem,
    atualizadoEm: item.atualizadoem,
    user_id: item.user_id || null,
    user_profile: null // Será preenchido posteriormente
  });

  const isValidPatrocinadorDB = (item: SupabaseRowUnknown): item is PatrocinadorDB => {
    return typeof item?.id === 'string' && 
           typeof item?.nome === 'string' && 
           typeof item?.slug === 'string' &&
           typeof item?.ownerid === 'string' &&
           typeof item?.criadoem === 'string' &&
           typeof item?.atualizadoem === 'string' &&
           item.id.length > 0 &&
           item.nome.length > 0 &&
           item.slug.length > 0;
  };

  // OPERAÇÕES DE LEITURA
  const loadPatrocinadores = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: supabaseError } = await supabase
        .from('patrocinadores')
        .select('id, nome, slug, telefone, creci, ownerid, criadoem, atualizadoem, user_id')
        .order('criadoem', { ascending: false });

      if (supabaseError) {
        setError(`Erro: ${supabaseError.message}`);
        setPatrocinadores([]);
        setLoading(false);
        return;
      }

      // Buscar dados dos usuários vinculados em uma query separada
      const patrocsWithUsers: Patrocinador[] = [];
      
      for (const patroc of data || []) {
        if (isValidPatrocinadorDB(patroc)) {
          const mapped = mapPatrocinadorFromDB(patroc);
          
          // Se tem user_id, buscar dados do usuário
          if (patroc.user_id) {
            const { data: userData } = await supabase
              .from('profiles')
              .select('id, nome, sobrenome, categoria, email')
              .eq('id', patroc.user_id)
              .single();
            
            mapped.user_profile = userData || null;
          }
          
          patrocsWithUsers.push(mapped);
        }
      }

      const validPatrocinadores = patrocsWithUsers;

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

      const dados = {
        nome: nome.trim(),
        slug: gerarSlug(nome.trim()),
        telefone: telefone?.trim() ? formatarTelefone(telefone.trim()) : null,
        creci: creci?.trim() || null,
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

      const dados = {
        nome: nome.trim(),
        slug: gerarSlug(nome.trim()),
        telefone: telefone?.trim() ? formatarTelefone(telefone.trim()) : null,
        creci: creci?.trim() || null
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
    patrocinadores,
    loading,
    error,
    loadPatrocinadores,
    createPatrocinador,
    updatePatrocinador,
    deletePatrocinador,
    getPatrocinadorById,
    searchPatrocinadores,
    getStats,
    validatePatrocinador,
    gerarSlug,
    validarTelefone,
    formatarTelefone,
    clearError,
    isConfigured: true,
    stats: getStats()
  } as const;
};

export type UsePatrocinadoresReturn = ReturnType<typeof usePatrocinadores>;
export type { PatrocinadorValidation, PatrocinadoresStats };

export const usePatrocinadorById = (id: string | null) => {
  const { getPatrocinadorById } = usePatrocinadores();
  return id ? getPatrocinadorById(id) : undefined;
};