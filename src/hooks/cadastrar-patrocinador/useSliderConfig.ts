'use client';

import { useState, useCallback } from 'react';
import { SliderBanner } from '@/types/cadastrar-patrocinador';

const availableSliderImages = [
  { name: 'principal1', type: 'principal' },
  { name: 'principal2', type: 'principal' },
  { name: 'principal3', type: 'principal' },
  { name: 'principal4', type: 'principal' },
  { name: 'principal5', type: 'principal' },
  { name: 'principal6', type: 'principal' },
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

  // CONTROLE DE UPLOAD (movido para cima para ser usado nas dependências)
  const setImageUploading = useCallback((imageName: string, uploading: boolean) => {
    setUploadingImages(prev => ({ ...prev, [imageName]: uploading }));
  }, []);

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
      
      if (error || !data) {
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
      
      const bannersMap = new Map(data.map(b => [b.image_name, b]));
      const allBanners: SliderBanner[] = availableSliderImages.map((imageConfig, index) => {
        const existingBanner = bannersMap.get(imageConfig.name);
        return existingBanner
          ? existingBanner
          : {
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
            };
      });
      
      setSliderBanners(allBanners);
      
    } catch {
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
      
    } finally {
      setLoading(false);
    }
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
        console.log(`🗑️ Removendo imagem do storage: ${filePath}`);
        
        const { error } = await supabase.storage
          .from('imagens')
          .remove([filePath]);

        if (error) {
          console.error('Erro ao remover imagem do storage:', error);
        } else {
          console.log('✅ Imagem removida com sucesso do storage');
        }
      }
    } catch (error) {
      console.error('Erro ao processar remoção da imagem:', error);
    }
  }, []);

  // ATUALIZAR BANNER NO ESTADO
  const updateSliderBanner = useCallback((imageName: string, field: keyof SliderBanner, value: string | boolean | number | null) => {
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

  // UPLOAD E ATUALIZAÇÃO DE IMAGEM (CORRIGIDO COM DEPENDÊNCIAS)
  const uploadAndUpdateBanner = useCallback(async (imageName: string, file: File): Promise<void> => {
    console.log(`🔄 Iniciando upload para banner: ${imageName}`);
    
    // 1. Buscar banner atual e URL antiga
    const currentBanner = sliderBanners.find(b => b.image_name === imageName);
    const oldImageUrl = currentBanner?.image_url;
    
    console.log(`📄 Banner atual:`, currentBanner);
    console.log(`🖼️ URL antiga:`, oldImageUrl);

    setImageUploading(imageName, true);

    try {
      // 2. Fazer upload da nova imagem
      const formData = new FormData();
      formData.append("imagem", file);
      formData.append("pasta", "slider");
      
      console.log(`📤 Fazendo upload do arquivo: ${file.name}`);
      
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

      // 3. Atualizar estado local com nova URL
      updateSliderBanner(imageName, 'image_url', data.url);
      updateSliderBanner(imageName, 'image_alt', `Banner ${imageName}`);
      updateSliderBanner(imageName, 'is_active', true);

      // 4. Remover imagem antiga do storage (se existir e for diferente)
      if (oldImageUrl && oldImageUrl !== data.url) {
        console.log(`🗑️ Removendo imagem antiga: ${oldImageUrl}`);
        await removeImageFromStorage(oldImageUrl);
      }

      console.log(`🎉 Upload e atualização concluídos para: ${imageName}`);

    } catch (error) {
      console.error(`❌ Erro no upload do banner ${imageName}:`, error);
      throw error;
    } finally {
      setImageUploading(imageName, false);
    }
  }, [sliderBanners, updateSliderBanner, removeImageFromStorage, setImageUploading]);

  // SALVAR BANNER (OTIMIZADO PARA EVITAR DUPLICATAS)
  const saveSliderBanner = useCallback(async (imageName: string): Promise<void> => {
    const banner = sliderBanners.find(b => b.image_name === imageName);
    if (!banner) throw new Error('Banner não encontrado');

    console.log(`💾 Salvando banner: ${imageName}`, banner);

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
        updated_at: new Date().toISOString()
      };

      // Verificar se banner já existe no banco
      const { data: existingBanner } = await supabase
        .from('slider_banners')
        .select('id, image_url')
        .eq('image_name', imageName)
        .single();

      if (existingBanner) {
        // ATUALIZAR banner existente
        console.log(`🔄 Atualizando banner existente com ID: ${existingBanner.id}`);
        
        const { error } = await supabase
          .from('slider_banners')
          .update(saveData)
          .eq('id', existingBanner.id);

        if (error) throw new Error(`Erro ao atualizar: ${error.message}`);

        // Atualizar o ID no estado local se necessário
        setSliderBanners(prev =>
          prev.map(b =>
            b.image_name === imageName
              ? { ...b, id: existingBanner.id }
              : b
          )
        );
      } else {
        // CRIAR novo banner
        console.log(`✨ Criando novo banner: ${imageName}`);
        
        const { data, error } = await supabase
          .from('slider_banners')
          .insert([{ ...saveData, created_at: new Date().toISOString() }])
          .select()
          .single();

        if (error) throw new Error(`Erro ao criar: ${error.message}`);

        // Atualizar o ID no estado local
        if (data) {
          setSliderBanners(prev =>
            prev.map(b =>
              b.image_name === imageName
                ? { ...b, id: data.id }
                : b
            )
          );
        }
      }

      console.log(`✅ Banner salvo com sucesso: ${imageName}`);

    } catch (error: unknown) {
      console.error(`❌ Erro ao salvar banner ${imageName}:`, error);
      throw new Error(
        error instanceof Error && error.message
          ? error.message
          : 'Erro ao salvar banner'
      );
    }
  }, [sliderBanners]);

  // SALVAR TODOS OS BANNERS (OTIMIZADO)
  const saveAllSliderBanners = useCallback(async () => {
    console.log(`💾 Salvando todos os banners...`);
    
    const bannersToSave = sliderBanners.filter(banner => 
      banner.image_url && banner.image_url.trim() !== ''
    );

    console.log(`📋 Banners para salvar: ${bannersToSave.length}`);

    for (const banner of bannersToSave) {
      try {
        await saveSliderBanner(banner.image_name);
        console.log(`✅ Banner salvo: ${banner.image_name}`);
      } catch (error) {
        console.error(`❌ Erro ao salvar banner ${banner.image_name}:`, error);
        throw error; // Parar se houver erro
      }
    }

    console.log(`🎉 Todos os banners foram salvos com sucesso!`);
  }, [sliderBanners, saveSliderBanner]);

  // DELETAR BANNER (MELHORADO)
  const deleteSliderBanner = useCallback(async (imageName: string): Promise<void> => {
    const banner = sliderBanners.find(b => b.image_name === imageName);
    if (!banner?.id || banner.id.startsWith('mock-')) {
      throw new Error('Banner não encontrado ou não salvo');
    }

    console.log(`🗑️ Deletando banner: ${imageName}`);

    try {
      const { createBrowserClient } = await import("@supabase/ssr");
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // 1. Remover imagem do storage se existir
      if (banner.image_url) {
        await removeImageFromStorage(banner.image_url);
      }

      // 2. Remover registro do banco
      const { error } = await supabase
        .from('slider_banners')
        .delete()
        .eq('id', banner.id);

      if (error) {
        throw new Error(`Erro ao excluir: ${error.message}`);
      }

      // 3. Recarregar banners
      await loadSliderBanners();
      
      console.log(`✅ Banner deletado com sucesso: ${imageName}`);

    } catch (error) {
      console.error(`❌ Erro ao deletar banner ${imageName}:`, error);
      throw error;
    }
  }, [sliderBanners, removeImageFromStorage, loadSliderBanners]);

  // RESETAR BANNER
  const resetSliderBanner = useCallback((imageName: string) => {
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

  // VALIDAÇÃO
  const validateSliderBanner = useCallback((imageName: string): { valid: boolean; error?: string } => {
    const banner = sliderBanners.find(b => b.image_name === imageName);
    if (!banner) {
      return { valid: false, error: 'Banner não encontrado' };
    }

    return { valid: true };
  }, [sliderBanners]);

  // FILTROS E UTILITÁRIOS
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
    uploadAndUpdateBanner, // Agora com dependências corretas
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
    getActiveBannersByType,
    removeImageFromStorage // Expor para uso externo se necessário
  } as const;
};