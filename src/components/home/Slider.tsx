"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { supabase } from '@/lib/supabase'
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
  showControls?: boolean;
  autoplay?: boolean;
  type?: 'principal' | 'secundario';
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function Slider({
  className = "",
  showControls = true,
  autoplay = true,
  type = 'principal'
}: SliderProps) {
  const [banners, setBanners] = useState<SliderBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shuffledBanners = useMemo(() => (
    banners.length ? shuffleArray(banners) : []
  ), [banners]);

  useEffect(() => {
    const fetchBanners = async () => {
      setLoading(true);
      setError(null);

      try {
        // Query sem JOIN para evitar problemas de relação
        const { data: simpleData, error: simpleError } = await supabase
          .from('slider_banners')
          .select(`
            id,
            image_name,
            image_url,
            image_alt,
            order_index,
            is_active,
            is_clickable,
            patrocinador_id
          `)
          .eq('is_active', true)
          .not('image_url', 'is', null);

        if (simpleError) {
          setError('Erro ao carregar slider');
          setBanners([]);
          setLoading(false);
          return;
        }



        // Filtrar por tipo (principal/secundario)
        const filteredData = (simpleData || []).filter(banner => 
          banner.image_name && banner.image_name.toLowerCase().startsWith(type.toLowerCase())
        );



        // Buscar dados dos patrocinadores separadamente se necessário
        const processedBanners: SliderBanner[] = [];
        
        for (const banner of filteredData) {
          let patrocinadorData = null;
          
          if (banner.patrocinador_id) {
            const { data: patData } = await supabase
              .from('patrocinadores')
              .select('slug, nome')
              .eq('id', banner.patrocinador_id)
              .single();
            patrocinadorData = patData;
          }

          // Só rejeita se é clicável MAS não tem patrocinador
          if (banner.is_clickable && !patrocinadorData) {
            continue;
          }

          processedBanners.push({
            id: banner.id,
            image_name: banner.image_name,
            image_url: banner.image_url,
            image_alt: banner.image_alt || `Banner ${banner.image_name}`,
            patrocinador_slug: patrocinadorData?.slug || null,
            patrocinador_nome: patrocinadorData?.nome || null,
            order_index: banner.order_index || 0,
            is_active: banner.is_active,
            is_clickable: banner.is_clickable || false
          });
        }

        setBanners(processedBanners);
        
      } catch {
        setError('Erro de conexão ao carregar slider');
        setBanners([]);
      }
      
      setLoading(false);
    };

    fetchBanners();
  }, [type]);

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full h-50 sm:h-80 lg:h-130 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-lg flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full h-50 sm:h-80 lg:h-130 overflow-hidden bg-gradient-to-br from-red-100 to-red-200 border border-red-300 shadow-lg flex items-center justify-center">
          <div className="text-center p-4">
            <p className="text-red-800 font-medium mb-2">Erro ao carregar slider</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 text-sm transition-colors cursor-pointer"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full h-50 sm:h-80 lg:h-130 overflow-hidden flex justify-center">
        <div className=" w-full max-w-3xl md:max-w-4xl lg:max-w-3/4 mx-auto h-full">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={showControls && shuffledBanners.length > 1}
            pagination={shuffledBanners.length > 1 ? { clickable: true } : false}
            autoplay={autoplay ? {
              delay: type === 'principal' ? 4500 : 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true
            } : false}
            loop={shuffledBanners.length > 1}
            className="w-full h-full"
            style={{ height: '100%' }}
          >
            {shuffledBanners.map((banner, idx) => {
              const isClickable = banner.is_clickable && banner.patrocinador_slug && banner.patrocinador_nome;
              const linkHref = isClickable
                ? `/patrocinadores/${banner.patrocinador_slug}`
                : "/";

              return (
                <SwiperSlide key={`${banner.id}-${idx}`}>
                  <Link
                    href={linkHref}
                    className="block w-full h-full"
                    aria-label={isClickable
                      ? `Ver detalhes do ${banner.patrocinador_nome}`
                      : "Ir para página inicial"}
                    onClick={() => {
                      if (typeof window !== "undefined" && window.gtag && isClickable) {
                        window.gtag("event", "click_banner_patrocinador", {
                          patrocinador_slug: banner.patrocinador_slug,
                          patrocinador_nome: banner.patrocinador_nome,
                          banner_id: banner.id,
                          page_path: window.location.pathname,
                        });
                      }
                    }}
                  >
                    <Image
                      src={banner.image_url}
                      alt={banner.image_alt}
                      width={1200}
                      height={320}
                      priority={idx === 0 && type === 'principal'}
                      className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                    />
                  </Link>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
}