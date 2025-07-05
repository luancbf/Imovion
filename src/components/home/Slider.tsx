"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { createBrowserClient } from "@supabase/ssr";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SliderBanner {
  id: string;
  image_name: string;
  image_url: string;
  image_alt: string;
  patrocinador_slug: string | null;
  patrocinador_nome: string | null;
  order_index: number;
  is_active: boolean;
  is_clickable: boolean;
}

interface SliderProps {
  className?: string;
  height?: 'small' | 'medium' | 'large';
  showControls?: boolean;
  autoplay?: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function Slider({ 
  className = "",
  height = 'large',
  showControls = true,
  autoplay = true
}: SliderProps) {
  const [banners, setBanners] = useState<SliderBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Classes de altura responsivas
  const heightClasses = {
    small: 'h-[200px] sm:h-[250px]',
    medium: 'h-[300px] sm:h-[400px]',
    large: 'h-[400px] sm:h-[500px] lg:h-[600px]'
  };

  useEffect(() => {
    async function fetchBanners() {
      try {
        setLoading(true);
        setError(null);

        const { data: sliderConfigs, error } = await supabase
          .from('slider_banners')
          .select(`
            id,
            image_name,
            image_url,
            image_alt,
            order_index,
            is_active,
            is_clickable,
            patrocinadores (
              slug,
              nome
            )
          `)
          .eq('is_active', true)
          .not('image_url', 'is', null)
          .order('order_index', { ascending: true });

        if (error) {
          console.error('❌ [SLIDER] Erro ao buscar configurações:', error);
          setError('Erro ao carregar slider');
          setBanners([]);
          return;
        }

        console.log('📊 [SLIDER] Dados recebidos:', sliderConfigs);

        const processedBanners: SliderBanner[] = [];
        
        sliderConfigs?.forEach(config => {
          const patrocinador = Array.isArray(config.patrocinadores) 
            ? config.patrocinadores[0] 
            : config.patrocinadores;

          if (config.image_url && typeof config.image_url === 'string') {
            // ✅ NOVA LÓGICA: Para banners clicáveis, validar se tem patrocinador
            if (config.is_clickable && !patrocinador) {
              console.warn('⚠️ [SLIDER] Banner clicável sem patrocinador:', config.image_name);
              return; // Pula este banner se for clicável mas não tem patrocinador
            }

            processedBanners.push({
              id: config.id,
              image_name: config.image_name,
              image_url: config.image_url,
              image_alt: config.image_alt || `Banner ${config.image_name}`,
              patrocinador_slug: patrocinador?.slug || null,
              patrocinador_nome: patrocinador?.nome || null,
              order_index: config.order_index,
              is_active: config.is_active,
              is_clickable: config.is_clickable || false
            });
          }
        });

        console.log('✅ [SLIDER] Banners processados:', processedBanners);
        setBanners(processedBanners);
      } catch (error) {
        console.error('❌ [SLIDER] Erro ao carregar banners:', error);
        setError('Erro ao carregar slider');
        setBanners([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBanners();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`relative w-full ${heightClasses[height]} overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-lg`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className={`relative w-full ${heightClasses[height]} overflow-hidden bg-gradient-to-br from-red-100 to-red-200 border border-red-300 shadow-lg`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4">
              <p className="text-red-800 font-medium mb-2">Erro ao carregar slider</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Não renderiza se não houver banners
  if (banners.length === 0) {
    return null;
  }

  return (
    <div className={`w-full ${className}`}>
      <div className={`relative w-full h-50 sm:h-70 lg:h-110 bg-gray-100 shadow-lg overflow-hidden`}>
        <Swiper
          modules={[Navigation, Pagination, Autoplay]}
          navigation={showControls && banners.length > 1}
          pagination={banners.length > 1 ? { clickable: true } : false}
          autoplay={autoplay ? { 
            delay: 4500,
            disableOnInteraction: false,
            pauseOnMouseEnter: true 
          } : false}
          loop={banners.length > 1}
          className="w-full h-full"
          style={{ height: '100%' }}
        >
          {banners.map((banner, idx) => {
            const isClickable = banner.is_clickable;
            const hasPatrocinador = banner.patrocinador_slug && banner.patrocinador_nome;

            return (
              <SwiperSlide key={banner.id}>
                <div className="relative w-full h-full">
                  {/* ✅ CORRIGIDO: Lógica de link baseada na clicabilidade */}
                  {isClickable && hasPatrocinador ? (
                    <Link 
                      href={`/patrocinadores/${banner.patrocinador_slug}`}
                      className="block w-full h-full"
                      aria-label={`Ver detalhes do ${banner.patrocinador_nome}`}
                    >
                      <Image
                        src={banner.image_url}
                        alt={banner.image_alt}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        priority={idx === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                        quality={90}
                        style={{ objectFit: 'cover' }}
                      />
                    </Link>
                  ) : (
                    // ✅ Para banners não clicáveis, vai para home
                    <Link 
                      href="/"
                      className="block w-full h-full"
                      aria-label="Ir para página inicial"
                    >
                      <Image
                        src={banner.image_url}
                        alt={banner.image_alt}
                        fill
                        className="object-cover transition-transform duration-500 hover:scale-105"
                        priority={idx === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
                        quality={90}
                        style={{ objectFit: 'cover' }}
                      />
                    </Link>
                  )}
                </div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}