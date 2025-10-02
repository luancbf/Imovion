"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import { CategoriaUsuario, LIMITES_POR_CATEGORIA } from "@/types/usuarios";
import DashboardHeader from "@/components/painel-usuario/DashboardHeader";
import StatsCards from "@/components/painel-usuario/StatsCards";
import QuickActions from "@/components/painel-usuario/QuickActions";
import UltimoImovel from "@/components/painel-usuario/UltimoImovel";
import ListaImoveisUsuario from "@/components/painel-usuario/ListaImoveisUsuario";
import EditarImovelModal from "@/components/painel-usuario/EditarImovelModal";
import InfoCategoriaUsuario from "@/components/painel-usuario/InfoCategoriaUsuario";
import StatusPlanoUsuario from "@/components/painel-usuario/StatusPlanoUsuario";

interface Imovel {
  id: string;
  tipoimovel: string;
  cidade: string;
  bairro: string;
  valor: number;
  descricao: string;
  datacadastro: string;
  ativo: boolean;
  user_id: string;
}

interface DashboardStats {
  totalImoveis: number;
  imoveisAtivos: number;
  ultimoImovel?: Imovel;
}

interface UserInfo {
  nome: string;
  sobrenome: string;
  categoria: CategoriaUsuario;
  limite_imoveis: number;
}

export default function PainelUsuarioDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalImoveis: 0,
    imoveisAtivos: 0,
    ultimoImovel: undefined,
  });
  const [userInfo, setUserInfo] = useState<UserInfo>({
    nome: '',
    sobrenome: '',
    categoria: 'proprietario',
    limite_imoveis: 1,
  });
  const [carregando, setCarregando] = useState(true);
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [imovelParaEditar, setImovelParaEditar] = useState<Imovel | null>(null);
  const [modalAberto, setModalAberto] = useState(false);

  const carregarDados = useCallback(async () => {
    if (!user) return;

    try {
        // Carregar informações do usuário (categoria, nome, etc.)
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("nome, sobrenome, categoria, limite_imoveis")
          .eq("id", user.id)
          .single();

        if (!profileError && profileData) {
          const categoria: CategoriaUsuario = profileData.categoria || 'proprietario';
          setUserInfo({
            nome: profileData.nome || '',
            sobrenome: profileData.sobrenome || '',
            categoria,
            limite_imoveis: profileData.limite_imoveis || LIMITES_POR_CATEGORIA[categoria],
          });
        }

        // Buscar apenas imóveis do usuário logado
        const { data: imoveis, error } = await supabase
          .from("imoveis")
          .select("*")
          .eq("user_id", user.id)
          .order("datacadastro", { ascending: false });

        if (error) {
          console.error("Erro ao carregar dados:", error.message || error);
          // Se for erro de coluna inexistente, continua com dados vazios
          if (error.message?.includes('user_id does not exist')) {
            console.log("Coluna user_id não existe ainda. Execute o script verificar_user_id_imoveis.sql");
            setStats({
              totalImoveis: 0,
              imoveisAtivos: 0,
              ultimoImovel: undefined,
            });
            setCarregando(false);
            return;
          }
          setCarregando(false);
          return;
        }

        const imoveisData = (imoveis as Imovel[]) || [];
        const imoveisAtivos = imoveisData.filter((i) => i.ativo).length;

        // Salvar lista de imóveis no estado
        setImoveis(imoveisData);

        setStats({
          totalImoveis: imoveisData.length,
          imoveisAtivos,
          ultimoImovel: imoveisData[0],
        });
      } catch (error) {
        console.error("Erro inesperado ao carregar dados:", error instanceof Error ? error.message : String(error));
      } finally {
        setCarregando(false);
      }
  }, [user]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const abrirModalEdicao = (imovel: Imovel) => {
    setImovelParaEditar(imovel);
    setModalAberto(true);
  };

  const fecharModal = () => {
    setImovelParaEditar(null);
    setModalAberto(false);
  };

  const handleSuccessEdicao = () => {
    carregarDados();
    fecharModal();
  };

  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (carregando || !user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader user={user} />

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Status do Plano do Usuário */}
      <StatusPlanoUsuario />

      {/* Informações da Categoria do Usuário */}
      <InfoCategoriaUsuario 
        categoria={userInfo.categoria}
        totalImoveis={stats.totalImoveis}
        nome={userInfo.nome}
      />

      {/* Quick Actions */}
      <QuickActions />

      {/* Último Imóvel */}
      {stats.ultimoImovel && (
        <UltimoImovel 
          ultimoImovel={stats.ultimoImovel} 
          formatarMoeda={formatarMoeda} 
        />
      )}

      {/* Lista de Imóveis do Usuário */}
      <ListaImoveisUsuario
        imoveis={imoveis}
        formatarMoeda={formatarMoeda}
        onEditarImovel={abrirModalEdicao}
      />

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
  );
}