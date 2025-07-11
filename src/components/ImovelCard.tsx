'use client';

import Image from "next/image";
import Link from "next/link";
import { FaBed, FaBath, FaCar, FaRulerCombined } from "react-icons/fa";
import type { Imovel } from "@/types/Imovel";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function formatarTexto(texto?: string) {
  return texto ? texto.replace(/_/g, " ") : '';
}

function negocioFormatado(tipoNegocio?: string) {
  if (!tipoNegocio) return "";
  const txt = formatarTexto(tipoNegocio).toLowerCase();
  if (txt === "comprar") return "Comprar";
  if (txt === "alugar") return "Alugar";
  if (txt === "venda") return "Venda";
  if (txt === "aluguel") return "Aluguel";
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

type ImovelCardProps = {
  imovel: Imovel;
  contexto?: "patrocinador" | "categoria";
};

export default function ImovelCard({ imovel, contexto = "categoria" }: ImovelCardProps) {
  const imagens = imovel.imagens?.length ? imovel.imagens : ["/imoveis/sem-imagem.jpg"];

  const quartos =
    typeof imovel.itens?.quartos === "number"
      ? imovel.itens.quartos
      : Number(imovel.itens?.quartos) || 0;

  const banheiros =
    typeof imovel.itens?.banheiros === "number"
      ? imovel.itens.banheiros
      : Number(imovel.itens?.banheiros) || 0;

  const garagens =
    typeof imovel.itens?.garagens === "number"
      ? imovel.itens.garagens
      : Number(imovel.itens?.garagens) || 0;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col">
      <div className="relative h-45 md:h-50 bg-gray-100 flex items-center justify-center custom-swiper-arrows">
        <Swiper
          modules={[Navigation]}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-full rounded"
          style={{ height: '100%' }}
        >
          {imagens.map((img, i) => (
            <SwiperSlide key={`${img}-${i}`}>
              <div className="relative w-full h-45 md:h-50">
                <Image
                  src={img}
                  alt={`Imóvel ${formatarTexto(imovel.tipoimovel)} em ${formatarTexto(imovel.cidade)} - Foto ${i + 1}`}
                  fill
                  className="object-cover rounded transition-all duration-500"
                  unoptimized
                  priority={i === 0}
                  style={{ objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('Erro ao carregar imagem:', img);
                    const target = e.target as HTMLImageElement;
                    target.src = "/imoveis/sem-imagem.jpg";
                  }}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        
        <style jsx global>{`
          .custom-swiper-arrows .swiper-button-next::after,
          .custom-swiper-arrows .swiper-button-prev::after {
            font-size: 1.5rem !important;
          }
        `}</style>
      </div>
      
      <div className="p-4 flex-1 flex flex-col gap-2">
        <h3 className="font-poppins text-lg md:text-xl font-bold text-blue-900">
          {contexto === "patrocinador"
            ? `${formatarTexto(imovel.setornegocio)} - ${negocioFormatado(imovel.tiponegocio)} - ${formatarTexto(imovel.tipoimovel)}`
            : formatarTexto(imovel.tipoimovel)}
        </h3>
        
        <p className="font-poppins text-green-700 font-bold text-xl md:text-2xl">
          {imovel.valor && typeof imovel.valor === 'number'
            ? imovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
            : 'Consulte o valor'}
        </p>
        
        <div className="font-inter text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-poppins font-bold">Local:</span> {formatarTexto(imovel.bairro)}, {formatarTexto(imovel.cidade)}
          </p>
          <p>
            <span className="font-poppins font-bold">Endereço:</span> {formatarTexto(imovel.enderecodetalhado)}
          </p>
        </div>

        {/* Área e itens principais sincronizados */}
        <div className="flex items-center gap-4 mt-3">
          {/* Área */}
          <div className="flex items-center gap-1 text-blue-900">
            <FaRulerCombined className="text-lg" title="Área" />
            <span className="font-bold text-sm">{imovel.metragem || 0}m²</span>
          </div>
          {/* Quartos */}
          <div className="flex items-center gap-1 text-blue-900">
            <FaBed className="text-lg" title="Quartos" />
            <span className="font-bold text-sm">{quartos}</span>
          </div>
          {/* Banheiros */}
          <div className="flex items-center gap-1 text-blue-900">
            <FaBath className="text-lg" title="Banheiros" />
            <span className="font-bold text-sm">{banheiros}</span>
          </div>
          {/* Garagens */}
          <div className="flex items-center gap-1 text-blue-900">
            <FaCar className="text-lg" title="Garagens" />
            <span className="font-bold text-sm">{garagens}</span>
          </div>
        </div>

        {/* Botões de ação */}
        <div className="font-poppins flex flex-wrap gap-2 mt-4">
          <Link
            href={`/imoveis/${imovel.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label={`Ver detalhes do imóvel ${imovel.tipoimovel} em ${imovel.cidade}`}
          >
            Ver detalhes
          </Link>
          {imovel.whatsapp && (
            <a
              href={`https://wa.me/55${imovel.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                `Olá! Tenho interesse no imóvel ${imovel.tipoimovel || 'não especificado'} em ${imovel.cidade || 'localização não informada'} - ${imovel.bairro || 'bairro não informado'}. Valor: ${
                  imovel.valor 
                    ? imovel.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                    : 'A consultar'
                }`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Entrar em contato via WhatsApp"
            >
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}