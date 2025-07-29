'use client';

import { useState } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiChevronDown, FiChevronUp, FiImage, FiX, FiHome } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import type { Imovel } from '@/types/Imovel';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from '@/constants/itensImovel';

interface ImovelComItens extends Imovel {
  itens?: Record<string, number>;
  tipoImovel?: string;
  enderecoDetalhado?: string;
  tipoNegocio?: string;
  setorNegocio?: string;
  dataCadastro?: Date | string;
  creci?: string;
  codigoImovel?: string;
}

interface ImovelCardProps {
  imovel: ImovelComItens;
  onDelete: (id: string) => void;
  onEdit: (imovel: ImovelComItens) => void;
  cidadesComBairros: Record<string, string[]>;
  patrocinadores: { id: string; nome: string }[];
}

function formatarData(data?: Date | string): string {
  if (!data) return 'Data não informada';
  const dateObj = typeof data === 'string' ? new Date(data) : data;
  if (dateObj instanceof Date && !isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString('pt-BR');
  }
  return 'Data inválida';
}

function formatarTexto(texto: string | undefined) {
  return typeof texto === 'string' ? texto.replace(/_/g, " ") : '';
}

function getTipoIcon(tipoNegocio: string | undefined): string {
  switch(tipoNegocio) {
    case 'Residencial': return '🏠';
    case 'Comercial': return '🏪';
    case 'Rural': return '🌾';
    default: return '🏢';
  }
}

function getSetorIcon(setorNegocio: string | undefined): string {
  switch(setorNegocio) {
    case 'Venda': return '💰';
    case 'Aluguel': return '🏠';
    default: return '💼';
  }
}

