'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaLink, FaCheck, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperCore } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Timestamp } from 'firebase/firestore';

interface Imovel {
  id?: string;
  cidade: string;
  bairro: string;
  enderecoDetalhado: string;
  valor: number;
  metragem: number;
  descricao: string;
  tipoImovel: string;
  tipoNegocio: string;
  whatsapp: string;
  patrocinador?: string;
  imagens: string[];
  dataCadastro?: Date | Timestamp | string;
}

interface ImovelCardProps {
  imovel: Imovel;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export default function ImovelCard({ imovel, onDelete, onEdit }: ImovelCardProps) {
  const [copiado, setCopiado] = useState(false);
  const [swiperInstance, setSwiperInstance] = useState<SwiperCore | null>(null);

  const copiarLink = async () => {
    try {
      const url = `${window.location.origin}/imovel/${imovel.id}`;
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch (error) {
      console.error('Falha ao copiar link:', error);
    }
  };

  const formatarData = (data?: Date | Timestamp | string): string => {
    if (!data) return 'Data não informada';
    try {
      if (typeof data === 'object' && 'toDate' in data) {
        return data.toDate().toLocaleDateString('pt-BR');
      }
      if (data instanceof Date) {
        return data.toLocaleDateString('pt-BR');
      }
      const dateObj = new Date(data);
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('pt-BR');
      }
      return 'Data inválida';
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Carrossel de Imagens */}
      <div className="relative h-48 bg-gray-200">
        {imovel.imagens?.length > 0 ? (
          <>
            <Swiper
              modules={[Navigation, Pagination]}
              navigation={{
                nextEl: `.swiper-button-next-${imovel.id}`,
                prevEl: `.swiper-button-prev-${imovel.id}`,
              }}
              pagination={{
                clickable: true,
                bulletClass: 'swiper-pagination-bullet bg-gray-400 opacity-100',
                bulletActiveClass: 'swiper-pagination-bullet-active bg-blue-500'
              }}
              onSwiper={setSwiperInstance}
              className="h-full"
            >
              {imovel.imagens.map((imagem, index) => (
                <SwiperSlide key={index}>
                  <img
                    src={imagem}
                    alt={`Imóvel ${imovel.tipoImovel} em ${imovel.cidade} - Foto ${index + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Botões de navegação */}
            <button 
              className={`swiper-button-prev swiper-button-prev-${imovel.id} absolute left-2 top-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors`}
              onClick={() => swiperInstance?.slidePrev()}
              aria-label="Imagem anterior"
              type="button"
            >
              <FaArrowLeft className="text-gray-800 text-sm" />
            </button>
            <button 
              className={`swiper-button-next swiper-button-next-${imovel.id} absolute right-2 top-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors`}
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Próxima imagem"
              type="button"
            >
              <FaArrowRight className="text-gray-800 text-sm" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-500 text-sm">Sem imagens disponíveis</span>
          </div>
        )}
      </div>

      {/* Detalhes do Imóvel */}
      <div className="p-4 space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold text-gray-800">
            {imovel.tipoImovel} - {imovel.tipoNegocio}
          </h3>
          <span className="text-xs text-gray-500">
            {formatarData(imovel.dataCadastro)}
          </span>
        </div>
        
        <p className="text-green-600 font-bold text-xl">
          {imovel.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </p>
        
        <div className="text-sm text-gray-600 space-y-1">
          <p className="flex items-center gap-1">
            <span className="font-medium">Local:</span> 
            {imovel.bairro}, {imovel.cidade.replace(/_/g, ' ')}
          </p>
          <p className="flex items-center gap-1">
            <span className="font-medium">Endereço:</span>
            {imovel.enderecoDetalhado}
          </p>
          <p className="flex items-center gap-1">
            <span className="font-medium">Área:</span>
            {imovel.metragem}m²
          </p>
        </div>
        
        <p className="text-gray-700 text-sm line-clamp-2 mt-2">
          {imovel.descricao}
        </p>

        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button
            onClick={() => onEdit(imovel.id!)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded transition-colors"
            aria-label="Editar imóvel"
            type="button"
          >
            <FaEdit className="text-xs" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => onDelete(imovel.id!)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded transition-colors"
            aria-label="Excluir imóvel"
            type="button"
          >
            <FaTrash className="text-xs" />
            <span>Excluir</span>
          </button>
          <button
            onClick={copiarLink}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded transition-colors"
            aria-label="Copiar link do imóvel"
            type="button"
          >
            {copiado ? <FaCheck className="text-xs" /> : <FaLink className="text-xs" />}
            <span>{copiado ? 'Copiado!' : 'Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}