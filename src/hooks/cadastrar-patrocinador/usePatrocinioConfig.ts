import { useState, useCallback } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { PatrocinioConfig, patrocinioPositions } from '@/types/cadastrar-patrocinador';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export const usePatrocinioConfig = () => {
  const [patrocinioConfigs, setPatrocinioConfigs] = useState<PatrocinioConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingPositions, setUploadingPositions] = useState<Record<string, boolean>>({});

  // CORRIGIDO: Load com logs detalhados e lógica melhorada
  const loadPatrocinioConfigs = useCallback(async () => {
    console.log('📥 [LOAD] Iniciando carregamento das configurações...');
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('patrocinio_configs')
        .select(`
          *,
          patrocinadores (
            nome,
            slug
          )
        `)
        .order('display_order');
      
      if (error) {
        console.error('❌ [LOAD ERROR]:', error);
        setPatrocinioConfigs([]);
        return;
      }
      
      console.log('📊 [LOAD DATA] Dados do banco:', data);
      
      // Criar mapeamento das configurações existentes
      const configsMap = new Map(data?.map(config => [config.display_order, config]) || []);
      const allConfigs: PatrocinioConfig[] = [];
      
      // Garantir que todas as posições existam
      patrocinioPositions.forEach((position, index) => {
        const existingConfig = configsMap.get(index);
        if (existingConfig) {
          console.log(`✅ [POSITION ${index}] Configuração existente encontrada ID: ${existingConfig.id}`);
          allConfigs.push(existingConfig);
        } else {
          console.log(`➕ [POSITION ${index}] Criando configuração vazia`);
          // Criar configuração vazia para posições não configuradas
          allConfigs.push({
            image_name: `patrocinio-pos-${index + 1}`,
            image_url: null,
            image_alt: `Patrocínio ${position.name}`,
            patrocinador_id: '',
            is_active: false,
            is_clickable: false,
            display_order: index
          });
        }
      });
      
      console.log('📋 [FINAL CONFIGS] Total de configurações:', allConfigs.length);
      setPatrocinioConfigs(allConfigs);
    } catch (error) {
      console.error('❌ [LOAD CATCH] Erro ao carregar configurações:', error);
      setPatrocinioConfigs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePatrocinioConfig = (position: number, field: keyof PatrocinioConfig, value: string | boolean | number) => {
    console.log(`🔄 [UPDATE STATE] Posição ${position}, campo ${field}:`, value);
    setPatrocinioConfigs(prev => 
      prev.map(config => 
        config.display_order === position 
          ? { ...config, [field]: value }
          : config
      )
    );
  };

  const setPositionUploading = (position: number, uploading: boolean) => {
    setUploadingPositions(prev => ({ ...prev, [position]: uploading }));
  };

  // CORRIGIDO: Salvamento inteligente com verificação de existência
  const savePatrocinioConfig = async (position: number): Promise<void> => {
    const config = patrocinioConfigs.find(c => c.display_order === position);
    if (!config) {
      throw new Error('Configuração não encontrada');
    }

    console.log(`💾 [SAVE] Iniciando salvamento da posição ${position}:`, {
      id: config.id,
      image_url: config.image_url,
      patrocinador_id: config.patrocinador_id,
      is_active: config.is_active,
      is_clickable: config.is_clickable
    });

    // Validação robusta
    const isClickable = config.is_clickable === true;
    
    if (!config.image_url || config.image_url.trim() === '') {
      throw new Error('É necessário enviar uma imagem');
    }

    if (config.is_active && isClickable && (!config.patrocinador_id || config.patrocinador_id.trim() === '')) {
      throw new Error('Para ativar em modo clicável, é necessário selecionar um patrocinador');
    }

    try {
      if (config.id) {
        // ATUALIZAR REGISTRO EXISTENTE
        console.log(`🔄 [UPDATE] Atualizando registro ID: ${config.id} na posição ${position}`);
        
        const { data, error } = await supabase
          .from('patrocinio_configs')
          .update({
            image_name: config.image_name,
            image_url: config.image_url,
            image_alt: config.image_alt,
            patrocinador_id: (config.patrocinador_id && config.patrocinador_id.trim() !== '') ? config.patrocinador_id : null,
            is_active: config.is_active,
            is_clickable: config.is_clickable,
            display_order: config.display_order
          })
          .eq('id', config.id)
          .select();

        if (error) {
          console.error('❌ [UPDATE ERROR]:', error);
          throw error;
        }
        
        console.log('✅ [UPDATE SUCCESS]:', data);
      } else {
        // VERIFICAR SE JÁ EXISTE UM REGISTRO PARA ESTA POSIÇÃO
        console.log(`🔍 [CHECK] Verificando se já existe registro para posição ${position}`);
        
        const { data: existingConfig, error: checkError } = await supabase
          .from('patrocinio_configs')
          .select('id, image_name')
          .eq('display_order', position)
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('❌ [CHECK ERROR]:', checkError);
          throw checkError;
        }

        if (existingConfig) {
          console.log(`🔄 [EXISTING FOUND] Atualizando registro existente ID: ${existingConfig.id}`);
          
          // Atualizar o existente em vez de criar novo
          const { data, error } = await supabase
            .from('patrocinio_configs')
            .update({
              image_name: config.image_name,
              image_url: config.image_url,
              image_alt: config.image_alt,
              patrocinador_id: (config.patrocinador_id && config.patrocinador_id.trim() !== '') ? config.patrocinador_id : null,
              is_active: config.is_active,
              is_clickable: config.is_clickable,
              display_order: config.display_order
            })
            .eq('id', existingConfig.id)
            .select();

          if (error) {
            console.error('❌ [UPDATE EXISTING ERROR]:', error);
            throw error;
          }
          
          console.log('✅ [UPDATE EXISTING SUCCESS]:', data);
        } else {
          // CRIAR NOVO REGISTRO
          console.log(`➕ [INSERT] Criando novo registro para posição ${position}`);
          
          const { data, error } = await supabase
            .from('patrocinio_configs')
            .insert({
              image_name: config.image_name,
              image_url: config.image_url,
              image_alt: config.image_alt,
              patrocinador_id: (config.patrocinador_id && config.patrocinador_id.trim() !== '') ? config.patrocinador_id : null,
              is_active: config.is_active,
              is_clickable: config.is_clickable,
              display_order: config.display_order
            })
            .select();

          if (error) {
            console.error('❌ [INSERT ERROR]:', error);
            throw error;
          }
          
          console.log('✅ [INSERT SUCCESS]:', data);
        }
      }

      // RECARREGAR CONFIGURAÇÕES APÓS SUCESSO
      console.log('🔄 [RELOAD] Recarregando configurações...');
      await loadPatrocinioConfigs();
      
    } catch (error) {
      console.error('❌ [SAVE ERROR] Erro ao salvar configuração:', error);
      throw error;
    }
  };

  // CORRIGIDO: Deletar mais específico com logs
  const deletePatrocinioConfig = async (position: number): Promise<void> => {
    const config = patrocinioConfigs.find(c => c.display_order === position);
    if (!config?.id) {
      throw new Error('Configuração não encontrada ou não salva');
    }

    console.log(`🗑️ [DELETE] Deletando config ID: ${config.id} da posição ${position}`);

    try {
      const { error } = await supabase
        .from('patrocinio_configs')
        .delete()
        .eq('id', config.id);

      if (error) {
        console.error('❌ [DELETE ERROR]:', error);
        throw error;
      }
      
      console.log('✅ [DELETE SUCCESS] Registro deletado com sucesso');
      
      // Recarregar configurações
      await loadPatrocinioConfigs();
    } catch (error) {
      console.error('❌ [DELETE CATCH] Erro ao excluir configuração:', error);
      throw error;
    }
  };

  const getPatrocinioPositionInfo = (position: number) => {
    return patrocinioPositions[position] || {
      id: `pos-${position + 1}`,
      name: `Posição ${position + 1}`,
      description: `${position + 1}ª posição dos patrocínios`
    };
  };

  const validatePatrocinioConfig = (position: number): { valid: boolean; error?: string } => {
    const config = patrocinioConfigs.find(c => c.display_order === position);
    if (!config) {
      return { valid: false, error: 'Configuração não encontrada' };
    }

    if (config.is_active) {
      if (!config.image_url || config.image_url.trim() === '') {
        return { valid: false, error: 'Envie uma imagem' };
      }
      
      const isClickable = config.is_clickable === true;
      if (isClickable && (!config.patrocinador_id || config.patrocinador_id.trim() === '')) {
        return { valid: false, error: 'Selecione um patrocinador para modo clicável' };
      }
    }

    return { valid: true };
  };

  const getActivePatrocinioConfigs = () => {
    return patrocinioConfigs.filter(config => 
      config.is_active && 
      config.image_url && 
      config.image_url.trim() !== ''
    );
  };

  const getTotalActiveConfigs = () => {
    return getActivePatrocinioConfigs().length;
  };

  const resetPatrocinioConfig = (position: number) => {
    console.log(`🔄 [RESET] Resetando posição ${position}`);
    
    setPatrocinioConfigs(prev => 
      prev.map(config => 
        config.display_order === position 
          ? {
              ...config,
              image_url: null,
              image_alt: `Patrocínio ${getPatrocinioPositionInfo(position).name}`,
              patrocinador_id: '',
              is_active: false,
              is_clickable: false
            }
          : config
      )
    );
  };

  const duplicatePatrocinioConfig = (sourcePosition: number, targetPosition: number) => {
    const sourceConfig = patrocinioConfigs.find(c => c.display_order === sourcePosition);
    if (!sourceConfig) return;

    console.log(`📋 [DUPLICATE] Duplicando da posição ${sourcePosition} para ${targetPosition}`);

    setPatrocinioConfigs(prev => 
      prev.map(config => 
        config.display_order === targetPosition 
          ? {
              ...config,
              image_url: sourceConfig.image_url,
              image_alt: sourceConfig.image_alt,
              patrocinador_id: sourceConfig.patrocinador_id,
              is_active: false, // Começar desativado
              is_clickable: sourceConfig.is_clickable
            }
          : config
      )
    );
  };

  return {
    patrocinioConfigs,
    loading,
    uploadingPositions,
    loadPatrocinioConfigs,
    updatePatrocinioConfig,
    setPositionUploading,
    savePatrocinioConfig,
    deletePatrocinioConfig,
    getPatrocinioPositionInfo,
    validatePatrocinioConfig,
    getActivePatrocinioConfigs,
    getTotalActiveConfigs,
    resetPatrocinioConfig,
    duplicatePatrocinioConfig
  };
};