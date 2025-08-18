'use client';

import { useState, useCallback } from 'react';
import { PatrocinioConfig } from '@/types/cadastrar-patrocinador';

// Configuração das 16 posições disponíveis
const availablePatrocinioPositions = [
  { position: 0, name: 'Posição 1', description: 'Primeira posição', location: 'Linha 1 - Coluna 1' },
  { position: 1, name: 'Posição 2', description: 'Segunda posição', location: 'Linha 1 - Coluna 2' },
  { position: 2, name: 'Posição 3', description: 'Terceira posição', location: 'Linha 1 - Coluna 3' },
  { position: 3, name: 'Posição 4', description: 'Quarta posição', location: 'Linha 1 - Coluna 4' },
  { position: 4, name: 'Posição 5', description: 'Quinta posição', location: 'Linha 1 - Coluna 5' },
  { position: 5, name: 'Posição 6', description: 'Sexta posição', location: 'Linha 1 - Coluna 6' },
  { position: 6, name: 'Posição 7', description: 'Sétima posição', location: 'Linha 2 - Coluna 1' },
  { position: 7, name: 'Posição 8', description: 'Oitava posição', location: 'Linha 2 - Coluna 2' },
  { position: 8, name: 'Posição 9', description: 'Nona posição', location: 'Linha 2 - Coluna 3' },
  { position: 9, name: 'Posição 10', description: 'Décima posição', location: 'Linha 2 - Coluna 4' },
  { position: 10, name: 'Posição 11', description: 'Décima primeira posição', location: 'Linha 2 - Coluna 5' },
  { position: 11, name: 'Posição 12', description: 'Décima segunda posição', location: 'Linha 2 - Coluna 6' },
  { position: 12, name: 'Posição 13', description: 'Décima terceira posição', location: 'Linha 3 - Coluna 1' },
  { position: 13, name: 'Posição 14', description: 'Décima quarta posição', location: 'Linha 3 - Coluna 2' },
  { position: 14, name: 'Posição 15', description: 'Décima quinta posição', location: 'Linha 3 - Coluna 3' },
  { position: 15, name: 'Posição 16', description: 'Décima sexta posição', location: 'Linha 3 - Coluna 4' }
];

// Tipo para dados do Supabase
interface SupabasePatrocinioConfig {
  id: string;
  position: number;
  display_order?: number;
  image_name?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  patrocinador_id?: string | null;
  is_active: boolean;
  is_clickable?: boolean;
  created_at: string;
  updated_at: string;
  patrocinadores?: {
    id: string;
    nome: string;
    slug: string;
  }[] | {
    id: string;
    nome: string;
    slug: string;
  } | null;
}

// Tipo para dados de salvamento
interface SavePatrocinioData {
  position: number;
  image_name?: string | null;
  image_url?: string | null;
  image_alt?: string | null;
  patrocinador_id?: string | null;
  is_active: boolean;
  updated_at: string;
  display_order?: number;
  is_clickable?: boolean;
}

