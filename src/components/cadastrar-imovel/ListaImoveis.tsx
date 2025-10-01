'use client';

import { useState } from 'react';
import { FiHome, FiSearch, FiFilter } from 'react-icons/fi';
import ImovelCardCadastro from './ImovelCardCadastro';
import FiltroCadastroImoveis from './FiltroCadastroImoveis';
import type { Imovel } from '@/types/Imovel';
import type { Patrocinador } from '@/types/cadastrar-patrocinador';
import { supabase } from '@/lib/supabase'

interface ListaImoveisProps {
  imoveis: Imovel[];
  carregando: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (imovel: Imovel) => void;
  patrocinadores: Patrocinador[];
  filtros: {
    tipoNegocio: string;
    setorNegocio: string;
    patrocinador: string;
    codigoImovel: string;
  };
  onFiltroChange: (filtros: {
    tipoNegocio: string;
    setorNegocio: string;
    patrocinador: string;
    codigoImovel: string;
  }) => void;
}

export default function ListaImoveis({
  imoveis,
  carregando,
  onDelete,
  onEdit,
  patrocinadores,
  filtros,
  onFiltroChange,
}: ListaImoveisProps) {
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  
  const handleDeleteImovel = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        const { data: imovel } = await supabase
          .from('imoveis')
          .select('imagens')
          .eq('id', id)
          .single();

        if (imovel?.imagens && Array.isArray(imovel.imagens)) {
          for (const url of imovel.imagens) {
            const path = url.split('/storage/v1/object/public/imagens/')[1];
            if (path) {
              await supabase.storage.from('imagens').remove([path]);
            }
          }
        }

        const { error } = await supabase.from('imoveis').delete().eq('id', id);
        
        if (error) {
          alert('Erro ao excluir imóvel: ' + error.message);
        } else {
          await onDelete(id);
          alert('Imóvel excluído com sucesso!');
        }
        
      } catch (error) {
        console.error('Erro ao excluir imóvel:', error);
        alert('Erro inesperado ao excluir imóvel.');
      }
    }
  };

  return (
    <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
      {/* Header da Seção */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-xl">
            <FiHome className="text-blue-600" size={20} />
          </div>
          <div>
            <h2 className="font-poppins text-lg sm:text-xl font-bold text-blue-900">
              Imóveis Cadastrados ({imoveis.length})
            </h2>
            <p className="text-blue-600 text-sm">
              Gerencie todos os imóveis cadastrados na plataforma
            </p>
          </div>
        </div>

        {/* Botão de Filtro */}
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
            ${mostrarFiltros 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            }
          `}
        >
          <FiFilter className={`w-4 h-4 transition-transform duration-200 ${mostrarFiltros ? 'rotate-180' : ''}`} />
          {mostrarFiltros ? 'Ocultar Filtros' : 'Filtrar Imóveis'}
          {(filtros.tipoNegocio || filtros.setorNegocio || filtros.patrocinador || filtros.codigoImovel) && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {[filtros.tipoNegocio, filtros.setorNegocio, filtros.patrocinador, filtros.codigoImovel]
                .filter(Boolean).length}
            </span>
          )}
        </button>
      </div>

      {/* Filtros Expansíveis */}
      {mostrarFiltros && (
        <div className="mb-6 transition-all duration-300 ease-in-out">
          <FiltroCadastroImoveis
            patrocinadores={patrocinadores}
            onFiltroChange={onFiltroChange}
          />
        </div>
      )}

      {/* Estados da Lista */}
      {carregando ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando imóveis...</span>
        </div>
      ) : imoveis.length === 0 ? (
        <div className="text-center py-8 bg-blue-50 rounded-xl border border-blue-200">
          <FiSearch className="mx-auto text-blue-400 mb-3" size={40} />
          <h3 className="text-blue-700 font-semibold text-lg mb-2">
            🏠 Nenhum imóvel cadastrado
          </h3>
          <p className="text-blue-600 mb-4">
            Comece cadastrando seu primeiro imóvel usando o formulário acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {imoveis.map((imovel) => (
            <div
              key={imovel.id}
              className="transition duration-500 ease-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              <ImovelCardCadastro
                imovel={{
                  ...imovel,
                  tipoImovel: imovel.tipoimovel,
                  enderecoDetalhado: imovel.enderecodetalhado,
                  tipoNegocio: imovel.tiponegocio,
                  setorNegocio: imovel.setornegocio,
                  dataCadastro: imovel.datacadastro,
                  itens: Object.fromEntries(
                    Object.entries(imovel.itens ?? {}).map(([k, v]) => [k, Number(v)])
                  )
                }}
                onDelete={handleDeleteImovel}
                onEdit={onEdit}
                patrocinadores={patrocinadores}
              />
            </div>
          ))}
        </div>
      )}

      {/* Rodapé com Informações */}
      {imoveis.length > 0 && (
        <div className="mt-4 pt-4 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-4">
            <span>
              Mostrando {imoveis.length} imóveis
            </span>
          </div>
        </div>
      )}
    </section>
  );
}