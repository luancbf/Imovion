import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from '@supabase/supabase-js';
import { Patrocinador } from '@/types/cadastrar-patrocinador';

// ========================
// CONFIGURAÇÃO
// ========================
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const isSupabaseConfigured = !!(supabaseUrl && supabaseKey);

let supabase: SupabaseClient | null = null;
if (isSupabaseConfigured) {
  try {
    supabase = createBrowserClient(supabaseUrl!, supabaseKey!);
    console.log('✅ Cliente Supabase criado');
  } catch (error) {
    console.warn('⚠️ Erro ao criar cliente Supabase:', error);
  }
} else {
  console.warn('❌ Supabase não configurado');
}

// ========================
// TIPOS ATUALIZADOS
// ========================

// Tipo para dados brutos do Supabase
interface PatrocinadorDB {
  id: string;
  nome: string;
  slug: string;
  telefone?: string; // ✅ NOVO: Campo telefone
  ownerId: string;
  criadoEm: string;
  atualizadoEm: string;
  // ❌ REMOVIDO: bannerUrl
}

// Tipo para dados desconhecidos vindos do Supabase
interface SupabaseRowUnknown {
  id?: unknown;
  nome?: unknown;
  slug?: unknown;
  telefone?: unknown; // ✅ NOVO: Campo telefone
  ownerId?: unknown;  
  criadoEm?: unknown;
  atualizadoEm?: unknown;
  // ❌ REMOVIDO: bannerUrl
}

interface PatrocinadorValidation {
  valid: boolean;
  error?: string;
}

interface PatrocinadoresStats {
  total: number;
  comTelefone: number; // ✅ ALTERADO: de comBanner para comTelefone
  thisMonth: number;
}

// ========================
// DADOS MOCK
// ========================
const mockData: Patrocinador[] = [
  {
    id: 'mock-1',
    nome: 'Construtora ABC',
    slug: 'construtora-abc',
    telefone: '(11) 99999-1234', // ✅ NOVO: Campo telefone
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    ownerId: 'mock-user'
  },
  {
    id: 'mock-2',
    nome: 'Imobiliária XYZ',
    slug: 'imobiliaria-xyz',
    telefone: '(11) 88888-5678', // ✅ NOVO: Campo telefone
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    ownerId: 'mock-user'
  }
];

