'use client';

import { useState } from 'react';
import { FiEdit2, FiTrash2, FiEye, FiChevronDown, FiChevronUp, FiImage, FiMapPin, FiHome, FiCalendar } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';
import EditarImovelModal from '@/components/cadastrar-imovel/EditarImovelModal';
import type { Imovel } from '@/types/Imovel';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ImovelComItens extends Imovel {
  itens?: Record<string, number>;
}

interface ImovelCardProps {
  imovel: ImovelComItens;
  onDelete: (id: string) => void;
  onEdit: (id: string, dados: Partial<Imovel>) => void | Promise<void>;
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  patrocinadores: { id: string; nome: string }[];
  viewMode?: 'grid' | 'list';
}

const ITENS_POR_SETOR: Record<string, { chave: string; label: string }[]> = {
  Residencial: [
    { chave: "quartos", label: "Quartos" },
    { chave: "suites", label: "Suítes" },
    { chave: "banheiros", label: "Banheiros" },
    { chave: "garagens", label: "Vagas de Garagem" },
    { chave: "salas", label: "Salas de Estar" },
    { chave: "cozinhas", label: "Cozinhas" },
    { chave: "closets", label: "Closets" },
    { chave: "lavanderias", label: "Lavanderias" },
    { chave: "varandas", label: "Varandas" },
    { chave: "escritorios", label: "Escritórios" },
    { chave: "despensas", label: "Despensas" },
    { chave: "piscinas", label: "Piscina" },
    { chave: "churrasqueiras", label: "Churrasqueira" },
    { chave: "jardins", label: "Jardim" },
    { chave: "playgrounds", label: "Playground" },
    { chave: "academias", label: "Academia" },
    { chave: "arCondicionado", label: "Ar Condicionado" },
    { chave: "moveisPlanejados", label: "Móveis Planejados" },
    { chave: "areaGourmet", label: "Área Gourmet" },
    { chave: "salaJantar", label: "Sala de Jantar" },
    { chave: "salaTV", label: "Sala de TV" },
    { chave: "sacada", label: "Sacada" },
    { chave: "deposito", label: "Depósito" },
    { chave: "quartoEmpregada", label: "Quarto de Empregada" },
    { chave: "banheiroEmpregada", label: "Banheiro de Empregada" },
  ],
  Comercial: [
    { chave: "salas", label: "Salas" },
    { chave: "banheiros", label: "Banheiros" },
    { chave: "garagens", label: "Vagas de Garagem" },
    { chave: "recepcao", label: "Recepção" },
    { chave: "deposito", label: "Depósito" },
    { chave: "elevadores", label: "Elevadores" },
    { chave: "copa", label: "Copa" },
    { chave: "arCondicionado", label: "Ar Condicionado" },
    { chave: "portarias", label: "Portaria 24h" },
    { chave: "auditorio", label: "Auditório" },
    { chave: "vitrine", label: "Vitrine" },
    { chave: "mezanino", label: "Mezanino" },
    { chave: "docas", label: "Docas" },
    { chave: "almoxarifado", label: "Almoxarifado" },
    { chave: "estacionamentoVisitantes", label: "Estacionamento Visitantes" },
  ],
  Rural: [
    { chave: "hectares", label: "Hectares" },
    { chave: "casasFuncionarios", label: "Casas de Funcionários" },
    { chave: "galpoes", label: "Galpões" },
    { chave: "casaSede", label: "Casa Sede" },
    { chave: "curral", label: "Curral" },
    { chave: "energia", label: "Energia" },
    { chave: "agua", label: "Água" },
    { chave: "represa", label: "Represa" },
    { chave: "pocoArtesiano", label: "Poço Artesiano" },
    { chave: "mangueiro", label: "Mangueiro" },
    { chave: "pastagem", label: "Pastagem" },
    { chave: "arvoresFrutiferas", label: "Árvores Frutíferas" },
    { chave: "cercas", label: "Cercas" },
    { chave: "trator", label: "Trator" },
    { chave: "silo", label: "Silo" },
    { chave: "canavial", label: "Canavial" },
    { chave: "estabulo", label: "Estábulo" },
    { chave: "chiqueiro", label: "Chiqueiro" },
    { chave: "horta", label: "Horta" },
    { chave: "tanquePeixes", label: "Tanque de Peixes" },
  ],
};

const ITENS_QUANTITATIVOS = [
  "quartos", "suites", "banheiros", "garagens", "cozinhas", "closets", "hectares", "casasFuncionarios", "galpoes", "salas"
];

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

