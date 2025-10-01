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
  const codigoImovel = imovel.codigoImovel || imovel.codigoimovel;

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
    <div className="group bg-white rounded-3xl shadow-lg border-0 transition-all duration-500 overflow-hidden flex flex-col h-full relative">
      {/* Slider de Imagens com Overlay Melhorado */}
      <div className="relative h-48 sm:h-52 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {imagens.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            navigation
            pagination={{ clickable: true }}
            className="w-full h-full rounded-t-3xl"
            style={{ height: '100%' }}
          >
            {imagens.map((img, i) => (
              <SwiperSlide key={img}>
                <div className="relative w-full h-48 sm:h-52">
                  <Image
                    src={img}
                    alt={`${formatarTexto(tipoImovel)} em ${formatarTexto(imovel.cidade)} - Foto ${i + 1}`}
                    fill
                    className="object-cover transition-all duration-700"
                    unoptimized
                    priority={i === 0}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onError={(e) => {
                      console.error('Erro ao carregar imagem:', img);
                      const target = e.target as HTMLImageElement;
                      target.src = "/imoveis/sem-imagem.jpg";
                    }}
                  />
                  {/* Overlay sutil */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FiImage className="text-blue-400" size={32} />
              </div>
              <span className="text-blue-600 text-sm font-medium">Sem imagens</span>
            </div>
          </div>
        )}

        {/* Badges Modernos */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
            {getTipoIcon(tipoNegocio)} {tipoNegocio || 'N/A'}
          </span>
          <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-sm">
            {getSetorIcon(setorNegocio)} {setorNegocio || 'N/A'}
          </span>
        </div>
        
        {/* Badge de Data e Código */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
          <span className="bg-black/70 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-medium">
            {formatarData(dataCadastro)}
          </span>
          {codigoImovel && codigoImovel.trim() && (
            <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
              #{codigoImovel}
            </span>
          )}
        </div>

        {/* Badge de Valor em Destaque */}
        <div className="absolute bottom-3 left-3">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-2 shadow-xl">
            <div className="text-xs text-gray-600 font-medium">Valor</div>
            <div className="text-lg font-bold text-emerald-600">
              {imovel.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo do Card Reorganizado */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 space-y-3 sm:space-y-4">
        {/* Header - Tipo e Setor de Negócio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                {getTipoIcon(tipoNegocio)} {tipoNegocio || 'N/A'}
              </span>
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-2 py-1 rounded-lg text-xs font-semibold mt-1 sm:mt-0">
                {getSetorIcon(setorNegocio)} {setorNegocio || 'N/A'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <FiHome size={12} />
              <span>ID: {imovel.id?.slice(-6)}</span>
            </div>
          </div>
        </div>

        {/* Tipo de Imóvel */}
        <div>
          <h3 className="font-bold text-gray-800 text-lg sm:text-xl leading-tight group-hover:text-blue-700 transition-colors">
            {formatarTexto(tipoImovel)}
          </h3>
        </div>

        {/* Valor em Destaque */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-3">
          <div className="text-xs text-emerald-600 font-medium mb-1">💰 Valor</div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700">
            {imovel.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </div>
        </div>

        {/* Endereço Completo */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3">
          <div className="text-xs text-blue-600 font-medium mb-2">📍 Localização</div>
          <div className="space-y-1">
            <div className="font-semibold text-gray-800 text-sm">
              {formatarTexto(imovel.cidade)}, {formatarTexto(imovel.bairro)}
            </div>
            {enderecoDetalhado && (
              <div className="text-xs text-gray-600 leading-relaxed">
                {formatarTexto(enderecoDetalhado)}
              </div>
            )}
          </div>
        </div>

        {/* Patrocinador */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-bold">
                {patrocinadorNome.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-purple-600 font-medium">👤 Patrocinador</div>
              <div className="text-sm font-semibold text-gray-800 truncate">{patrocinadorNome}</div>
            </div>
          </div>
        </div>

        {/* Botões de Ação Melhorados */}
        <div className="space-y-2 mt-3 sm:mt-4">
          {/* Botão de Detalhes */}
          <button
            onClick={() => setExibirMais(!exibirMais)}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border border-gray-200 rounded-xl text-gray-700 hover:text-gray-800 text-sm font-medium transition-all duration-200 group/btn shadow-sm hover:shadow-md"
          >
            {exibirMais ? (
              <>
                <FiChevronUp size={16} className="group-hover/btn:translate-y-[-2px] transition-transform" />
                <span>Ocultar detalhes</span>
              </>
            ) : (
              <>
                <FiChevronDown size={16} className="group-hover/btn:translate-y-[2px] transition-transform" />
                <span>Ver detalhes completos</span>
              </>
            )}
          </button>

          {/* Botões de Ação Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Link
              href={`/imoveis/${imovel.id}`}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              title="Ver página do imóvel"
            >
              <FiEye size={16} />
              <span className="hidden sm:inline">Ver Página</span>
              <span className="sm:hidden">Ver</span>
            </Link>
            
            <button
              onClick={handleEditar}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              title="Editar no formulário"
            >
              <FiEdit2 size={16} />
              <span className="hidden sm:inline">Editar</span>
              <span className="sm:hidden">Editar</span>
            </button>
            
            <button
              onClick={handleConfirmarExclusao}
              className="flex items-center justify-center gap-2 py-2.5 px-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl"
              title="Excluir imóvel"
            >
              <FiTrash2 size={16} />
              <span className="hidden sm:inline">Excluir</span>
              <span className="sm:hidden">Excluir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Detalhes Expandidos - Modal Responsivo */}
      {exibirMais && (
        <div className="absolute inset-0 z-20 bg-gradient-to-br from-white via-blue-50/50 to-indigo-50/30 backdrop-blur-sm rounded-2xl border-2 border-blue-200 shadow-2xl p-3 sm:p-5 md:p-6 flex flex-col overflow-y-auto max-h-[90vh] animate-fadeIn">
          {/* Header do Modal */}
          <div className="flex items-center justify-between mb-3 sm:mb-4 md:mb-5 pb-3 border-b border-blue-100">
            <h4 className="font-bold text-gray-800 text-base sm:text-lg md:text-xl flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <FiHome className="text-white" size={16} />
              </div>
              <span className="hidden sm:inline">Detalhes Completos</span>
              <span className="sm:hidden">Detalhes</span>
            </h4>
            <button
              className="w-8 h-8 sm:w-9 sm:h-9 bg-gray-100 hover:bg-red-100 rounded-full flex items-center justify-center text-gray-600 hover:text-red-600 transition-all duration-200"
              onClick={() => setExibirMais(false)}
              title="Fechar detalhes"
            >
              <FiX size={16} className="sm:hidden" />
              <FiX size={18} className="hidden sm:block" />
            </button>
          </div>

          {/* Descrição Responsiva */}
          {imovel.descricao && (
            <div className="mb-3 sm:mb-4 md:mb-5">
              <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-blue-100">
                <h5 className="text-gray-700 font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center gap-2">
                  📝 Descrição do Imóvel
                </h5>
                <p className="text-gray-600 text-xs sm:text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {formatarTexto(imovel.descricao)}
                </p>
              </div>
            </div>
          )}

          {/* Características Responsivas */}
          <div className="mb-3 sm:mb-4 md:mb-5">
            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-blue-100">
              <h5 className="text-gray-700 font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                ✨ Características e Comodidades
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                {itensDisponiveis.map((item) => {
                  const valor = imovel.itens?.[item.chave];
                  if (typeof valor !== 'number' || valor === 0) return null;
                  const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
                  return (
                    <div key={item.chave} className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center border border-blue-100 hover:shadow-md transition-all duration-200">
                      <div className="text-lg sm:text-xl md:text-2xl mb-1 sm:mb-2">{item.icone}</div>
                      <div className="text-blue-900 text-xs sm:text-sm font-medium mb-0.5 sm:mb-1 leading-tight">{item.nome}</div>
                      <div className="text-blue-700 font-bold text-xs sm:text-sm">
                        {isQuant ? valor : "✓"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Galeria de Imagens Responsiva */}
          {imagens.length > 0 && (
            <div className="mb-3 sm:mb-4 md:mb-5">
              <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-blue-100">
                <h5 className="text-gray-700 font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
                  🖼️ Galeria de Imagens ({imagens.length})
                </h5>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
                  {imagens.map((img, i) => (
                    <div key={img} className="aspect-square rounded-lg sm:rounded-xl overflow-hidden border border-blue-100 sm:border-2 bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105">
                      <Image
                        src={img}
                        alt={`Imagem ${i + 1}`}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Informações Técnicas Responsivas */}
          <div className="bg-white rounded-xl p-3 sm:p-4 md:p-5 shadow-sm border border-blue-100">
            <h5 className="text-gray-700 font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
              ⚙️ Informações Técnicas
            </h5>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-0">Status:</span>
                  <span className="bg-green-100 text-green-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
                    Ativo
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-0">Tipo de Negócio:</span>
                  <span className="text-gray-800 text-xs sm:text-sm font-semibold">
                    {tipoNegocio || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-0">Setor:</span>
                  <span className="text-gray-800 text-xs sm:text-sm font-semibold">
                    {setorNegocio || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-0">Metragem:</span>
                  <span className="text-gray-800 text-xs sm:text-sm font-semibold">
                    {imovel.metragem}m²
                  </span>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-0">Cadastrado em:</span>
                  <span className="text-gray-800 text-xs sm:text-sm font-semibold">
                    {formatarData(dataCadastro)}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-0">Código:</span>
                  <span className="bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
                    {codigoImovel || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-0">ID do Sistema:</span>
                  <span className="text-gray-600 text-xs font-mono">
                    {imovel.id?.slice(-8) || 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 sm:py-2.5 border-b border-gray-100">
                  <span className="text-gray-600 text-xs sm:text-sm font-medium mb-1 sm:mb-0">Total de Imagens:</span>
                  <span className="bg-blue-100 text-blue-700 px-2 sm:px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto">
                    {imagens.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}