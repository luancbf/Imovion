import Link from "next/link";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperCore } from "swiper";
import { useState } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Imovel {
  id: string;
  cidade: string;
  bairro: string;
  enderecoDetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoImovel: string;
  tipoNegocio: string;
  setorNegocio?: string;
  whatsapp: string;
  patrocinador?: string;
  imagens: string[];
}

// Função utilitária para trocar "_" por espaço
function formatarTexto(texto: string) {
  return texto.replace(/_/g, " ");
}

export default function ImovelCard({ imovel }: { imovel: Imovel }) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperCore | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col">
      <div className="relative h-48 bg-gray-100 flex items-center justify-center">
        {imovel.imagens && imovel.imagens.length > 0 ? (
          <>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: `.swiper-button-next-${imovel.id}`,
                prevEl: `.swiper-button-prev-${imovel.id}`,
              }}
              pagination={{
                clickable: true,
                bulletClass: "swiper-pagination-bullet bg-gray-400 opacity-100",
                bulletActiveClass: "swiper-pagination-bullet-active bg-blue-500",
              }}
              onSwiper={setSwiperInstance}
              className="h-full"
            >
              {imovel.imagens.map((imagem, idx) => (
                <SwiperSlide key={idx}>
                  <Image
                    src={imagem}
                    alt={`Imagem do imóvel em ${formatarTexto(imovel.cidade)}`}
                    width={400}
                    height={192}
                    className="w-full h-full object-cover"
                    unoptimized
                    priority={idx === 0}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            {/* Botões de navegação exclusivos para cada card */}
            <button
              className={`swiper-button-prev swiper-button-prev-${imovel.id} absolute left-2 top-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors`}
              onClick={() => swiperInstance?.slidePrev()}
              aria-label="Imagem anterior"
              type="button"
            >
              {"<"}
            </button>
            <button
              className={`swiper-button-next swiper-button-next-${imovel.id} absolute right-2 top-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors`}
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Próxima imagem"
              type="button"
            >
              {">"}
            </button>
          </>
        ) : (
          <span className="text-gray-400">Sem imagem</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h2 className="text-xl font-bold mb-1">{formatarTexto(imovel.tipoImovel)}</h2>
        <p className="text-gray-700 font-semibold mb-2">
          {formatarTexto(imovel.bairro)}, {formatarTexto(imovel.cidade)}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Endereço:</span> {formatarTexto(imovel.enderecoDetalhado)}
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Área:</span> {imovel.metragem} m²
        </p>
        <p className="text-gray-600 mb-1">
          <span className="font-medium">Valor:</span>{" "}
          <span className="font-bold">
            {imovel.valor.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </span>
        </p>
        <p className="text-gray-600 mb-2">
          <span className="font-medium">Descrição:</span> {formatarTexto(imovel.descricao)}
        </p>
        <div className="mt-auto flex justify-center gap-2">
          <Link
            href={`/imoveis/${imovel.id}`}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition"
          >
            Ver detalhes
          </Link>
          <a
            href={`https://wa.me/${imovel.whatsapp.replace(/\D/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition"
          >
            Entrar em contato
          </a>
        </div>
      </div>
    </div>
  );
}