export default function ImovelCard({
  imovel,
  onDelete,
  onEdit,
  cidadesComBairros,
  opcoesTipoImovel,
  patrocinadores,
  viewMode = 'grid'
}: ImovelCardProps) {
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Partial<Imovel>>({ ...imovel });
  const [exibirMais, setExibirMais] = useState(false);

  const imagens = imovel.imagens || [];
  const itensDisponiveis = ITENS_POR_SETOR[imovel.tipoNegocio || ''] || [];
  const patrocinadorNome = patrocinadores.find(p => p.id === imovel.patrocinador)?.nome || 'N/A';

  const handleConfirmarExclusao = () => {
    onDelete(imovel.id!);
    setConfirmandoExclusao(false);
  };

  // Layout para visualização em lista
  if (viewMode === 'list') {
    return (
      <div className="group bg-gradient-to-br from-blue-50 to-white p-6 rounded-2xl border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300">
        <div className="flex gap-6">
          {/* Imagem Principal */}
          <div className="relative flex-shrink-0">
            {imagens.length > 0 ? (
              <div className="relative w-32 h-24 rounded-xl overflow-hidden border-2 border-blue-100 group-hover:border-blue-200 transition-colors">
                <Image
                  src={imagens[0]}
                  alt={`${formatarTexto(imovel.tipoImovel)} em ${formatarTexto(imovel.cidade)}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {imagens.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    +{imagens.length - 1}
                  </div>
                )}
              </div>
            ) : (
              <div className="w-32 h-24 bg-blue-100 rounded-xl flex items-center justify-center border-2 border-blue-200">
                <FiImage className="text-blue-400" size={24} />
              </div>
            )}
          </div>

          {/* Informações Principais */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-bold text-blue-900 text-lg mb-1 group-hover:text-blue-700 transition-colors">
                  {getTipoIcon(imovel.tipoNegocio)} {formatarTexto(imovel.tipoImovel)}
                </h3>
                <div className="flex items-center gap-2 text-sm text-blue-600 mb-2">
                  <span className="bg-blue-100 px-2 py-1 rounded-full">
                    {getSetorIcon(imovel.setorNegocio)} {imovel.setorNegocio || 'N/A'}
                  </span>
                  <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    {imovel.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
              <div className="text-right text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FiCalendar size={14} />
                  {formatarData(imovel.dataCadastro)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 mb-3">
              <div className="flex items-center gap-1">
                <FiMapPin size={14} />
                <span>{formatarTexto(imovel.bairro)}, {formatarTexto(imovel.cidade)}</span>
              </div>
              <div className="flex items-center gap-1">
                <FiHome size={14} />
                <span>{imovel.metragem}m²</span>
              </div>
              <div className="flex items-center gap-1">
                <span>🏢</span>
                <span>{patrocinadorNome}</span>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex gap-2">
              <Link
                href={`/imoveis/${imovel.id}`}
                className="flex items-center gap-1 p-2 text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 text-sm"
                title="Ver página do imóvel"
              >
                <FiEye size={16} />
                <span className="hidden sm:inline">Ver</span>
              </Link>
              
              <button
                onClick={() => setEditando(true)}
                className="flex items-center gap-1 p-2 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-all duration-200 text-sm"
                title="Editar imóvel"
              >
                <FiEdit2 size={16} />
                <span className="hidden sm:inline">Editar</span>
              </button>
              
              <button
                onClick={() => setConfirmandoExclusao(true)}
                className="flex items-center gap-1 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200 text-sm"
                title="Excluir imóvel"
              >
                <FiTrash2 size={16} />
                <span className="hidden sm:inline">Excluir</span>
              </button>
            </div>
          </div>
        </div>

        {/* Confirmação de Exclusão */}
        {confirmandoExclusao && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-red-700 font-medium">Confirmar exclusão deste imóvel?</span>
              <div className="flex gap-2">
                <button
                  onClick={handleConfirmarExclusao}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setConfirmandoExclusao(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de edição */}
        <EditarImovelModal
          open={editando}
          form={form}
          onClose={() => setEditando(false)}
          onSave={(dadosEditados) => {
            setForm(dadosEditados);
            onEdit(imovel.id!, dadosEditados);
            setEditando(false);
          }}
          cidadesComBairros={cidadesComBairros}
          opcoesTipoImovel={opcoesTipoImovel}
          patrocinadores={patrocinadores}
        />
      </div>
    );
  }

  // Layout para visualização em grid
  return (
    <div className="group bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 overflow-hidden">
      {/* Slider de Imagens */}
      <div className="relative h-48 bg-gray-100">
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
                <div className="relative w-full h-48">
                  <Image
                    src={img}
                    alt={`${formatarTexto(imovel.tipoImovel)} em ${formatarTexto(imovel.cidade)} - Foto ${i + 1}`}
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
        <div className="absolute top-3 left-3 flex gap-2">
          <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {getTipoIcon(imovel.tipoNegocio)} {imovel.tipoNegocio || 'N/A'}
          </span>
          <span className="bg-green-600 text-white px-2 py-1 rounded-full text-xs font-medium">
            {getSetorIcon(imovel.setorNegocio)} {imovel.setorNegocio || 'N/A'}
          </span>
        </div>

        <div className="absolute top-3 right-3">
          <span className="bg-black/70 text-white px-2 py-1 rounded-full text-xs">
            {formatarData(imovel.dataCadastro)}
          </span>
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-6 space-y-4">
        {/* Cabeçalho */}
        <div>
          <h3 className="font-bold text-blue-900 text-lg mb-2 group-hover:text-blue-700 transition-colors">
            {formatarTexto(imovel.tipoImovel)}
          </h3>
          <p className="text-green-700 font-bold text-xl">
            {imovel.valor?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>

        {/* Informações Básicas */}
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <FiMapPin size={14} />
            <span>{formatarTexto(imovel.bairro)}, {formatarTexto(imovel.cidade)}</span>
          </div>
          <div className="flex items-center gap-2">
            <FiHome size={14} />
            <span>{imovel.metragem}m² • {formatarTexto(imovel.enderecoDetalhado)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>🏢</span>
            <span>{patrocinadorNome}</span>
          </div>
        </div>

        {/* Toggle Detalhes */}
        <button
          onClick={() => setExibirMais(!exibirMais)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
        >
          {exibirMais ? (
            <>
              <FiChevronUp size={16} />
              Ocultar detalhes
            </>
          ) : (
            <>
              <FiChevronDown size={16} />
              Ver detalhes
            </>
          )}
        </button>

        {/* Detalhes Expandidos */}
        {exibirMais && (
          <div className="space-y-4 pt-4 border-t border-blue-100">
            {imovel.descricao && (
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">Descrição</h4>
                <p className="text-gray-700 text-sm whitespace-pre-line">
                  {formatarTexto(imovel.descricao)}
                </p>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Características</h4>
              <div className="grid grid-cols-2 gap-2">
                {itensDisponiveis.map((item) => {
                  const valor = (form.itens ?? imovel.itens)?.[item.chave];
                  if (typeof valor !== 'number' || valor === 0) return null;
                  const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
                  return (
                    <div key={item.chave} className="bg-blue-50 rounded-lg p-2 text-center">
                      <div className="text-blue-900 text-xs font-medium truncate">
                        {item.label}
                      </div>
                      <div className="text-blue-700 font-semibold">
                        {isQuant ? valor : "✓"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex gap-2 pt-4 border-t border-blue-100">
          <Link
            href={`/imoveis/${imovel.id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white text-sm px-3 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
            title="Ver página do imóvel"
          >
            <FiEye size={16} />
            <span>Ver</span>
          </Link>
          
          <button
            onClick={() => setEditando(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white text-sm px-3 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
            title="Editar imóvel"
          >
            <FiEdit2 size={16} />
            <span>Editar</span>
          </button>
          
          <button
            onClick={() => setConfirmandoExclusao(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded-xl transition-all duration-200 transform hover:scale-105"
            title="Excluir imóvel"
          >
            <FiTrash2 size={16} />
            <span>Excluir</span>
          </button>
        </div>

        {/* Confirmação de Exclusão */}
        {confirmandoExclusao && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="text-center">
              <p className="text-red-700 font-medium mb-3">
                Tem certeza que deseja excluir este imóvel?
              </p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={handleConfirmarExclusao}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => setConfirmandoExclusao(false)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de edição */}
      <EditarImovelModal
        open={editando}
        form={form}
        onClose={() => setEditando(false)}
        onSave={(dadosEditados) => {
          setForm(dadosEditados);
          onEdit(imovel.id!, dadosEditados);
          setEditando(false);
        }}
        cidadesComBairros={cidadesComBairros}
        opcoesTipoImovel={opcoesTipoImovel}
        patrocinadores={patrocinadores}
      />
    </div>
  );
}