export default function ImovelCardCadastro({
  imovel,
  onDelete,
  onEdit,
  patrocinadores,
}: ImovelCardProps) {
  const [exibirMais, setExibirMais] = useState(false);

  const tipoImovel = imovel.tipoImovel || imovel.tipoimovel;
  const enderecoDetalhado = imovel.enderecoDetalhado || imovel.enderecodetalhado;
  const tipoNegocio = imovel.tipoNegocio || imovel.tiponegocio;
  const setorNegocio = imovel.setorNegocio || imovel.setornegocio;
  const dataCadastro = imovel.dataCadastro || imovel.datacadastro;

  const imagens = imovel.imagens || [];
  const itensDisponiveis = ITENS_POR_SETOR[tipoNegocio || ''] || [];
  const patrocinadorNome = patrocinadores.find(p =>
    p.id === imovel.patrocinador || p.id === imovel.patrocinadorid
  )?.nome || 'N/A';

  const handleConfirmarExclusao = () => {
    onDelete(imovel.id!);
  };

  const handleEditar = () => {
    const dadosParaFormulario: ImovelComItens = {
      ...imovel,
      tipoImovel: imovel.tipoImovel || imovel.tipoimovel || "",
      enderecoDetalhado: imovel.enderecoDetalhado || imovel.enderecodetalhado,
      tipoNegocio: imovel.tipoNegocio || imovel.tiponegocio || "",
      setorNegocio: imovel.setorNegocio || imovel.setornegocio || "",
      patrocinador: imovel.patrocinador || imovel.patrocinadorid || "",
      creci: imovel.creci || "",
      whatsapp: imovel.whatsapp || "",
      valor: typeof imovel.valor === "number"
        ? imovel.valor
        : Number(imovel.valor) || 0,
      metragem: imovel.metragem,
      descricao: imovel.descricao,
      imagens: imovel.imagens || [],
      itens: imovel.itens || {},
      dataCadastro: imovel.dataCadastro || imovel.datacadastro,
      bairro: imovel.bairro,
      cidade: imovel.cidade,
    };
    onEdit(dadosParaFormulario);
    const formulario = document.querySelector('[data-formulario-imovel]');
    if (formulario) {
      formulario.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-visible flex flex-col h-full relative">
      {/* Slider de Imagens */}
      <div className="relative h-40 sm:h-48 bg-gray-100">
        {imagens.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-full"
            style={{ height: '100%' }}
          >
            {imagens.map((img, i) => (
              <SwiperSlide key={img}>
                <div className="relative w-full h-40 sm:h-48">
                  <Image
                    src={img}
                    alt={`${formatarTexto(tipoImovel)} em ${formatarTexto(imovel.cidade)} - Foto ${i + 1}`}
                    fill
                    className="object-cover transition-all duration-500"
                    unoptimized
                    priority={i === 0}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <FiImage className="mx-auto text-gray-400 mb-2" size={32} />
              <span className="text-gray-400 text-sm">Sem imagens</span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2 left-2 flex gap-1">
          <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
            {getTipoIcon(tipoNegocio)} {tipoNegocio || 'N/A'}
          </span>
          <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
            {getSetorIcon(setorNegocio)} {setorNegocio || 'N/A'}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-white px-2 py-0.5 rounded-full text-xs">
            {formatarData(dataCadastro)}
          </span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="flex-1 flex flex-col justify-between p-4 space-y-2">
        {/* Informações principais */}
        <div className="space-y-1">
          <div className="font-bold text-blue-900 text-base group-hover:text-blue-700 transition-colors truncate">
            {formatarTexto(tipoImovel)}
          </div>
          <div className="flex flex-wrap gap-1">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Valor</span>
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold text-xs">
                {imovel.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Cidade/Bairro</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs">
                {formatarTexto(imovel.cidade)}, {formatarTexto(imovel.bairro)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Metragem</span>
              <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                {imovel.metragem}m²
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Patrocinador</span>
              <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-xs">
                {patrocinadorNome}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Código do Imóvel</span>
              <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold select-none">
                {imovel.codigoImovel || "N/A"}
              </span>
            </div>
          </div>
          <div className="flex flex-col mt-1">
            <span className="text-xs text-gray-500">Endereço</span>
            <span className="text-gray-600 text-xs truncate">
              {formatarTexto(enderecoDetalhado)}
            </span>
          </div>
        </div>

        {/* Botão de detalhes */}
        <div className="flex justify-center mt-1">
          <button
            onClick={() => setExibirMais(!exibirMais)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-xs font-medium transition-colors cursor-pointer"
          >
            {exibirMais ? (
              <>
                <FiChevronUp size={14} />
                Ocultar detalhes
              </>
            ) : (
              <>
                <FiChevronDown size={14} />
                Ver detalhes
              </>
            )}
          </button>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-col gap-1 mt-2 sm:flex-row sm:justify-center">
          <Link
            href={`/imoveis/${imovel.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white text-xs px-2 py-1 rounded-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
            title="Ver página do imóvel"
          >
            <FiEye size={14} />
            <span>Ver</span>
          </Link>
          <button
            onClick={handleEditar}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1 rounded-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
            title="Editar no formulário"
          >
            <FiEdit2 size={14} />
            <span>Editar</span>
          </button>
          <button
            onClick={handleConfirmarExclusao}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1 rounded-xl transition-all duration-200 transform hover:scale-105 cursor-pointer"
            title="Excluir imóvel"
          >
            <FiTrash2 size={14} />
            <span>Excluir</span>
          </button>
        </div>
      </div>

      {/* Detalhes Expandidos - Sobreposto */}
      {exibirMais && (
        <div className="absolute inset-0 z-10 bg-white/95 rounded-2xl border-2 border-blue-300 shadow-2xl p-4 flex flex-col overflow-y-auto max-h-[90vh] animate-fadeIn">
          <button
            className="absolute top-2 right-2 text-gray-500 hover:text-blue-700 cursor-pointer"
            onClick={() => setExibirMais(false)}
            title="Fechar detalhes"
          >
            <FiX size={20} />
          </button>
          <h4 className="font-bold text-blue-900 text-base mb-2 flex items-center gap-2">
            <FiHome className="text-blue-600" /> Detalhes do Imóvel
          </h4>
          {imovel.descricao && (
            <div className="mb-2">
              <span className="block text-xs text-gray-500 mb-1">Descrição</span>
              <p className="text-gray-700 text-xs whitespace-pre-line">
                {formatarTexto(imovel.descricao)}
              </p>
            </div>
          )}
          <div>
            <span className="block text-xs text-gray-500 mb-1">Características</span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1">
              {itensDisponiveis.map((item) => {
                const valor = imovel.itens?.[item.chave];
                if (typeof valor !== 'number' || valor === 0) return null;
                const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
                return (
                  <div key={item.chave} className="bg-blue-50 rounded-lg p-1 text-center flex flex-col items-center">
                    <span className="text-base">{item.icone}</span>
                    <span className="text-blue-900 text-xs font-medium truncate">{item.nome}</span>
                    <span className="text-blue-700 font-semibold">
                      {isQuant ? valor : "✓"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Exibe todas as imagens em miniatura */}
          {imagens.length > 0 && (
            <div className="mt-3">
              <span className="block text-xs text-gray-500 mb-1">Imagens</span>
              <div className="flex flex-wrap gap-2">
                {imagens.map((img, i) => (
                  <div key={img} className="w-16 h-16 rounded overflow-hidden border border-blue-200 bg-gray-100 flex items-center justify-center">
                    <Image
                      src={img}
                      alt={`Miniatura ${i + 1}`}
                      width={64}
                      height={64}
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}