'use client';

import { useState } from 'react';
import { FaEdit, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import type { Timestamp } from 'firebase/firestore';
import Image from 'next/image';
import Link from 'next/link';
import EditarImovelModal from '@/components/cadastrar-imovel/EditarImovelModal';
import type { Imovel } from '@/types/Imovel';

interface ImovelComItens extends Imovel {
  itens?: Record<string, number>;
}

interface ImovelCardProps {
  imovel: ImovelComItens;
  onDelete: (id: string) => void;
  onEdit: (id: string, dados: Partial<Imovel>) => void | Promise<void>
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  patrocinadores: { id: string; nome: string }[];
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

export default function ImovelCard({
  imovel,
  onDelete,
  onEdit,
  cidadesComBairros,
  opcoesTipoImovel,
  patrocinadores,
}: ImovelCardProps) {
  const [imgIndex, setImgIndex] = useState(0);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<Partial<Imovel>>({ ...imovel });
  const [exibirMais, setExibirMais] = useState(false);

  const imagens = imovel.imagens || [];

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

  const itensDisponiveis = ITENS_POR_SETOR[imovel.tipoNegocio] || [];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = () => {
    onEdit(imovel.id!, form);
    setEditando(false);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === 0 ? imagens.length - 1 : prev - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImgIndex((prev) => (prev === imagens.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow duration-300 border border-gray-100 flex flex-col">
      {/* Slider de Imagens */}
      <div className="relative h-45 md:h-64 bg-gray-100 flex items-center justify-center">
        {imagens.length > 0 ? (
          <>
            <Image
              src={imagens[imgIndex]}
              alt={`Imóvel ${formatarTexto(imovel.tipoImovel)} em ${formatarTexto(imovel.cidade)} - Foto ${imgIndex + 1}`}
              fill
              className="object-cover rounded"
              unoptimized
              priority
              style={{ objectFit: 'cover' }}
            />
            {imagens.length > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-white/80 hover:bg-white text-black rounded-full shadow transition cursor-pointer"
                  onClick={handlePrev}
                  aria-label="Imagem anterior"
                  type="button"
                  tabIndex={0}
                  style={{ width: 32, height: 32 }}
                >
                  <FiChevronLeft size={22} />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center bg-white/80 hover:bg-white text-black rounded-full shadow transition cursor-pointer"
                  onClick={handleNext}
                  aria-label="Próxima imagem"
                  type="button"
                  tabIndex={0}
                  style={{ width: 32, height: 32 }}
                >
                  <FiChevronRight size={22} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                  {imagens.map((_, i) => (
                    <span
                      key={i}
                      className={`block w-2 h-2 rounded-full ${i === imgIndex ? 'bg-blue-600' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <span className="text-gray-400 text-base">Sem imagens disponíveis</span>
        )}
      </div>

      {/* Detalhes do Imóvel */}
      <div className="p-4 flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-start">
          <h3 className="font-poppins text-lg md:text-xl font-bold text-blue-900">
            {formatarTexto(imovel.tipoNegocio)} - {formatarTexto(imovel.tipoImovel)}
          </h3>
          <span className="text-xs text-gray-500">
            {formatarData(imovel.dataCadastro)}
          </span>
        </div>
        <p className="font-poppins text-green-700 font-bold text-xl md:text-2xl">
          {imovel.valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
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
                  if (valor === undefined || valor === 0) return null;
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
            aria-label="Ver página do imóvel"
          >
            Ver página
          </Link>
          <button
            onClick={() => setEditando(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm px-3 py-2 rounded transition-colors cursor-pointer"
            aria-label="Editar imóvel"
            type="button"
          >
            <FaEdit className="text-xs" />
            <span>Editar</span>
          </button>
          <button
            onClick={() => setConfirmandoExclusao(true)}
            className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-3 py-2 rounded transition-colors cursor-pointer"
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
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-1 rounded font-semibold transition-colors cursor-pointer"
              >
                Confirmar
              </button>
              <button
                onClick={() => setConfirmandoExclusao(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-1 rounded font-semibold transition-colors cursor-pointer"
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