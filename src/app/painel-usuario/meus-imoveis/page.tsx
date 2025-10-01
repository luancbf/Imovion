"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FiHome, FiPlus, FiArrowLeft, FiMapPin, FiDollarSign, FiExternalLink, FiEdit3, FiTrash2, FiSearch, FiFilter } from "react-icons/fi";
import { formatarParaMoeda } from "@/utils/formatters";
import EditarImovelModal from "@/components/painel-usuario/EditarImovelModal";

interface Imovel {
  id: string;
  tipoimovel: string;
  cidade: string;
  bairro: string;
  valor: number;
  descricao: string;
  ativo: boolean;
  user_id: string;
  datacadastro: string;
}

export default function MeusImoveisPage() {
  const router = useRouter();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [imovelParaEditar, setImovelParaEditar] = useState<Imovel | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const formatarMoeda = (valor: number) => {
    return formatarParaMoeda(valor.toString());
  };

  const carregarImoveis = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .eq("user_id", user.id)
        .order("datacadastro", { ascending: false });

      if (error) {
        console.error("Erro ao carregar imóveis:", error);
        return;
      }

      setImoveis(data || []);
    } catch (error) {
      console.error("Erro:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const aplicarFiltros = useCallback(() => {
    let filtrados = [...imoveis];

    // Filtro por termo de busca
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase();
      filtrados = filtrados.filter(imovel => 
        imovel.tipoimovel.toLowerCase().includes(termo) ||
        imovel.cidade.toLowerCase().includes(termo) ||
        imovel.bairro.toLowerCase().includes(termo) ||
        imovel.descricao?.toLowerCase().includes(termo)
      );
    }

    // Filtro por status
    if (statusFilter !== "todos") {
      const isAtivo = statusFilter === "ativo";
      filtrados = filtrados.filter(imovel => imovel.ativo === isAtivo);
    }

    setImoveisFiltrados(filtrados);
  }, [imoveis, searchTerm, statusFilter]);

  useEffect(() => {
    carregarImoveis();
  }, [carregarImoveis]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  const abrirModalEdicao = (imovel: Imovel) => {
    setImovelParaEditar(imovel);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setImovelParaEditar(null);
    setModalAberto(false);
  };

  const handleSuccessEdicao = () => {
    carregarImoveis();
    fecharModal();
  };

  const alternarStatus = async (imovel: Imovel) => {
    try {
      const { error } = await supabase
        .from("imoveis")
        .update({ ativo: !imovel.ativo })
        .eq("id", imovel.id)
        .eq("user_id", imovel.user_id); // Segurança extra

      if (error) {
        console.error("Erro ao alterar status:", error);
        alert("Erro ao alterar status do imóvel");
        return;
      }

      // Atualizar lista local
      setImoveis(prev => prev.map(item => 
        item.id === imovel.id ? { ...item, ativo: !item.ativo } : item
      ));

      alert(`Imóvel ${!imovel.ativo ? 'ativado' : 'desativado'} com sucesso!`);
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao alterar status do imóvel");
    }
  };

  const excluirImovel = async (imovel: Imovel) => {
    if (!confirm("Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", imovel.id)
        .eq("user_id", imovel.user_id); // Segurança extra

      if (error) {
        console.error("Erro ao excluir imóvel:", error);
        alert("Erro ao excluir imóvel");
        return;
      }

      // Remover da lista local
      setImoveis(prev => prev.filter(item => item.id !== imovel.id));
      alert("Imóvel excluído com sucesso!");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao excluir imóvel");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Carregando seus imóveis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <div className="max-w-7xl mx-auto p-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <FiArrowLeft size={24} className="text-blue-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-blue-900">Meus Imóveis</h1>
            <p className="text-gray-600">Gerencie todos os seus imóveis cadastrados</p>
          </div>
          <Link
            href="/painel-usuario/cadastrar-imovel"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus size={20} />
            Cadastrar Novo
          </Link>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            
            {/* Busca */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por tipo, cidade, bairro ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            {/* Filtro por Status */}
            <div className="relative">
              <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as "todos" | "ativo" | "inativo")}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors appearance-none bg-white"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Apenas Ativos</option>
                <option value="inativo">Apenas Inativos</option>
              </select>
            </div>
          </div>

          {/* Informações dos resultados */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <span>
              {imoveisFiltrados.length} de {imoveis.length} imóveis
            </span>
            {(searchTerm || statusFilter !== "todos") && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("todos");
                }}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>

        {/* Lista de Imóveis */}
        {imoveisFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <FiHome className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {searchTerm || statusFilter !== "todos" ? 
                "Nenhum imóvel encontrado" : 
                "Nenhum imóvel cadastrado"
              }
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "todos" ? 
                "Tente alterar os filtros para encontrar seus imóveis." :
                "Comece cadastrando seu primeiro imóvel para atrair compradores e locatários."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {imoveisFiltrados.map((imovel) => (
              <div key={imovel.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                
                {/* Header do Card */}
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {imovel.tipoimovel}
                      </h3>
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <FiMapPin size={14} />
                        <span>{imovel.cidade} - {imovel.bairro}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      imovel.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {imovel.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-blue-600 font-semibold">
                      <FiDollarSign size={16} />
                      <span>{formatarMoeda(imovel.valor)}</span>
                    </div>
                  </div>
                </div>

                {/* Descrição */}
                {imovel.descricao && (
                  <div className="px-6 py-4 border-b border-gray-100">
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {imovel.descricao}
                    </p>
                  </div>
                )}

                {/* Ações */}
                <div className="p-6 bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/imoveis/${imovel.id}`}
                      target="_blank"
                      className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      <FiExternalLink size={14} />
                      Ver Anúncio
                    </Link>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => abrirModalEdicao(imovel)}
                      className="flex items-center gap-1 text-gray-600 hover:text-blue-600 text-sm"
                      title="Editar imóvel"
                    >
                      <FiEdit3 size={14} />
                    </button>
                    
                    <button
                      onClick={() => alternarStatus(imovel)}
                      className={`text-sm px-2 py-1 rounded ${
                        imovel.ativo
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-green-600 hover:bg-green-50'
                      }`}
                      title={imovel.ativo ? 'Desativar' : 'Ativar'}
                    >
                      {imovel.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                    
                    <button
                      onClick={() => excluirImovel(imovel)}
                      className="flex items-center gap-1 text-red-600 hover:text-red-800 text-sm"
                      title="Excluir imóvel"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de Edição */}
        {imovelParaEditar && (
          <EditarImovelModal 
            imovel={imovelParaEditar}
            isOpen={modalAberto}
            onClose={fecharModal}
            onSuccess={handleSuccessEdicao}
          />
        )}
      </div>
    </div>
  );
}