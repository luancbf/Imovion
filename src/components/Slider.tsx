"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";

const slides = [
  { src: "/banner-1.png", href: "/patrocinadores/patrocinador-1" },
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
    <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-lg mt-5 mb-20">
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
        className="absolute top-1/2 left-4 -translate-y-1/2 bg-black text-white px-5 py-2 rounded-2xl z-10 hover:bg-gray-700 cursor-pointer"
      >
        ‹
      </button>
      <button
        onClick={nextSlide}
        aria-label="Próximo slide"
        className="absolute top-1/2 right-4 -translate-y-1/2 bg-black text-white px-5 py-2 rounded-2xl z-10 hover:bg-gray-700 cursor-pointer"
      >
        ›
      </button>

      {/* Bullets */}
      <div className="absolute bottom-4 w-full flex justify-center gap-2">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            aria-label={`Ir para o slide ${idx + 1}`}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              idx === current ? "bg-white" : "bg-white/50"
            }`}
            tabIndex={0}
          />
        ))}
      </div>
    </div>
  );
}