'use client';

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import type { Imovel } from "@/types/Imovel";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

function formatarTexto(texto: string | undefined) {
  return typeof texto === 'string' ? texto.replace(/_/g, " ") : '';
}

type ImovelCardProps = {
  imovel: Imovel;
  contexto?: "patrocinador" | "categoria";
};

function negocioFormatado(tipoNegocio?: string) {
  if (!tipoNegocio) return "";
  const txt = formatarTexto(tipoNegocio).toLowerCase();
  if (txt === "comprar") return "Comprar";
  if (txt === "alugar") return "Alugar";
  if (txt === "venda") return "Venda";
  if (txt === "aluguel") return "Aluguel";
  return txt.charAt(0).toUpperCase() + txt.slice(1);
}

export default function ImovelCard({ imovel, contexto = "categoria" }: ImovelCardProps) {
  const [exibirMais, setExibirMais] = useState(false);
  const imagens = imovel.imagens || [];
  const itensDisponiveis = useMemo(
    () => ITENS_POR_SETOR[imovel.tipoNegocio] || [],
    [imovel.tipoNegocio]
  );

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col">
      {/* Slider de Imagens com Swiper */}
      <div className="relative h-45 md:h-64 bg-gray-100 flex items-center justify-center">
        {imagens.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-full rounded"
            style={{ height: '100%' }}
          >
            {imagens.map((img, i) => (
              <SwiperSlide key={img}>
                <div className="relative w-full h-45 md:h-64">
                  <Image
                    src={img}
                    alt={`Imóvel ${formatarTexto(imovel.tipoImovel)} em ${formatarTexto(imovel.cidade)} - Foto ${i + 1}`}
                    fill
                    className="object-cover rounded transition-all duration-500"
                    unoptimized
                    priority={i === 0}
                    style={{ objectFit: 'cover' }}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <span className="text-gray-400 text-base">Sem imagens disponíveis</span>
        )}
      </div>

      {/* Detalhes do Imóvel */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="font-poppins text-lg md:text-xl font-bold text-blue-900">
            {contexto === "patrocinador"
              ? `${formatarTexto(imovel.setorNegocio)} - ${negocioFormatado(imovel.tipoNegocio)} - ${formatarTexto(imovel.tipoImovel)}`
              : formatarTexto(imovel.tipoImovel)}
          </h3>
        </div>
        <p className="font-poppins text-green-700 font-bold text-xl md:text-2xl">
          {imovel.valor?.toLocaleString
            ? imovel.valor.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })
            : ''}
        </p>
        <div className="font-inter text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-poppins font-bold">Local:</span> {formatarTexto(imovel.bairro)}, {formatarTexto(imovel.cidade)}
          </p>
          <p>
            <span className="font-poppins font-bold">Endereço:</span> {formatarTexto(imovel.enderecoDetalhado)}
          </p>
          <p>
            <span className="font-poppins font-bold">Área:</span> {imovel.metragem}m²
          </p>
        </div>
        {/* Exibir mais */}
        <button
          className="flex items-center gap-1 font-inter text-blue-700 hover:underline text-xs mt-1 cursor-pointer"
          onClick={() => setExibirMais((v) => !v)}
          type="button"
        >
          {exibirMais ? (
            <>
              Ocultar detalhes <FaChevronUp className="text-xs" />
            </>
          ) : (
            <>
              Exibir mais <FaChevronDown className="text-xs" />
            </>
          )}
        </button>
        {/* Conteúdo extra */}
        {exibirMais && (
          <div className="mt-2">
            <p className="text-gray-700 text-sm mb-2 whitespace-pre-line">
              {formatarTexto(imovel.descricao)}
            </p>
            <div>
              <h4 className="font-semibold text-blue-900 mb-1">Itens do imóvel</h4>
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                {itensDisponiveis.map((item) => {
                  const valor = imovel.itens?.[item.chave];
                  if (typeof valor !== 'number' || valor === 0) return null;
                  const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
                  return (
                    <div key={item.chave} className="flex flex-col items-center bg-blue-50 rounded px-2 py-1 min-w-0">
                      <span className="text-blue-900 text-xs text-center truncate w-full" title={item.label}>
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-blue-700 mt-1">
                        {isQuant ? valor : "Sim"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
        {/* Botões de Ação */}
        <div className="font-poppins flex flex-wrap gap-2 mt-4">
          <Link
            href={`/imoveis/${imovel.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded transition-colors cursor-pointer"
            aria-label="Ver detalhes do imóvel"
          >
            Ver detalhes
          </Link>
          <a
            href={`https://wa.me/55${(imovel.whatsapp || '').replace(/\D/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-3 py-2 rounded transition-colors cursor-pointer"
            aria-label="Entrar em contato"
          >
            Entrar em contato
          </a>
        </div>
      </div>
    </div>
  );
}