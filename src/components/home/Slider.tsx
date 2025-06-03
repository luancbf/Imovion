"use client";

import Link from "next/link";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const slides = [
  { src: "/banner-1.png", href: "/patrocinadores/thiago-kaiser" },
  { src: "/banner-2.png", href: "/patrocinadores/patrocinador-2" },
  { src: "/banner-3.png", href: "/patrocinadores/patrocinador-3" },
];

export default function Slider() {
  const swiperRef = useRef<SwiperType | null>(null);

  return (
    <div className="w-[90vw] sm:w-[80vw] md:max-w-3xl mx-auto h-45 sm:h-75 lg:h-90 relative overflow-hidden rounded-2xl shadow-lg flex items-center justify-center">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        onSwiper={swiper => (swiperRef.current = swiper)}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        loop
        pagination={{ clickable: true, el: ".custom-swiper-pagination" }}
        className="w-full h-full"
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="w-full h-full flex items-center justify-center">
              <Link href={slide.href}>
                <Image
                  src={slide.src}
                  alt={`Banner do patrocinador ${idx + 1}`}
                  fill
                  className="object-cover"
                  priority={idx === 0}
                  sizes="(max-width: 768px) 100vw, 900px"
                />
              </Link>
            </div>
          </SwiperSlide>
        ))}
        <div className="custom-swiper-pagination absolute bottom-4 w-full flex justify-center gap-2 z-10" />
      </Swiper>

      {/* Botões de navegação */}
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        aria-label="Slide anterior"
        className="flex items-center justify-center absolute top-1/2 left-5 -translate-y-1/2 text-white hover:text-gray-800 z-10 cursor-pointer"
        type="button"
      >
        <FiChevronLeft size={40} />
      </button>
      <button
        onClick={() => swiperRef.current?.slideNext()}
        aria-label="Próximo slide"
        className="flex items-center justify-center absolute top-1/2 right-5 -translate-y-1/2 text-white hover:text-gray-800 z-10 cursor-pointer"
        type="button"
      >
        <FiChevronRight size={40} />
      </button>
    </div>
  );
}