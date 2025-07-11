'use client';

import Image from "next/image";
import Link from "next/link";
import { FaBed, FaBath, FaCar, FaRulerCombined, FaWarehouse } from "react-icons/fa";
import { MdMeetingRoom } from "react-icons/md";
import { GiFarmTractor } from "react-icons/gi";
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

type ItemPrincipal = {
  icon: React.ReactElement;
  label: string;
  value: number | string;
};

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

  const salas =
    typeof imovel.itens?.salas === "number"
      ? imovel.itens.salas
      : Number(imovel.itens?.salas) || 0;

  const hectares =
    typeof imovel.itens?.hectares === "number"
      ? imovel.itens.hectares
      : Number(imovel.itens?.hectares) || 0;

  const galpoes =
    typeof imovel.itens?.galpoes === "number"
      ? imovel.itens.galpoes
      : Number(imovel.itens?.galpoes) || 0;

  let itensPrincipais: ItemPrincipal[] = [];

  if (imovel.setornegocio === "Residencial") {
    itensPrincipais = [
      { icon: <FaRulerCombined className="text-lg" title="Área" />, label: "Área", value: `${imovel.metragem || 0} m²` },
      { icon: <FaBed className="text-lg" title="Quartos" />, label: "Quartos", value: quartos },
      { icon: <FaBath className="text-lg" title="Banheiros" />, label: "Banheiros", value: banheiros },
      { icon: <FaCar className="text-lg" title="Garagens" />, label: "Garagens", value: garagens },
    ];
  } else if (imovel.setornegocio === "Comercial") {
    itensPrincipais = [
      { icon: <FaRulerCombined className="text-lg" title="Área" />, label: "Área", value: `${imovel.metragem || 0} m²` },
      { icon: <MdMeetingRoom className="text-lg" title="Salas" />, label: "Salas", value: salas },
      { icon: <FaCar className="text-lg" title="Garagens" />, label: "Garagens", value: garagens },
      { icon: <FaBath className="text-lg" title="Banheiros" />, label: "Banheiros", value: banheiros },
    ];
  } else if (imovel.setornegocio === "Rural") {
    itensPrincipais = [
      { icon: <FaRulerCombined className="text-lg" title="Área" />, label: "Área", value: `${imovel.metragem || 0} m²` },
      { icon: <GiFarmTractor className="text-lg" title="Hectares" />, label: "Hectares", value: hectares },
      { icon: <FaWarehouse className="text-lg" title="Galpões" />, label: "Galpões", value: galpoes },
    ];
  }

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
        
        <div className="font-inter text-normal text-gray-600 space-y-1">
          <p>
            <span className="font-poppins font-bold">Local:</span> {formatarTexto(imovel.bairro)}, {formatarTexto(imovel.cidade)}
          </p>
          <p>
            <span className="font-poppins font-bold">Endereço:</span> {formatarTexto(imovel.enderecodetalhado)}
          </p>
        </div>

        {/* Itens principais dinâmicos */}
        <div className="flex items-center gap-4 mt-3">
          {itensPrincipais
            .filter(item => {
              if (typeof item.value === "string") {
                const num = Number(item.value.toString().replace(/[^\d.]/g, ""));
                return num > 0;
              }
              return typeof item.value === "number" ? item.value > 0 : true;
            })
            .map((item, idx) => (
              <div key={item.label + idx} className="flex items-center gap-1 text-blue-900">
                {item.icon}
                <span className="font-bold text-sm">{item.value}</span>
              </div>
            ))}
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