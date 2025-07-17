"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
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
  showControls?: boolean;
  autoplay?: boolean;
  type?: 'principal' | 'secundario';
}

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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

      const { data, error } = await supabase
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
        .like('image_name', `${type}%`)
        .order('order_index', { ascending: true });

      if (error) {
        setError('Erro ao carregar slider');
        setBanners([]);
      } else {
        const processed = (data ?? []).map((config: Record<string, unknown>) => {
          const patrocinador = Array.isArray(config.patrocinadores)
            ? (config.patrocinadores[0] as { slug?: string; nome?: string })
            : (config.patrocinadores as { slug?: string; nome?: string } | undefined);

          if (typeof config.image_url === 'string' && config.image_url) {
            if (config.is_clickable && !patrocinador) return null;
            return {
              id: config.id as string,
              image_name: config.image_name as string,
              image_url: config.image_url as string,
              image_alt: (config.image_alt as string) || `Banner ${config.image_name}`,
              patrocinador_slug: patrocinador?.slug || null,
              patrocinador_nome: patrocinador?.nome || null,
              order_index: config.order_index as number,
              is_active: config.is_active as boolean,
              is_clickable: config.is_clickable as boolean || false
            };
          }
          return null;
        }).filter(Boolean) as SliderBanner[];

        setBanners(processed);
      }
      setLoading(false);
    };

    fetchBanners();
  }, [type]);

  if (loading) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full h-50 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse shadow-lg flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full h-30 overflow-hidden bg-gradient-to-br from-red-100 to-red-200 border border-red-300 shadow-lg flex items-center justify-center">
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
    );
  }

  if (!shuffledBanners.length) {
    return (
      <div className={`w-full ${className}`}>
        <div className="relative w-full h-30 flex items-center justify-center bg-gray-100 border border-gray-200 rounded-xl">
          <span className="text-gray-500 text-sm">Nenhum banner configurado para exibição.</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      <div className="relative w-full h-50 sm:h-80 lg:h-110 bg-gray-100 overflow-hidden">
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
                >
                  <Image
                    src={banner.image_url}
                    alt={banner.image_alt}
                    width={1200}
                    height={320}
                    priority={idx === 0 && type === 'principal'}
                    className="object-cover w-full h-full transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                    quality={90}
                  />
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}