export const usePatrocinioConfig = () => {
  const [patrocinioConfigs, setPatrocinioConfigs] = useState<PatrocinioConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPositions, setUploadingPositions] = useState<Record<number, boolean>>({});

  // INFORMAÇÕES DA POSIÇÃO
  const getPatrocinioPositionInfo = useCallback((position: number) => {
    return availablePatrocinioPositions.find(pos => pos.position === position) || {
      position,
      name: `Posição ${position + 1}`,
      description: `Posição ${position + 1} de patrocínio`,
      location: 'Localização padrão'
    };
  }, []);

  // FUNÇÃO PARA REMOVER IMAGEM DO STORAGE
  const removeImageFromStorage = useCallback(async (imageUrl: string): Promise<void> => {
    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Extrair o caminho da URL
      const urlParts = imageUrl.split('/storage/v1/object/public/imagens/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        console.log(`🗑️ Removendo imagem de patrocínio do storage: ${filePath}`);
        
        const { error } = await supabase.storage
          .from('imagens')
          .remove([filePath]);

        if (error) {
          console.error('Erro ao remover imagem do storage:', error);
        } else {
          console.log('✅ Imagem de patrocínio removida com sucesso do storage');
        }
      }
    } catch (error) {
      console.error('Erro ao processar remoção da imagem de patrocínio:', error);
    }
  }, []);

  // FUNÇÃO AUXILIAR PARA CRIAR MOCK CONFIGS
  const createMockConfigs = useCallback((): PatrocinioConfig[] => {
    return availablePatrocinioPositions.map((positionConfig) => ({
      id: `mock-${positionConfig.position}`,
      position: positionConfig.position,
      display_order: positionConfig.position,
      image_name: `patrocinio-${positionConfig.position + 1}`,
      image_url: null,
      image_alt: null,
      patrocinador_id: null,
      is_active: false,
      is_clickable: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      patrocinadores: null
    }));
  }, []);

  // CARREGAR CONFIGURAÇÕES
  const loadPatrocinioConfigs = useCallback(async () => {
    setLoading(true);
    
    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      let selectFields = `
        id,
        position,
        image_name,
        image_url,
        image_alt,
        patrocinador_id,
        is_active,
        created_at,
        updated_at,
        patrocinadores (
          id,
          nome,
          slug
        )
      `;

      try {
        const testQuery = await supabase
          .from('patrocinio_configs')
          .select('display_order, is_clickable')
          .limit(1);
        
        if (!testQuery.error) {
          selectFields = `
            id,
            position,
            display_order,
            image_name,
            image_url,
            image_alt,
            patrocinador_id,
            is_active,
            is_clickable,
            created_at,
            updated_at,
            patrocinadores (
              id,
              nome,
              slug
            )
          `;
        }
      } catch {
      }

      const { data, error } = await supabase
        .from('patrocinio_configs')
        .select(selectFields)
        .order('position');
      
      if (error) {
        const mockConfigs = createMockConfigs();
        setPatrocinioConfigs(mockConfigs);
        return;
      }
      
      if (!data || !Array.isArray(data)) {
        const mockConfigs = createMockConfigs();
        setPatrocinioConfigs(mockConfigs);
        return;
      }

      const supabaseData = data as unknown as SupabasePatrocinioConfig[];
      const configsMap = new Map(supabaseData.map(c => [c.position, c]));
      const allConfigs: PatrocinioConfig[] = [];
      
      availablePatrocinioPositions.forEach((positionConfig) => {
        const existingConfig = configsMap.get(positionConfig.position);
        if (existingConfig) {
          allConfigs.push({
            id: existingConfig.id,
            position: existingConfig.position,
            display_order: existingConfig.display_order ?? positionConfig.position,
            image_name: existingConfig.image_name ?? undefined,
            image_url: existingConfig.image_url ?? undefined,
            image_alt: existingConfig.image_alt ?? undefined,
            patrocinador_id: existingConfig.patrocinador_id ?? undefined,
            is_active: existingConfig.is_active,
            is_clickable: existingConfig.is_clickable ?? false,
            created_at: existingConfig.created_at,
            updated_at: existingConfig.updated_at,
            patrocinadores: Array.isArray(existingConfig.patrocinadores) 
              ? existingConfig.patrocinadores[0] || null 
              : existingConfig.patrocinadores || null
          });
        } else {
          allConfigs.push({
            position: positionConfig.position,
            display_order: positionConfig.position,
            image_name: `patrocinio-${positionConfig.position + 1}`,
            image_url: null,
            image_alt: null,
            patrocinador_id: null,
            is_active: false,
            is_clickable: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            patrocinadores: null
          });
        }
      });
      
      allConfigs.sort((a, b) => a.position - b.position);
      setPatrocinioConfigs(allConfigs);
      
    } catch {
      const mockConfigs = createMockConfigs();
      setPatrocinioConfigs(mockConfigs);
    } finally {
      setLoading(false);
    }
  }, [createMockConfigs]);

  // ATUALIZAR CONFIGURAÇÃO NO ESTADO
  const updatePatrocinioConfig = useCallback((position: number, field: keyof PatrocinioConfig, value: string | boolean | number | null) => {
    setPatrocinioConfigs(prev => 
      prev.map(config => 
        config.position === position 
          ? { ...config, [field]: value, updated_at: new Date().toISOString() }
          : config
      )
    );
  }, []);

  // CONTROLE DE UPLOAD
  const setPositionUploading = useCallback((position: number, uploading: boolean) => {
    setUploadingPositions(prev => ({ ...prev, [position]: uploading }));
  }, []);

  // UPLOAD E ATUALIZAÇÃO DE IMAGEM OTIMIZADA (NOVA FUNÇÃO)
  const uploadAndUpdatePatrocinio = useCallback(async (position: number, file: File, fileName: string): Promise<void> => {
    console.log(`🔄 Iniciando upload para posição: ${position}`);
    
    // 1. Buscar configuração atual e URL antiga
    const currentConfig = patrocinioConfigs.find(c => c.position === position);
    const oldImageUrl = currentConfig?.image_url;
    
    console.log(`📄 Config atual:`, currentConfig);
    console.log(`🖼️ URL antiga:`, oldImageUrl);

    setPositionUploading(position, true);

    try {
      // 2. Fazer upload da nova imagem NA PASTA CORRETA
      const formData = new FormData();
      formData.append("imagem", file);
      formData.append("pasta", "patrocinios"); // ✅ Especifica pasta patrocinios
      
      console.log(`📤 Fazendo upload do arquivo: ${file.name} para pasta: patrocinios`);
      
      const res = await fetch("/api/upload-imagem", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Erro HTTP ${res.status}: ${errorText}`);
      }
      
      const data = await res.json();
      
      if (!data.url) {
        throw new Error(data.error || "URL não retornada pela API");
      }

      console.log(`✅ Nova imagem uploadada: ${data.url}`);
      console.log(`📁 Caminho do arquivo: ${data.path}`);

      // 3. Atualizar estado local com nova URL
      updatePatrocinioConfig(position, 'image_url', data.url);
      updatePatrocinioConfig(position, 'image_alt', `Patrocínio ${getPatrocinioPositionInfo(position).name}`);
      updatePatrocinioConfig(position, 'image_name', fileName);
      updatePatrocinioConfig(position, 'is_active', true);

      // 4. Remover imagem antiga do storage (se existir e for diferente)
      if (oldImageUrl && oldImageUrl !== data.url) {
        console.log(`🗑️ Removendo imagem antiga: ${oldImageUrl}`);
        await removeImageFromStorage(oldImageUrl);
      }

      console.log(`🎉 Upload e atualização concluídos para posição: ${position}`);

    } catch (error) {
      console.error(`❌ Erro no upload da posição ${position}:`, error);
      throw error;
    } finally {
      setPositionUploading(position, false);
    }
  }, [patrocinioConfigs, updatePatrocinioConfig, removeImageFromStorage, getPatrocinioPositionInfo, setPositionUploading]);

  // SALVAR CONFIGURAÇÃO (OTIMIZADO)
  const savePatrocinioConfig = useCallback(async (position: number): Promise<void> => {
    const config = patrocinioConfigs.find(c => c.position === position);
    if (!config) {
      throw new Error('Configuração não encontrada');
    }

    if (config.is_active && (!config.image_url || config.image_url.trim() === '')) {
      throw new Error('É necessário enviar uma imagem para ativar a posição');
    }

    if (config.is_clickable === true && (!config.patrocinador_id || config.patrocinador_id.trim() === '')) {
      throw new Error('Para modo clicável, é necessário selecionar um patrocinador');
    }

    console.log(`💾 Salvando configuração da posição: ${position}`, config);

    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const saveData: SavePatrocinioData = {
        position: config.position,
        image_name: config.image_name || null,
        image_url: config.image_url || null,
        image_alt: config.image_alt || null,
        patrocinador_id: (config.patrocinador_id && config.patrocinador_id !== '') ? config.patrocinador_id : null,
        is_active: config.is_active,
        updated_at: new Date().toISOString()
      };

      try {
        const testQuery = await supabase
          .from('patrocinio_configs')
          .select('display_order, is_clickable')
          .limit(1);
        
        if (!testQuery.error) {
          saveData.display_order = config.display_order ?? config.position;
          saveData.is_clickable = config.is_clickable ?? false;
        }
      } catch {
      }

      // Verificar se configuração já existe no banco
      const { data: existingConfig } = await supabase
        .from('patrocinio_configs')
        .select('id, image_url')
        .eq('position', position)
        .single();

      if (existingConfig) {
        // ATUALIZAR configuração existente
        console.log(`🔄 Atualizando configuração existente com ID: ${existingConfig.id}`);
        
        const { error } = await supabase
          .from('patrocinio_configs')
          .update(saveData)
          .eq('id', existingConfig.id);

        if (error) {
          throw new Error(`Erro ao atualizar: ${error.message}`);
        }

        // Atualizar o ID no estado local se necessário
        setPatrocinioConfigs(prev =>
          prev.map(c =>
            c.position === position
              ? { ...c, id: existingConfig.id }
              : c
          )
        );
      } else {
        // CRIAR nova configuração
        console.log(`✨ Criando nova configuração para posição: ${position}`);
        
        const { data: insertData, error } = await supabase
          .from('patrocinio_configs')
          .insert([{ ...saveData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) {
          throw new Error(`Erro ao criar: ${error.message}`);
        }

        // Atualizar o ID no estado local
        if (insertData) {
          setPatrocinioConfigs(prev =>
            prev.map(c =>
              c.position === position
                ? { ...c, id: insertData.id }
                : c
            )
          );
        }
      }

      console.log(`✅ Configuração salva com sucesso para posição: ${position}`);
      
    } catch (error) {
      if (error instanceof Error && (
        error.message.includes('relation') || 
        error.message.includes('does not exist') ||
        error.message.includes('column') ||
        error.message.includes('table')
      )) {
        setPatrocinioConfigs(prev => 
          prev.map(c => 
            c.position === position 
              ? { ...c, updated_at: new Date().toISOString(), id: c.id || `saved-${position}` }
              : c
          )
        );
        console.log(`✅ Configuração salva localmente para posição: ${position}`);
        return;
      }
      console.error(`❌ Erro ao salvar configuração da posição ${position}:`, error);
      throw error;
    }
  }, [patrocinioConfigs]);

  // DELETAR CONFIGURAÇÃO (MELHORADO)
  const deletePatrocinioConfig = useCallback(async (position: number): Promise<void> => {
    const config = patrocinioConfigs.find(c => c.position === position);
    if (!config?.id || config.id.startsWith('mock-')) {
      throw new Error('Configuração não encontrada ou não salva');
    }

    console.log(`🗑️ Deletando configuração da posição: ${position}`);

    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Remover imagem do storage se existir
      if (config.image_url) {
        await removeImageFromStorage(config.image_url);
      }

      // 2. Remover registro do banco
      const { error } = await supabase
        .from('patrocinio_configs')
        .delete()
        .eq('id', config.id);

      if (error) {
        throw new Error(`Erro ao excluir: ${error.message}`);
      }
      
      // 3. Resetar configuração no estado local
      setPatrocinioConfigs(prev => 
        prev.map(c => 
          c.position === position 
            ? {
                position: c.position,
                display_order: c.position,
                image_name: `patrocinio-${c.position + 1}`,
                image_url: null,
                image_alt: null,
                patrocinador_id: null,
                is_active: false,
                is_clickable: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                patrocinadores: null
              }
            : c
        )
      );
      
      console.log(`✅ Configuração deletada com sucesso para posição: ${position}`);
    } catch (error) {
      console.error(`❌ Erro ao deletar configuração da posição ${position}:`, error);
      throw error;
    }
  }, [patrocinioConfigs, removeImageFromStorage]);

  // RESETAR CONFIGURAÇÃO
  const resetPatrocinioConfig = useCallback((position: number) => {
    setPatrocinioConfigs(prev => 
      prev.map(config => 
        config.position === position 
          ? {
              ...config,
              image_name: `patrocinio-${position + 1}`,
              image_url: null,
              image_alt: null,
              patrocinador_id: null,
              is_active: false,
              is_clickable: false,
              display_order: position,
              updated_at: new Date().toISOString()
            }
          : config
      )
    );
  }, []);

  return {
    patrocinioConfigs,
    loading,
    uploadingPositions,
    loadPatrocinioConfigs,
    updatePatrocinioConfig,
    setPositionUploading,
    uploadAndUpdatePatrocinio, // Nova função otimizada
    savePatrocinioConfig,
    deletePatrocinioConfig,
    getPatrocinioPositionInfo,
    resetPatrocinioConfig,
    removeImageFromStorage // Expor para uso externo se necessário
  } as const;
};