// ========================
// HOOK PRINCIPAL
// ========================
export const usePatrocinadores = () => {
  const [patrocinadores, setPatrocinadores] = useState<Patrocinador[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(!isSupabaseConfigured);

  // ========================
  // UTILITÁRIOS
  // ========================
  const gerarSlug = useCallback((texto: string): string => {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/^-+|-+$/g, '');
  }, []);

  // ✅ NOVO: Validação de telefone
  const validarTelefone = useCallback((telefone: string): boolean => {
    if (!telefone?.trim()) return true; // Telefone é opcional
    
    // Remove tudo que não é número
    const numeros = telefone.replace(/\D/g, '');
    
    // Aceita 10 ou 11 dígitos (com ou sem 9 no celular)
    return numeros.length >= 10 && numeros.length <= 11;
  }, []);

  // ✅ NOVO: Formatar telefone
  const formatarTelefone = useCallback((telefone: string): string => {
    if (!telefone?.trim()) return '';
    
    const numeros = telefone.replace(/\D/g, '');
    
    if (numeros.length === 10) {
      // (11) 1234-5678
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 6)}-${numeros.slice(6)}`;
    } else if (numeros.length === 11) {
      // (11) 91234-5678
      return `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7)}`;
    }
    
    return telefone; // Retorna original se não conseguir formatar
  }, []);

  // Função para mapear dados do banco para o formato do app
  const mapPatrocinadorFromDB = (item: PatrocinadorDB): Patrocinador => ({
    id: item.id,
    nome: item.nome,
    slug: item.slug,
    telefone: item.telefone || undefined, // ✅ NOVO: Campo telefone
    ownerId: item.ownerId,
    criadoEm: item.criadoEm,
    atualizadoEm: item.atualizadoEm
    // ❌ REMOVIDO: bannerUrl
  });

  // Validação atualizada
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

  // ========================
  // OPERAÇÕES DE LEITURA
  // ========================
  const loadPatrocinadores = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      if (!supabase || useMockData) {
        console.log('🔄 Usando dados mock...');
        await new Promise(resolve => setTimeout(resolve, 300));
        setPatrocinadores(mockData);
        if (!isSupabaseConfigured) {
          setError('⚠️ Modo desenvolvimento: Configure o Supabase para dados reais');
        }
        return;
      }

      console.log('🔄 Carregando do Supabase...');

      const { data, error: supabaseError } = await supabase
        .from('patrocinadores')
        .select('*')
        .order('criadoEm', { ascending: false });

      if (supabaseError) {
        console.error('❌ Erro Supabase:', supabaseError);
        setUseMockData(true);
        setPatrocinadores(mockData);
        setError(`Erro: ${supabaseError.message}. Usando dados mock.`);
        return;
      }

      console.log('📊 Dados recebidos:', data);

      const validPatrocinadores = (data || [])
        .filter(isValidPatrocinadorDB)
        .map(mapPatrocinadorFromDB);

      console.log('✅ Patrocinadores válidos:', validPatrocinadores.length);
      setPatrocinadores(validPatrocinadores);
      
    } catch (error) {
      console.error('❌ Erro ao carregar:', error);
      setUseMockData(true);
      setPatrocinadores(mockData);
      setError('Erro de conexão. Usando dados mock.');
    } finally {
      setLoading(false);
    }
  }, [useMockData]);

  // ========================
  // VALIDAÇÕES ATUALIZADAS
  // ========================
  const validatePatrocinador = useCallback((nome: string, telefone?: string, editingId?: string): PatrocinadorValidation => {
    const nomeTrim = nome?.trim();
    
    if (!nomeTrim) return { valid: false, error: 'Nome é obrigatório' };
    if (nomeTrim.length < 2) return { valid: false, error: 'Mínimo 2 caracteres' };
    if (nomeTrim.length > 100) return { valid: false, error: 'Máximo 100 caracteres' };

    // ✅ NOVO: Validar telefone se fornecido
    if (telefone?.trim() && !validarTelefone(telefone)) {
      return { valid: false, error: 'Telefone inválido (use formato: (11) 99999-1234)' };
    }

    const slug = gerarSlug(nomeTrim);
    const slugExists = patrocinadores.some(p => p.slug === slug && p.id !== editingId);
    
    if (slugExists) return { valid: false, error: 'Nome já existe' };
    return { valid: true };
  }, [patrocinadores, gerarSlug, validarTelefone]);

  // ========================
  // OPERAÇÕES CRUD ATUALIZADAS
  // ========================
  const createPatrocinador = useCallback(async (nome: string, telefone?: string, userId = 'system'): Promise<string> => {
    setError(null);

    const validation = validatePatrocinador(nome, telefone);
    if (!validation.valid) throw new Error(validation.error);

    // Mock
    if (useMockData || !supabase) {
      const novoId = `mock-${Date.now()}`;
      const novo: Patrocinador = {
        id: novoId,
        nome: nome.trim(),
        slug: gerarSlug(nome.trim()),
        telefone: telefone?.trim() ? formatarTelefone(telefone.trim()) : undefined, // ✅ NOVO
        ownerId: userId,
        criadoEm: new Date().toISOString(),
        atualizadoEm: new Date().toISOString()
      };
      setPatrocinadores(prev => [novo, ...prev]);
      return novoId;
    }

    // Supabase
    const dados = {
      nome: nome.trim(),
      slug: gerarSlug(nome.trim()),
      telefone: telefone?.trim() ? formatarTelefone(telefone.trim()) : null, // ✅ NOVO
      ownerId: userId
    };

    console.log('📤 Inserindo dados:', dados);

    const { data, error: supabaseError } = await supabase
      .from('patrocinadores')
      .insert([dados])
      .select()
      .single();

    if (supabaseError) {
      console.error('❌ Erro ao inserir:', supabaseError);
      if (supabaseError.code === '23505') throw new Error('Nome já existe');
      throw new Error(`Erro: ${supabaseError.message}`);
    }

    console.log('✅ Patrocinador criado:', data);
    await loadPatrocinadores();
    return data.id;
  }, [validatePatrocinador, gerarSlug, formatarTelefone, loadPatrocinadores, useMockData]);

  const updatePatrocinador = useCallback(async (id: string, nome: string, telefone?: string): Promise<void> => {
    setError(null);

    const validation = validatePatrocinador(nome, telefone, id);
    if (!validation.valid) throw new Error(validation.error);

    // Mock
    if (useMockData || !supabase) {
      setPatrocinadores(prev => prev.map(p => 
        p.id === id 
          ? { 
              ...p, 
              nome: nome.trim(), 
              slug: gerarSlug(nome.trim()),
              telefone: telefone?.trim() ? formatarTelefone(telefone.trim()) : undefined, // ✅ NOVO
              atualizadoEm: new Date().toISOString()
            }
          : p
      ));
      return;
    }

    // Supabase
    const dados = {
      nome: nome.trim(),
      slug: gerarSlug(nome.trim()),
      telefone: telefone?.trim() ? formatarTelefone(telefone.trim()) : null // ✅ NOVO
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
  }, [validatePatrocinador, gerarSlug, formatarTelefone, loadPatrocinadores, useMockData]);

  const deletePatrocinador = useCallback(async (id: string): Promise<void> => {
    setError(null);

    // Mock
    if (useMockData || !supabase) {
      setPatrocinadores(prev => prev.filter(p => p.id !== id));
      return;
    }

    // Supabase
    const { error: supabaseError } = await supabase
      .from('patrocinadores')
      .delete()
      .eq('id', id);
    
    if (supabaseError) throw new Error(`Erro: ${supabaseError.message}`);
    await loadPatrocinadores();
  }, [loadPatrocinadores, useMockData]);

  // ========================
  // CONSULTAS
  // ========================
  const getPatrocinadorById = useCallback((id: string): Patrocinador | undefined => {
    return patrocinadores.find(p => p.id === id);
  }, [patrocinadores]);

  const searchPatrocinadores = useCallback((term: string): Patrocinador[] => {
    if (!term?.trim()) return patrocinadores;
    
    const search = term.toLowerCase().trim();
    return patrocinadores.filter(p => 
      p.nome?.toLowerCase().includes(search) ||
      p.slug?.toLowerCase().includes(search) ||
      p.telefone?.toLowerCase().includes(search) // ✅ NOVO: Buscar por telefone
    );
  }, [patrocinadores]);

  const getStats = useCallback((): PatrocinadoresStats => {
    const total = patrocinadores.length;
    const comTelefone = patrocinadores.filter(p => p.telefone).length; // ✅ ALTERADO
    const thisMonth = patrocinadores.filter(p => {
      if (!p.criadoEm) return false;
      const created = new Date(p.criadoEm);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length;

    return { total, comTelefone, thisMonth };
  }, [patrocinadores]);

  // ========================
  // UTILITÁRIOS
  // ========================
  const clearError = useCallback(() => setError(null), []);
  
  const switchToMockMode = useCallback(() => {
    setUseMockData(true);
    setPatrocinadores(mockData);
    setError('Modo mock ativado');
  }, []);

  const switchToSupabaseMode = useCallback(() => {
    if (isSupabaseConfigured) {
      setUseMockData(false);
      loadPatrocinadores();
    } else {
      alert('Supabase não configurado');
    }
  }, [loadPatrocinadores]);

  // ========================
  // EFEITO INICIAL
  // ========================
  useEffect(() => {
    loadPatrocinadores();
  }, [loadPatrocinadores]);

  // ========================
  // API ATUALIZADA
  // ========================
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
    // ❌ REMOVIDO: updatePatrocinadorBanner
    
    // Consultas
    getPatrocinadorById,
    searchPatrocinadores,
    getStats,
    
    // Validações
    validatePatrocinador,
    gerarSlug,
    validarTelefone, // ✅ NOVO
    formatarTelefone, // ✅ NOVO
    
    // Controles
    clearError,
    switchToMockMode,
    switchToSupabaseMode,
    
    // Info
    isConfigured: isSupabaseConfigured,
    isUsingMockData: useMockData,
    stats: getStats()
  } as const;
};

export type UsePatrocinadoresReturn = ReturnType<typeof usePatrocinadores>;
export type { PatrocinadorValidation, PatrocinadoresStats };

export const usePatrocinadorById = (id: string | null) => {
  const { getPatrocinadorById } = usePatrocinadores();
  return id ? getPatrocinadorById(id) : undefined;
};