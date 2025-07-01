"use client";

import Link from "next/link";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiExternalLink } from "react-icons/fi";
import { useRef, useEffect, useState, useId } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { createBrowserClient } from "@supabase/ssr";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

interface SliderBanner {
  id: string;
  image_name: string;
  image_url: string;
  image_alt: string;
  patrocinador_slug: string;
  patrocinador_nome: string;
  display_order: number;
  is_active: boolean;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function Slider() {
  const uniqueId = useId(); // Gera ID único para cada instância
  const swiperRef = useRef<SwiperType | null>(null);
  const [banners, setBanners] = useState<SliderBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

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
            display_order,
            is_active,
            patrocinadores (
              slug,
              nome
            )
          `)
          .eq('is_active', true)
          .not('image_url', 'is', null)
          .not('patrocinador_id', 'is', null)
          .order('display_order', { ascending: true });

        if (error) {
          console.error('Erro ao buscar configurações do slider:', error);
          setError('Erro ao carregar slider');
          setBanners([]);
          return;
        }

        const processedBanners: SliderBanner[] = [];
        
        sliderConfigs?.forEach(config => {
          const patrocinador = Array.isArray(config.patrocinadores) 
            ? config.patrocinadores[0] 
            : config.patrocinadores;

          if (patrocinador && config.image_url && typeof config.image_url === 'string') {
            processedBanners.push({
              id: config.id,
              image_name: config.image_name,
              image_url: config.image_url,
              image_alt: config.image_alt || `Banner do ${patrocinador.nome}`,
              patrocinador_slug: patrocinador.slug,
              patrocinador_nome: patrocinador.nome,
              display_order: config.display_order,
              is_active: config.is_active
            });
          }
        });

        setBanners(processedBanners);
      } catch (error) {
        console.error('Erro ao carregar banners:', error);
        setError('Erro ao carregar slider');
        setBanners([]);
      } finally {
        setLoading(false);
      }
    }

    fetchBanners();
  }, []);

  const toggleAutoplay = () => {
    if (swiperRef.current) {
      if (isPlaying) {
        swiperRef.current.autoplay.stop();
      } else {
        swiperRef.current.autoplay.start();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setCurrentSlide(swiper.realIndex);
  };

  // Classes úniques para este slider
  const paginationClass = `pagination-${uniqueId}`;
  const bulletClass = `bullet-${uniqueId}`;
  const bulletActiveClass = `bullet-active-${uniqueId}`;

  // Loading state
  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 mb-8">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 mb-8">
        <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden rounded-3xl shadow-2xl bg-gradient-to-br from-red-100 to-red-200 border border-red-300">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8">
              <h3 className="text-xl font-bold text-red-800 mb-3">
                Erro ao carregar slider
              </h3>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Tentar Novamente
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Não renderiza nada se não houver banners
  if (banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 mb-8">
      <div 
        className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden rounded-3xl shadow-2xl group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade]}
          onSwiper={swiper => (swiperRef.current = swiper)}
          onSlideChange={handleSlideChange}
          autoplay={{ 
            delay: 5000, 
            disableOnInteraction: false,
            pauseOnMouseEnter: true 
          }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          loop={banners.length > 1}
          pagination={{ 
            clickable: true, 
            el: `.${paginationClass}`,
            bulletClass: bulletClass,
            bulletActiveClass: bulletActiveClass
          }}
          className="w-full h-full"
          speed={800}
        >
          {banners.map((banner, idx) => (
            <SwiperSlide key={banner.id}>
              <div className="relative w-full h-full group/slide">
                <Link 
                  href={`/patrocinadores/${banner.patrocinador_slug}`}
                  className="block w-full h-full relative overflow-hidden"
                  aria-label={`Ver detalhes do ${banner.patrocinador_nome}`}
                >
                  <Image
                    src={banner.image_url}
                    alt={banner.image_alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/slide:scale-105"
                    priority={idx === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
                    quality={90}
                  />
                  
                  {/* Overlay Gradiente */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-70 group-hover/slide:opacity-50 transition-opacity duration-500" />
                  
                  {/* Informações do Banner */}
                  <div className="absolute bottom-8 left-8 right-8 text-white transform translate-y-4 group-hover/slide:translate-y-0 transition-transform duration-500">
                    <div className="max-w-2xl">
                      <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 opacity-0 group-hover/slide:opacity-100 transition-opacity duration-700 delay-100">
                        {banner.patrocinador_nome}
                      </h3>
                      <p className="text-lg md:text-xl text-white/90 mb-4 opacity-0 group-hover/slide:opacity-100 transition-opacity duration-700 delay-200">
                        Conheça nosso parceiro e descubra soluções incríveis
                      </p>
                      <div className="flex items-center gap-2 text-white/80 opacity-0 group-hover/slide:opacity-100 transition-opacity duration-700 delay-300">
                        <FiExternalLink size={20} />
                        <span className="font-medium">Ver detalhes</span>
                      </div>
                    </div>
                  </div>

                  {/* Indicador do Slide */}
                  <div className="absolute top-6 right-6 bg-black/30 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm font-medium">
                    {idx + 1} de {banners.length}
                  </div>
                </Link>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Controles de Navegação */}
        {banners.length > 1 && (
          <>
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              aria-label="Slide anterior"
              className={`absolute top-1/2 left-4 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 backdrop-blur-sm hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-70 -translate-x-2'
              }`}
            >
              <FiChevronLeft size={24} />
            </button>
            
            <button
              onClick={() => swiperRef.current?.slideNext()}
              aria-label="Próximo slide"
              className={`absolute top-1/2 right-4 -translate-y-1/2 z-20 w-12 h-12 bg-black/20 backdrop-blur-sm hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 ${
                isHovered ? 'opacity-100 translate-x-0' : 'opacity-70 translate-x-2'
              }`}
            >
              <FiChevronRight size={24} />
            </button>
          </>
        )}

        {/* Controle de Play/Pause */}
        {banners.length > 1 && (
          <button
            onClick={toggleAutoplay}
            aria-label={isPlaying ? "Pausar slider" : "Reproduzir slider"}
            className={`absolute top-6 left-6 z-20 w-10 h-10 bg-black/20 backdrop-blur-sm hover:bg-black/40 rounded-full flex items-center justify-center text-white transition-all duration-300 ${
              isHovered ? 'opacity-100' : 'opacity-70'
            }`}
          >
            {isPlaying ? <FiPause size={16} /> : <FiPlay size={16} />}
          </button>
        )}

        {/* Paginação Customizada */}
        <div className={`${paginationClass} absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20`} />

        {/* Indicador de Progresso */}
        {banners.length > 1 && (
          <div className="absolute bottom-0 left-0 w-full h-1 bg-white/20 z-10">
            <div 
              className="h-full bg-white transition-all duration-300 ease-linear"
              style={{ 
                width: `${((currentSlide + 1) / banners.length) * 100}%` 
              }}
            />
          </div>
        )}
      </div>

      {/* CSS Personalizado para esta instância específica */}
      <style jsx>{`
        :global(.${bulletClass}) {
          width: 12px;
          height: 12px;
          background: rgba(255, 255, 255, 0.4);
          border-radius: 50%;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(4px);
        }
        
        :global(.${bulletActiveClass}) {
          background: rgba(255, 255, 255, 0.9) !important;
          transform: scale(1.2);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
        }
        
        :global(.${bulletClass}:hover) {
          background: rgba(255, 255, 255, 0.7);
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
}