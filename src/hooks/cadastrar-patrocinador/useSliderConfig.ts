import { useState, useCallback } from 'react';
import { createBrowserClient } from "@supabase/ssr";
import { SliderBanner, availableSliderImages } from '@/types/cadastrar-patrocinador';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export const useSliderConfig = () => {
  const [sliderBanners, setSliderBanners] = useState<SliderBanner[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState<Record<string, boolean>>({});

  const loadSliderBanners = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('slider_banners')
        .select(`
          *,
          patrocinadores (
            nome,
            slug
          )
        `)
        .order('display_order');
      
      const bannersMap = new Map(data?.map(b => [b.image_name, b]) || []);
      const allBanners: SliderBanner[] = [];
      
      availableSliderImages.forEach((imageConfig, index) => {
        const existingBanner = bannersMap.get(imageConfig.name);
        if (existingBanner) {
          allBanners.push(existingBanner);
        } else {
          allBanners.push({
            image_name: imageConfig.name,
            image_url: null,
            image_alt: '',
            patrocinador_id: '',
            is_active: false,
            display_order: index
          });
        }
      });
      
      setSliderBanners(allBanners);
    } catch (error) {
      console.error('Erro ao carregar banners:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSliderBanner = (imageName: string, field: keyof SliderBanner, value: string | boolean | number) => {
    setSliderBanners(prev => 
      prev.map(banner => 
        banner.image_name === imageName 
          ? { ...banner, [field]: value }
          : banner
      )
    );
  };

  const setImageUploading = (imageName: string, uploading: boolean) => {
    setUploadingImages(prev => ({ ...prev, [imageName]: uploading }));
  };

  const saveSliderBanner = async (imageName: string): Promise<void> => {
    const banner = sliderBanners.find(b => b.image_name === imageName);
    if (!banner) return;

    if (banner.is_active && (!banner.patrocinador_id || !banner.image_url)) {
      throw new Error('Para ativar, é necessário ter uma imagem e um patrocinador selecionado');
    }

    if (banner.id) {
      const { error } = await supabase
        .from('slider_banners')
        .update({
          image_url: banner.image_url,
          image_alt: banner.image_alt,
          patrocinador_id: banner.patrocinador_id || null,
          is_active: banner.is_active,
          display_order: banner.display_order
        })
        .eq('id', banner.id);

      if (error) throw error;
    } else {
      if (!banner.patrocinador_id || !banner.image_url) {
        throw new Error('Selecione um patrocinador e envie uma imagem antes de salvar');
      }

      const { error } = await supabase
        .from('slider_banners')
        .insert({
          image_name: banner.image_name,
          image_url: banner.image_url,
          image_alt: banner.image_alt,
          patrocinador_id: banner.patrocinador_id,
          is_active: banner.is_active,
          display_order: banner.display_order
        });

      if (error) throw error;
    }

    await loadSliderBanners();
  };

  const getSliderImageInfo = (imageName: string) => {
    return availableSliderImages.find(img => img.name === imageName) || {
      name: imageName,
      title: imageName,
      description: 'Imagem do slider'
    };
  };

  return {
    sliderBanners,
    loading,
    uploadingImages,
    loadSliderBanners,
    updateSliderBanner,
    setImageUploading,
    saveSliderBanner,
    getSliderImageInfo
  };
};