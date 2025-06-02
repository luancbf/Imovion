'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImovelModalProps {
  imagens: string[];
  aberto: boolean;
  imagemIndex: number;
  onClose: () => void;
  onAnterior: () => void;
  onProxima: () => void;
  setImagemIndex: (index: number) => void;
  handleBackgroundClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const ImovelModal: React.FC<ImovelModalProps> = ({
  imagens,
  aberto,
  imagemIndex,
  onClose,
  setImagemIndex,
  handleBackgroundClick,
}) => {
  const swiperRef = useRef<SwiperType | null>(null);

  if (!aberto || !imagens || imagens.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
      onClick={handleBackgroundClick}
      tabIndex={-1}
    >
      <div
        className="relative max-w-3xl w-full flex flex-col items-center"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white/90 text-blue-700 rounded-full p-2 shadow hover:bg-blue-100 transition cursor-pointer z-10"
          aria-label="Fechar modal"
          type="button"
        >
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 6L6 18M6 6l12 12"/></svg>
        </button>
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          initialSlide={imagemIndex}
          onSlideChange={swiper => setImagemIndex(swiper.activeIndex)}
          className="w-full h-full rounded-2xl"
          style={{ maxHeight: '80vh' }}
          onSwiper={swiper => (swiperRef.current = swiper)}
        >
          {imagens.map((img, i) => (
            <SwiperSlide key={img}>
              <div className="flex items-center justify-center w-full h-[60vh] sm:h-[70vh]">
                <Image
                  src={img}
                  alt={`Imagem ampliada ${i + 1}`}
                  width={900}
                  height={600}
                  className="rounded-2xl shadow-lg bg-white object-contain"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    display: 'block',
                    margin: '0 auto'
                  }}
                  priority={i === imagemIndex}
                  unoptimized
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Miniaturas no modal */}
        {imagens.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {imagens.map((img, index) => (
              <button
                key={index}
                onClick={() => {
                  setImagemIndex(index);
                  if (swiperRef.current) {
                    swiperRef.current.slideTo(index);
                  }
                }}
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded overflow-hidden border-2 transition ${
                  imagemIndex === index ? 'border-blue-500' : 'border-transparent'
                } cursor-pointer`}
                aria-label={`Selecionar imagem ${index + 1}`}
                type="button"
              >
                <Image
                  src={img}
                  alt={`Miniatura modal ${index + 1}`}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover hover:opacity-80"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ImovelModal;