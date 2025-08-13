'use client';

import { FiHome, FiSearch } from 'react-icons/fi';
import ImovelCardCadastro from './ImovelCardCadastro';
import type { Imovel } from '@/types/Imovel';
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface ListaImoveisProps {
  imoveis: Imovel[];
  carregando: boolean;
  onDelete: (id: string) => Promise<void>;
  onEdit: (imovel: Imovel) => void;
  patrocinadores: { id: string; nome: string }[];
}

export default function ListaImoveis({
  imoveis,
  carregando,
  onDelete,
  onEdit,
  patrocinadores,
}: ListaImoveisProps) {
  
  const handleDeleteImovel = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este imóvel?')) {
      try {
        // 1. Buscar imagens do imóvel
        const { data: imovel } = await supabase
          .from('imoveis')
          .select('imagens')
          .eq('id', id)
          .single();

        // 2. Remover imagens do storage
        if (imovel?.imagens && Array.isArray(imovel.imagens)) {
          for (const url of imovel.imagens) {
            // Ajuste o split conforme seu bucket/pasta
            const path = url.split('/storage/v1/object/public/imagens/')[1];
            if (path) {
              await supabase.storage.from('imagens').remove([path]);
            }
          }
        }

        // 3. Excluir imóvel do banco
        const { error } = await supabase.from('imoveis').delete().eq('id', id);
        
        if (error) {
          alert('Erro ao excluir imóvel: ' + error.message);
        } else {
          // 4. Chamar o callback do componente pai
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
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
      {/* Header da Seção */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiHome className="text-blue-600" size={24} />
          </div>
          <div>
            <h2 className="font-poppins text-2xl font-bold text-blue-900">
              🏠 Imóveis Cadastrados
            </h2>
            <p className="text-blue-600 text-sm">
              {imoveis.length === 0 
                ? 'Nenhum imóvel encontrado' 
                : `${imoveis.length} ${imoveis.length === 1 ? 'imóvel' : 'imóveis'} no sistema`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Estados da Lista */}
      {carregando ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
          <span className="ml-3 text-blue-700 font-medium">Carregando imóveis...</span>
        </div>
      ) : imoveis.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-2xl border border-blue-200">
          <FiSearch className="mx-auto text-blue-400 mb-4" size={48} />
          <h3 className="text-blue-700 font-semibold text-lg mb-2">
            🏠 Nenhum imóvel cadastrado
          </h3>
          <p className="text-blue-600 mb-4">
            Comece cadastrando seu primeiro imóvel usando o formulário acima.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
        <div className="mt-6 pt-6 border-t border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-gray-600">
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