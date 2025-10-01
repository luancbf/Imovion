'use client';

import Image from "next/image";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { useRef, forwardRef, useImperativeHandle } from 'react';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type ImovelCarouselProps = {
  imagens?: string[];
  cidade?: string;
  tipo?: string;
  altura?: string;
  onImageClick?: (index: number) => void;
  onSlideChange?: (index: number) => void;
  initialSlide?: number;
};

export interface ImovelCarouselRef {
  slideTo: (index: number) => void;
}

const ImovelCarousel = forwardRef<ImovelCarouselRef, ImovelCarouselProps>(({
  imagens,
  cidade,
  tipo,
  altura = "h-60 md:h-110",
  onImageClick,
  onSlideChange,
  initialSlide = 0,
}, ref) => {
  const swiperRef = useRef<SwiperType | null>(null);

  useImperativeHandle(ref, () => ({
    slideTo: (index: number) => {
      if (swiperRef.current) {
        swiperRef.current.slideTo(index);
      }
    },
  }));
  return (
    <div className={`relative ${altura} bg-gray-100 flex items-center justify-center rounded-2xl mb-6`}>
      {imagens && imagens.length > 0 ? (
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-full rounded-2xl"
          style={{ height: '100%' }}
          initialSlide={initialSlide}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
          }}
          onSlideChange={(swiper) => onSlideChange && onSlideChange(swiper.activeIndex)}
        >
          {imagens.map((img, i) => (
            <SwiperSlide key={img + i}>
              <div
                className={`relative w-full ${altura} cursor-pointer`}
                onClick={() => onImageClick && onImageClick(i)}
              >
                <Image
                  src={img}
                  alt={`Imóvel ${tipo || ""} em ${cidade || ""} - Foto ${i + 1}`}
                  fill
                  className="object-cover rounded-2xl transition-all duration-500"
                  unoptimized
                  priority={i === 0}
                  style={{ objectFit: 'cover' }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <span className="text-gray-400 text-base font-inter">Sem imagens disponíveis</span>
      )}
    </div>
  );
});

ImovelCarousel.displayName = 'ImovelCarousel';

export default ImovelCarousel;