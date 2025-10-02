"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FiHome, FiPlus, FiArrowLeft, FiSearch, FiFilter } from "react-icons/fi";
import ImovelCardCadastro from "@/components/cadastrar-imovel/ImovelCardCadastro";
import type { UsuarioFormulario } from "@/types/formularios";

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
  metragem?: number;
  tiponegocio?: string;
  setornegocio?: string;
  imagens?: string[];
  itens?: Record<string, number>;
  codigoimovel?: string;
  enderecodetalhado?: string;
  whatsapp?: string; // Adicionar campo WhatsApp
}

export default function MeusImoveisPage() {
  const router = useRouter();
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imoveisFiltrados, setImoveisFiltrados] = useState<Imovel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"todos" | "ativo" | "inativo">("todos");
  const [usuarios, setUsuarios] = useState<UsuarioFormulario[]>([]);



  const carregarImoveis = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("imoveis")
        .select("*")
        .eq("user_id", authUser.id)
        .order("datacadastro", { ascending: false });

      if (error) {
        console.error("Erro ao carregar imóveis:", error);
        return;
      }

      setImoveis(data || []);

      // Configurar usuário para o card
      if (authUser) {
        // Buscar dados do perfil
        const { data: profileData } = await supabase
          .from("profiles")
          .select("nome, sobrenome, telefone, categoria, creci")
          .eq("id", authUser.id)
          .single();

        const usuarioFormatado: UsuarioFormulario = {
          id: authUser.id,
          nome: profileData?.nome || "Usuário",
          sobrenome: profileData?.sobrenome || "",
          email: authUser.email || "",
          telefone: profileData?.telefone || "",
          categoria: profileData?.categoria || "proprietario",
          creci: profileData?.creci || ""
        };
        setUsuarios([usuarioFormatado]);
      }
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

  // Handlers para o ImovelCardCadastro
  const handleDelete = async (imovelId: string) => {
    if (!confirm("Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("imoveis")
        .delete()
        .eq("id", imovelId);

      if (error) {
        console.error("Erro ao excluir imóvel:", error);
        alert("Erro ao excluir imóvel");
        return;
      }

      // Remover da lista local
      setImoveis(prev => prev.filter(item => item.id !== imovelId));
      alert("Imóvel excluído com sucesso!");
    } catch (error) {
      console.error("Erro:", error);
      alert("Erro ao excluir imóvel");
    }
  };

  const handleEdit = (imovel: { id?: string }) => {
    // Redirecionar para página de edição ou abrir modal
    if (imovel.id) {
      router.push(`/painel-usuario/cadastrar-imovel?edit=${imovel.id}`);
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imoveisFiltrados.map((imovel) => (
              <ImovelCardCadastro
                key={imovel.id}
                imovel={{
                  id: imovel.id,
                  tipoimovel: imovel.tipoimovel,
                  cidade: imovel.cidade,
                  bairro: imovel.bairro,
                  valor: imovel.valor,
                  descricao: imovel.descricao,
                  ativo: imovel.ativo,
                  user_id: imovel.user_id,
                  datacadastro: imovel.datacadastro,
                  metragem: imovel.metragem || 0,
                  tiponegocio: imovel.tiponegocio || "",
                  setornegocio: imovel.setornegocio || "",
                  imagens: imovel.imagens || [],
                  itens: typeof imovel.itens === 'string' 
                    ? (JSON.parse(imovel.itens as string) || {})
                    : (imovel.itens || {}),
                  codigoimovel: imovel.codigoimovel || "",
                  enderecodetalhado: imovel.enderecodetalhado || "",
                  whatsapp: imovel.whatsapp || "",
                  tipoImovel: imovel.tipoimovel,
                  tipoNegocio: imovel.tiponegocio || "",
                  setorNegocio: imovel.setornegocio || "",
                  enderecoDetalhado: imovel.enderecodetalhado || "",
                  codigoImovel: imovel.codigoimovel || "",
                  dataCadastro: imovel.datacadastro
                }}
                onDelete={handleDelete}
                onEdit={handleEdit}
                usuarios={usuarios}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}