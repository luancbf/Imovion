'use client';

import { useState, useCallback } from 'react';
import { SliderBanner } from '@/types/cadastrar-patrocinador';

// ✅ Configuração das imagens disponíveis
const availableSliderImages = [
  { name: 'banner1', title: 'Banner Principal', description: 'Primeira posição no slider' },
  { name: 'banner2', title: 'Banner Secundário', description: 'Segunda posição no slider' },
  { name: 'banner3', title: 'Banner Terciário', description: 'Terceira posição no slider' }
];

export const useSliderConfig = () => {
  const [sliderBanners, setSliderBanners] = useState<SliderBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  // ✅ INFORMAÇÕES DA IMAGEM
  const getSliderImageInfo = useCallback((imageName: string) => {
    return availableSliderImages.find(img => img.name === imageName) || {
      name: imageName,
      title: imageName,
      description: 'Banner do slider'
    };
  }, []);

  // ✅ CARREGAR BANNERS (corrigido para usar os campos corretos)
  const loadSliderBanners = useCallback(async () => {
    console.log('📥 [SLIDER] Iniciando carregamento dos banners...');
    setLoading(true);
    
    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { data, error } = await supabase
        .from('slider_banners')
        .select(`
          *,
          patrocinadores (
            id,
            nome,
            slug
          )
        `)
        .order('order_index');
      
      if (error) {
        console.error('❌ [SLIDER] Erro ao carregar do banco:', error);
        console.log('🔄 [SLIDER] Criando banners mock...');
        
        // Criar banners mock
        const mockBanners: SliderBanner[] = availableSliderImages.map((imageConfig, index) => ({
          id: `mock-${index}`,
          image_name: imageConfig.name,
          image_url: null,
          image_alt: null,
          patrocinador_id: null,
          is_active: false,
          is_clickable: false,
          order_index: index,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          patrocinadores: null
        }));
        
        setSliderBanners(mockBanners);
        return;
      }
      
      console.log('📊 [SLIDER] Dados do banco:', data);
      
      // Mapear dados existentes
      const bannersMap = new Map(data?.map(b => [b.image_name, b]) || []);
      const allBanners: SliderBanner[] = [];
      
      // Garantir que todos os banners existam
      availableSliderImages.forEach((imageConfig, index) => {
        const existingBanner = bannersMap.get(imageConfig.name);
        if (existingBanner) {
          console.log(`✅ [SLIDER] Banner existente: ${imageConfig.name} ID: ${existingBanner.id}`);
          allBanners.push(existingBanner);
        } else {
          console.log(`➕ [SLIDER] Criando banner vazio: ${imageConfig.name}`);
          allBanners.push({
            image_name: imageConfig.name,
            image_url: null,
            image_alt: null,
            patrocinador_id: null,
            is_active: false,
            is_clickable: false,
            order_index: index,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            patrocinadores: null
          });
        }
      });
      
      console.log('📋 [SLIDER] Total de banners:', allBanners.length);
      setSliderBanners(allBanners);
      
    } catch (error) {
      console.error('❌ [SLIDER] Erro no carregamento:', error);
      
      // Fallback para mock
      const mockBanners: SliderBanner[] = availableSliderImages.map((imageConfig, index) => ({
        id: `mock-${index}`,
        image_name: imageConfig.name,
        image_url: null,
        image_alt: null,
        patrocinador_id: null,
        is_active: false,
        is_clickable: false,
        order_index: index,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        patrocinadores: null
      }));
      
      console.log('🔄 [SLIDER MOCK] Usando dados mock');
      setSliderBanners(mockBanners);
      
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ ATUALIZAR BANNER NO ESTADO
  const updateSliderBanner = useCallback((imageName: string, field: keyof SliderBanner, value: string | boolean | number | null) => {
    console.log(`🔄 [SLIDER UPDATE] ${imageName}.${field}:`, value);
    setSliderBanners(prev => 
      prev.map(banner => 
        banner.image_name === imageName 
          ? { ...banner, [field]: value }
          : banner
      )
    );
  }, []);

  // ✅ CONTROLE DE UPLOAD
  const setImageUploading = useCallback((imageName: string, uploading: boolean) => {
    setUploadingImages(prev => ({ ...prev, [imageName]: uploading }));
  }, []);

  // ✅ SALVAR BANNER (corrigido para usar order_index)
  const saveSliderBanner = useCallback(async (imageName: string): Promise<void> => {
    const banner = sliderBanners.find(b => b.image_name === imageName);
    if (!banner) {
      throw new Error('Banner não encontrado');
    }

    console.log(`💾 [SLIDER SAVE] Salvando banner: ${imageName}`, banner);

    // ✅ VALIDAÇÃO: Banner pode ser ativo apenas com imagem
    if (banner.is_active && (!banner.image_url || banner.image_url.trim() === '')) {
      throw new Error('É necessário enviar uma imagem para ativar o banner');
    }

    // ✅ VALIDAÇÃO: Clicável requer patrocinador
    if (banner.is_active && banner.is_clickable && (!banner.patrocinador_id || banner.patrocinador_id.trim() === '')) {
      throw new Error('Para modo clicável, é necessário selecionar um patrocinador');
    }

    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // ✅ CORRIGIDO: Dados para salvar com campos corretos
      const saveData = {
        image_name: banner.image_name,
        image_url: banner.image_url,
        image_alt: banner.image_alt,
        patrocinador_id: (banner.patrocinador_id && banner.patrocinador_id !== '') ? banner.patrocinador_id : null,
        is_active: banner.is_active,
        is_clickable: banner.is_clickable,
        order_index: banner.order_index, // ✅ CORRIGIDO: usar order_index ao invés de display_order
        updated_at: new Date().toISOString()
      };

      if (banner.id && !banner.id.startsWith('mock-')) {
        // ✅ ATUALIZAR registro existente
        console.log(`🔄 [SLIDER UPDATE] Atualizando ID: ${banner.id}`);
        
        const { data, error } = await supabase
          .from('slider_banners')
          .update(saveData)
          .eq('id', banner.id)
          .select(`
            *,
            patrocinadores (
              id,
              nome,
              slug
            )
          `);

        if (error) {
          console.error('❌ [SLIDER UPDATE ERROR]:', error);
          throw new Error(`Erro ao atualizar: ${error.message}`);
        }
        
        console.log('✅ [SLIDER UPDATE SUCCESS]:', data);
      } else {
        // ✅ INSERIR novo registro
        console.log(`➕ [SLIDER INSERT] Criando novo banner: ${imageName}`);
        
        const { data, error } = await supabase
          .from('slider_banners')
          .upsert(saveData, {
            onConflict: 'image_name'
          })
          .select(`
            *,
            patrocinadores (
              id,
              nome,
              slug
            )
          `);

        if (error) {
          console.error('❌ [SLIDER INSERT ERROR]:', error);
          throw new Error(`Erro ao salvar: ${error.message}`);
        }
        
        console.log('✅ [SLIDER INSERT SUCCESS]:', data);
      }

      // Recarregar banners
      await loadSliderBanners();
      
    } catch (error) {
      console.error('❌ [SLIDER SAVE ERROR]:', error);
      
      // Se der erro de tabela não existir, simular salvamento
      if (error instanceof Error && error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('🔄 [SLIDER MOCK SAVE] Simulando salvamento...');
        setSliderBanners(prev => 
          prev.map(b => 
            b.image_name === imageName 
              ? { ...b, updated_at: new Date().toISOString() }
              : b
          )
        );
        return;
      }
      
      throw error;
    }
  }, [sliderBanners, loadSliderBanners]);

  // ✅ DELETAR BANNER
  const deleteSliderBanner = useCallback(async (imageName: string): Promise<void> => {
    const banner = sliderBanners.find(b => b.image_name === imageName);
    if (!banner?.id || banner.id.startsWith('mock-')) {
      throw new Error('Banner não encontrado ou não salvo');
    }

    console.log(`🗑️ [SLIDER DELETE] Deletando banner: ${imageName} ID: ${banner.id}`);

    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const { error } = await supabase
        .from('slider_banners')
        .delete()
        .eq('id', banner.id);

      if (error) {
        console.error('❌ [SLIDER DELETE ERROR]:', error);
        throw new Error(`Erro ao excluir: ${error.message}`);
      }
      
      console.log('✅ [SLIDER DELETE SUCCESS]');
      
      // Recarregar banners
      await loadSliderBanners();
    } catch (error) {
      console.error('❌ [SLIDER DELETE CATCH]:', error);
      throw error;
    }
  }, [sliderBanners, loadSliderBanners]);

  // ✅ RESETAR BANNER
  const resetSliderBanner = useCallback((imageName: string) => {
    console.log(`🔄 [SLIDER RESET] Resetando banner: ${imageName}`);
    
    setSliderBanners(prev => 
      prev.map(banner => 
        banner.image_name === imageName 
          ? {
              ...banner,
              image_url: null,
              image_alt: null,
              patrocinador_id: null,
              is_active: false,
              is_clickable: false
            }
          : banner
      )
    );
  }, []);

  // ✅ VALIDAÇÃO
  const validateSliderBanner = useCallback((imageName: string): { valid: boolean; error?: string } => {
    const banner = sliderBanners.find(b => b.image_name === imageName);
    if (!banner) {
      return { valid: false, error: 'Banner não encontrado' };
    }

    if (banner.is_active) {
      if (!banner.image_url || banner.image_url.trim() === '') {
        return { valid: false, error: 'Envie uma imagem para ativar o banner' };
      }
      
      if (banner.is_clickable && (!banner.patrocinador_id || banner.patrocinador_id.trim() === '')) {
        return { valid: false, error: 'Selecione um patrocinador para modo clicável' };
      }
    }

    return { valid: true };
  }, [sliderBanners]);

  // ✅ UTILITÁRIOS
  const getActiveBanners = useCallback(() => {
    return sliderBanners.filter(banner => 
      banner.is_active && 
      banner.image_url && 
      banner.image_url.trim() !== ''
    );
  }, [sliderBanners]);

  const getClickableBanners = useCallback(() => {
    return sliderBanners.filter(banner => 
      banner.is_active && 
      banner.is_clickable && 
      banner.patrocinador_id && 
      banner.patrocinador_id.trim() !== ''
    );
  }, [sliderBanners]);

  const getTotalActiveBanners = useCallback(() => {
    return getActiveBanners().length;
  }, [getActiveBanners]);

  const getTotalClickableBanners = useCallback(() => {
    return getClickableBanners().length;
  }, [getClickableBanners]);

  const getBannersWithImages = useCallback(() => {
    return sliderBanners.filter(banner => 
      banner.image_url && 
      banner.image_url.trim() !== ''
    );
  }, [sliderBanners]);

  return {
    sliderBanners,
    loading,
    uploadingImages,
    loadSliderBanners,
    updateSliderBanner,
    setImageUploading,
    saveSliderBanner,
    deleteSliderBanner,
    resetSliderBanner,
    getSliderImageInfo,
    validateSliderBanner,
    getActiveBanners,
    getClickableBanners,
    getTotalActiveBanners,
    getTotalClickableBanners,
    getBannersWithImages
  } as const;
};