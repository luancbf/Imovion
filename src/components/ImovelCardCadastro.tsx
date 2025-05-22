'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperCore } from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import type { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import EditarImovelModal from './EditarImovelModal';
import type { Imovel } from '@/types/Imovel';

interface ImovelCardProps {
  imovel: Imovel;
  onDelete: (id: string) => void;
  onEdit: (id: string, dados: Partial<Imovel>) => void | Promise<void>
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  patrocinadores: { id: string; nome: string }[];
}

export default function ImovelCard({
  imovel,
  onDelete,
  onEdit,
  cidadesComBairros,
  opcoesTipoImovel,
  patrocinadores,
}: ImovelCardProps) {
  const [swiperInstance, setSwiperInstance] = useState<SwiperCore | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Partial<Imovel>>({ ...imovel });

  const formatarData = (data?: Date | Timestamp | string): string => {
    if (!data) return 'Data não informada';
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
  };

  const formatarTexto = (texto: string) => texto.replace(/_/g, " ");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = () => {
    onEdit(imovel.id!, form);
    setEditando(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col">
      {/* Carrossel de Imagens */}
      <div className="relative h-52 md:h-64 bg-gray-100">
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
                  <Image
                    src={imagem}
                    alt={`Imóvel ${formatarTexto(imovel.tipoImovel)} em ${formatarTexto(imovel.cidade)} - Foto ${index + 1}`}
                    width={600}
                    height={256}
                    className="w-full h-full object-cover"
                    unoptimized
                    priority={index === 0}
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
              <FaArrowLeft className="text-gray-800 text-base" />
            </button>
            <button
              className={`swiper-button-next swiper-button-next-${imovel.id} absolute right-2 top-1/2 z-10 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors`}
              onClick={() => swiperInstance?.slideNext()}
              aria-label="Próxima imagem"
              type="button"
            >
              <FaArrowRight className="text-gray-800 text-base" />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-gray-400 text-base">Sem imagens disponíveis</span>
          </div>
        )}
      </div>

      {/* Detalhes do Imóvel */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="text-lg md:text-xl font-bold text-blue-900">
            {formatarTexto(imovel.tipoImovel)} - {formatarTexto(imovel.tipoNegocio)}
          </h3>
          <span className="text-xs text-gray-500">
            {formatarData(imovel.dataCadastro)}
          </span>
        </div>
        <p className="text-green-700 font-bold text-xl md:text-2xl">
          {imovel.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            <span className="font-medium">Local:</span> {formatarTexto(imovel.bairro)}, {formatarTexto(imovel.cidade)}
          </p>
          <p>
            <span className="font-medium">Endereço:</span> {formatarTexto(imovel.enderecoDetalhado)}
          </p>
          <p>
            <span className="font-medium">Área:</span> {imovel.metragem}m²
          </p>
        </div>
        <p className="text-gray-700 text-sm line-clamp-2 mt-2">
          {formatarTexto(imovel.descricao)}
        </p>
        {/* Botões de Ação */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Link
            href={`/imoveis/${imovel.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded transition-colors"
            aria-label="Ver página do imóvel"
          >
            Ver página
          </Link>
          <button
            onClick={() => setEditando(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded transition-colors"
            aria-label="Editar imóvel"
            type="button"
          >
            <FaEdit className="text-xs" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => setConfirmandoExclusao(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded transition-colors"
            aria-label="Excluir imóvel"
            type="button"
          >
            <FaTrash className="text-xs" />
            <span>Excluir</span>
          </button>
        </div>
        {/* Confirmação de exclusão */}
        {confirmandoExclusao && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded p-3 flex flex-col items-center gap-2">
            <span className="text-red-700 font-semibold">Tem certeza que deseja excluir este imóvel?</span>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onDelete(imovel.id!);
                  setConfirmandoExclusao(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded font-semibold transition-colors"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmandoExclusao(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded font-semibold transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de edição como componente */}
      <EditarImovelModal
        open={editando}
        form={form}
        onChange={handleChange}
        onClose={() => setEditando(false)}
        onSave={handleSaveEdit}
        cidadesComBairros={cidadesComBairros}
        opcoesTipoImovel={opcoesTipoImovel}
        patrocinadores={patrocinadores}
      />
    </div>
  );
}