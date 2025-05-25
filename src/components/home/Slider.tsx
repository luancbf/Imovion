"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const slides = [
  { src: "/banner-1.png", href: "/patrocinadores/thiago-kaiser" },
  { src: "/banner-2.png", href: "/patrocinadores/patrocinador-2" },
  { src: "/banner-3.png", href: "/patrocinadores/patrocinador-3" },
];

export default function Slider() {
  const [current, setCurrent] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const length = slides.length;

  const resetTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    resetTimeout();
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev === length - 1 ? 0 : prev + 1));
    }, 7000);

    return () => resetTimeout();
  }, [current, length]);

  const goToSlide = (index: number) => setCurrent(index);
  const prevSlide = () => setCurrent(current === 0 ? length - 1 : current - 1);
  const nextSlide = () => setCurrent(current === length - 1 ? 0 : current + 1);

  return (
    <div className="flex items-center relative w-full max-w-90 sm:max-w-2xl h-50 sm:h-75 mx-auto overflow-hidden rounded-2xl shadow-lg">
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {slides.map((slide, idx) => (
          <Link key={idx} href={slide.href} className="w-full flex-shrink-0">
            <Image
              src={slide.src}
              alt={`Banner do patrocinador ${idx + 1}`}
              width={1200}
              height={400}
              className="w-full object-cover h-[300px] md:h-[400px]"
              priority={idx === 0}
            />
          </Link>
        ))}
      </div>

      {/* Botões de navegação */}
      <button
        onClick={prevSlide}
        aria-label="Slide anterior"
        className="flex items-center justify-center absolute top-1/2 left-3 -translate-y-1/2 text-white px-2 py-1 rounded-2xl z-10 hover:bg-gray-700 cursor-pointer"
      >
        <FiChevronLeft size={30} />
      </button>
      <button
        onClick={nextSlide}
        aria-label="Próximo slide"
        className="flex items-center justify-center absolute top-1/2 right-3 -translate-y-1/2 text-white px-2 py-1 rounded-2xl z-10 hover:bg-gray-700 cursor-pointer"
      >
        <FiChevronRight size={30} />
      </button>

      {/* Bullets */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            aria-label={`Ir para o slide ${idx + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              idx === current ? "bg-white" : "bg-white/50"
            }`}
            tabIndex={0}
          />
        ))}
      </div>
    </div>
  );
}