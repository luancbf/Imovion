'use client';

import { useState, useCallback } from 'react';
import { SliderBanner } from '@/types/cadastrar-patrocinador';

const availableSliderImages = [
  // 6 Banners Principais
  { name: 'principal1', type: 'principal' },
  { name: 'principal2', type: 'principal' },
  { name: 'principal3', type: 'principal' },
  { name: 'principal4', type: 'principal' },
  { name: 'principal5', type: 'principal' },
  { name: 'principal6', type: 'principal' },

  // 6 Banners Secundários
  { name: 'secundario1', type: 'secundario' },
  { name: 'secundario2', type: 'secundario' },
  { name: 'secundario3', type: 'secundario' },
  { name: 'secundario4', type: 'secundario' },
  { name: 'secundario5', type: 'secundario' },
  { name: 'secundario6', type: 'secundario' }
];

export const useSliderConfig = () => {
  const [sliderBanners, setSliderBanners] = useState<SliderBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  // INFORMAÇÕES DA IMAGEM
  const getSliderImageInfo = useCallback((imageName: string) => {
    return availableSliderImages.find(img => img.name === imageName) || {
      name: imageName,
      title: imageName,
      description: 'Banner do slider',
      type: 'principal'
    };
  }, []);

  // CARREGAR BANNERS
  const loadSliderBanners = useCallback(async () => {
    console.log('📥 [SLIDER] Iniciando carregamento dos banners (12 imagens)...');
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
      
      // Garantir que todos os 12 banners existam
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
      
      // Fallback para mock com 12 imagens
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
      
      console.log('🔄 [SLIDER MOCK] Usando dados mock com 12 banners');
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
          ? { 
              ...banner, 
              [field]: value,
              ...(field === 'image_url' && value ? { is_active: true } : {})
            }
          : banner
      )
    );
  }, []);

  // ✅ SALVAR BANNER
  const saveSliderBanner = useCallback(async (imageName: string): Promise<void> => {
    const banner = sliderBanners.find(b => b.image_name === imageName);
    if (!banner) throw new Error('Banner não encontrado');

    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      const saveData = {
        image_name: banner.image_name,
        image_url: banner.image_url ?? null,
        image_alt: banner.image_alt ?? null,
        patrocinador_id: banner.patrocinador_id && banner.patrocinador_id !== '' ? banner.patrocinador_id : null,
        is_active: !!banner.is_active,
        is_clickable: !!banner.is_clickable,
        order_index: typeof banner.order_index === 'number' ? banner.order_index : 0,
        created_at: banner.created_at ?? new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (banner.id && typeof banner.id === 'string' && !banner.id.startsWith('mock-')) {
        const { error } = await supabase
          .from('slider_banners')
          .update(saveData)
          .eq('id', banner.id);

        if (error) throw new Error(`Erro ao atualizar: ${error.message}`);
      } else {
        // Upsert e retorna o novo registro
        const { data, error } = await supabase
          .from('slider_banners')
          .upsert(saveData, { onConflict: 'image_name' })
          .select();

        console.log('UPsert retorno:', { data, error, saveData });

        if (error) throw new Error(`Erro ao salvar: ${error.message}`);

        // Atualize o estado local com o novo id
        if (data && data.length > 0) {
          setSliderBanners(prev =>
            prev.map(b =>
              b.image_name === imageName
                ? { ...b, id: data[0].id }
                : b
            )
          );
        }
      }

      await loadSliderBanners();
    } catch (error: unknown) {
      console.error('❌ [SLIDER SAVE ERROR]:', error);
      throw new Error(
        error instanceof Error && error.message
          ? error.message
          : 'Erro ao salvar banner'
      );
    }
  }, [sliderBanners, loadSliderBanners]);

  // ✅ SALVAR TODOS OS BANNERS EDITADOS
  const saveAllSliderBanners = useCallback(async () => {
    for (const banner of sliderBanners) {
      if (banner.image_url || banner.patrocinador_id || banner.is_clickable) {
        try {
          await saveSliderBanner(banner.image_name);
        } catch (error) {
          console.error('❌ [SLIDER SAVE ERROR]:', error);
        }
      }
    }
    console.log('✅ [SLIDER] Salvamento manual concluído');
  }, [sliderBanners, saveSliderBanner]);

  // ✅ CONTROLE DE UPLOAD
  const setImageUploading = useCallback((imageName: string, uploading: boolean) => {
    setUploadingImages(prev => ({ ...prev, [imageName]: uploading }));
  }, []);

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

    return { valid: true };
  }, [sliderBanners]);

  // ✅ FILTROS E UTILITÁRIOS
  const getPrincipalBanners = useCallback(() => {
    return sliderBanners.filter(banner => banner.image_name.startsWith('principal'));
  }, [sliderBanners]);

  const getSecundarioBanners = useCallback(() => {
    return sliderBanners.filter(banner => banner.image_name.startsWith('secundario'));
  }, [sliderBanners]);

  const getActiveBanners = useCallback(() => {
    return sliderBanners.filter(banner => 
      banner.is_active && 
      banner.image_url && 
      banner.image_url.trim() !== ''
    );
  }, [sliderBanners]);

  const getActiveBannersByType = useCallback((type: 'principal' | 'secundario') => {
    return sliderBanners.filter(banner => 
      banner.image_name.startsWith(type) &&
      banner.is_active && 
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
    saveAllSliderBanners,
    deleteSliderBanner,
    resetSliderBanner,
    validateSliderBanner,
    getSliderImageInfo,
    getActiveBanners,
    getPrincipalBanners,
    getSecundarioBanners,
    getActiveBannersByType
  } as const;
};