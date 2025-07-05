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

// ✅ CORREÇÃO: Interface ajustada para corresponder aos itens reais
interface ItemImovel {
  chave: string;
  nome: string;    // ✅ Mudado de 'label' para 'nome'
  icone: string;
}

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
  const [exibirMais, setExibirMais] = useState(false);
  const imagens = imovel.imagens?.length ? imovel.imagens : ["/imoveis/sem-imagem.jpg"];
  
  // ✅ CORREÇÃO: Tipagem segura para setornegocio
  const itensDisponiveis = useMemo((): ItemImovel[] => {
    const setor = imovel.setornegocio;
    if (!setor || typeof setor !== 'string') return [];
    
    return ITENS_POR_SETOR[setor as keyof typeof ITENS_POR_SETOR] || [];
  }, [imovel.setornegocio]);

  // ✅ Parse seguro dos itens do imóvel
  const itensImovel = useMemo((): Record<string, number> => {
    if (!imovel.itens) return {};
    
    try {
      const parsed = typeof imovel.itens === 'string' 
        ? JSON.parse(imovel.itens) 
        : imovel.itens;
      
      // ✅ Garantir que todos os valores sejam números
      const resultado: Record<string, number> = {};
      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([key, value]) => {
          resultado[key] = Number(value) || 0;
        });
      }
      return resultado;
    } catch (error) {
      console.error('Erro ao parsear itens do imóvel:', error);
      return {};
    }
  }, [imovel.itens]);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col">
      <div className="relative h-45 md:h-64 bg-gray-100 flex items-center justify-center">
        <Swiper
          modules={[Navigation, Pagination]}
          navigation
          pagination={{ clickable: true }}
          className="w-full h-full rounded"
          style={{ height: '100%' }}
        >
          {imagens.map((img, i) => (
            <SwiperSlide key={`${img}-${i}`}>
              <div className="relative w-full h-45 md:h-64">
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
      </div>
      
      <div className="p-4 flex-1 flex flex-col gap-2">
        {/* ✅ CORREÇÃO: Usar campos corretos do banco */}
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
          {/* ✅ CORREÇÃO: Campo correto enderecodetalhado */}
          <p>
            <span className="font-poppins font-bold">Endereço:</span> {formatarTexto(imovel.enderecodetalhado)}
          </p>
          <p>
            <span className="font-poppins font-bold">Área:</span> {imovel.metragem || 0}m²
          </p>
        </div>
        
        <button
          className="flex items-center gap-1 font-inter text-blue-700 hover:underline text-xs mt-1 cursor-pointer"
          onClick={() => setExibirMais(v => !v)}
          type="button"
        >
          {exibirMais ? (
            <>Ocultar detalhes <FaChevronUp className="text-xs" /></>
          ) : (
            <>Exibir mais <FaChevronDown className="text-xs" /></>
          )}
        </button>
        
        {exibirMais && (
          <div className="mt-2">
            <p className="text-gray-700 text-sm mb-2 whitespace-pre-line">
              {formatarTexto(imovel.descricao)}
            </p>
            
            {/* ✅ Seção de itens melhorada com tipagem correta */}
            {itensDisponiveis.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-1">
                  🏠 Características do imóvel
                </h4>
                
                {/* ✅ Verificar se há itens preenchidos */}
                {Object.values(itensImovel).some(valor => valor > 0) ? (
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 gap-2">
                    {itensDisponiveis.map((item: ItemImovel) => {
                      const valor = itensImovel[item.chave];
                      const valorNumerico = valor || 0;
                      
                      if (valorNumerico === 0) return null;
                      
                      const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
                      
                      return (
                        <div 
                          key={item.chave} 
                          className="flex flex-col items-center bg-blue-50 rounded-lg px-2 py-2 min-w-0 border border-blue-100"
                        >
                          <span 
                            className="text-blue-900 text-xs text-center truncate w-full font-medium" 
                            title={item.nome} // ✅ CORREÇÃO: Usar 'nome' em vez de 'label'
                          >
                            {item.icone} {item.nome} {/* ✅ CORREÇÃO: Incluir ícone e usar 'nome' */}
                          </span>
                          <span className="text-sm font-bold text-blue-700 mt-1">
                            {isQuant ? valorNumerico : "✓"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-500 text-sm">
                      📋 Nenhuma característica específica informada
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* ✅ Botões de ação melhorados */}
        <div className="font-poppins flex flex-wrap gap-2 mt-4">
          <Link
            href={`/imoveis/${imovel.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-800 text-white text-sm px-3 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label={`Ver detalhes do imóvel ${imovel.tipoimovel} em ${imovel.cidade}`}
          >
            👁️ Ver detalhes
          </Link>
          
          {/* ✅ Link do WhatsApp melhorado */}
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
              💬 WhatsApp
            </a>
          )}
        </div>
        
        {/* ✅ Badge de informações extras */}
        <div className="flex justify-between items-center text-xs text-gray-500 mt-2 pt-2 border-t border-gray-100">
          <span className="bg-gray-100 px-2 py-1 rounded">
            📅 {imovel.datacadastro ? new Date(imovel.datacadastro).toLocaleDateString('pt-BR') : 'Data não informada'}
          </span>
          {contexto !== "patrocinador" && (
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
              {formatarTexto(imovel.setornegocio)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}