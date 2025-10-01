"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { FiHome, FiX } from "react-icons/fi";
import { useAuth } from "@/hooks/useAuth";
import { CategoriaUsuario, LIMITES_POR_CATEGORIA } from "@/types/usuarios";
import IndicadorProgresso from "./formulario/IndicadorProgresso";
import NavigacaoEtapas from "./formulario/NavigacaoEtapas";
import Etapa1TipoCategoria from "./formulario/Etapa1TipoCategoria";
import Etapa2Localizacao from "./formulario/Etapa2Localizacao";
import Etapa3Detalhes from "./formulario/Etapa3Detalhes";
import Etapa4Imagens from "./formulario/Etapa4Imagens";
import Etapa5Caracteristicas from "./formulario/Etapa5Caracteristicas";
import AlertModal from "@/components/common/AlertModal";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";
import { formatarParaMoeda, formatarMetragem, formatarTelefone } from "@/utils/formatters";
import type { FormularioImovelProps, ImovelEdicao } from "@/types/formularios";

// TIPOS ADICIONAIS
interface Patrocinador {
  id: string;
  nome: string;
  telefone?: string;
  creci?: string;
}

interface FormularioState {
  codigoImovel: string;
  cidade: string;
  bairro: string;
  enderecoDetalhado: string;
  valor: string;
  metragem: string;
  descricao: string;
  tipoImovel: string;
  setorNegocio: string;
  tipoNegocio: string;
  whatsapp: string;
  patrocinador: string;
  creci: string;
}

// CONSTANTES
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FORMULARIO_INICIAL: FormularioState = {
  codigoImovel: "",
  cidade: "",
  bairro: "",
  enderecoDetalhado: "",
  valor: "",
  metragem: "",
  descricao: "",
  tipoImovel: "",
  setorNegocio: "",
  tipoNegocio: "",
  whatsapp: "",
  patrocinador: "",
  creci: "",
};

// Constantes removidas - movidas para subcomponentes

// HOOKS CUSTOMIZADOS
function useAlert() {
  const [alertModal, setAlertModal] = useState({
    open: false,
    type: "info" as "success" | "error" | "info",
    message: ""
  });

  const showAlert = useCallback((type: "success" | "error" | "info", message: string) => {
    setAlertModal({ open: true, type, message });
  }, []);

  const closeAlert = useCallback(() => {
    setAlertModal({ open: false, type: "info", message: "" });
  }, []);

  return { alertModal, showAlert, closeAlert };
}

function useFormulario(dadosIniciais: ImovelEdicao | null | undefined, patrocinadores: Patrocinador[]) {
  const [formulario, setFormulario] = useState<FormularioState>(FORMULARIO_INICIAL);
  const [modoEdicao, setModoEdicao] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const formatters: Record<string, (val: string) => string> = {
      valor: formatarParaMoeda,
      metragem: formatarMetragem,
      whatsapp: formatarTelefone,
    };
    const formatter = formatters[name];
    const valorFormatado = formatter ? formatter(value) : value;
    setFormulario(prev => ({ ...prev, [name]: valorFormatado }));
  }, []);

  const limparFormulario = useCallback(() => {
    setFormulario(FORMULARIO_INICIAL);
    setModoEdicao(false);
  }, []);

  // Inicializar formulário com dados existentes
  useEffect(() => {
    if (!dadosIniciais?.id) {
      limparFormulario();
      return;
    }

    setModoEdicao(true);
    
    // Função auxiliar para formatar valor
    const formatarValorInicial = (valor: unknown): string => {
      if (typeof valor === "number") {
        return formatarParaMoeda(valor.toString());
      }
      if (typeof valor === "string") {
        return formatarParaMoeda(valor);
      }
      return "";
    };

    // Função auxiliar para formatar metragem
    const formatarMetragemInicial = (metragem: unknown): string => {
      if (typeof metragem === "number") {
        return formatarMetragem(metragem.toString());
      }
      if (typeof metragem === "string") {
        return metragem;
      }
      return "";
    };

    setFormulario({
      codigoImovel: dadosIniciais.codigoimovel || "",
      cidade: dadosIniciais.cidade || "",
      bairro: dadosIniciais.bairro || "",
      enderecoDetalhado: dadosIniciais.enderecodetalhado || "",
      valor: formatarValorInicial(dadosIniciais.valor),
      metragem: formatarMetragemInicial(dadosIniciais.metragem),
      descricao: dadosIniciais.descricao || "",
      tipoImovel: dadosIniciais.tipoimovel || "",
      setorNegocio: dadosIniciais.setornegocio || "",
      tipoNegocio: dadosIniciais.tiponegocio || "",
      whatsapp: dadosIniciais.whatsapp || "",
      patrocinador: dadosIniciais.patrocinadorid || "",
      creci: "", // Campo não existe no tipo ImovelEdicao, então mantemos vazio
    });
  }, [dadosIniciais, limparFormulario]);

  // Auto-preencher dados do patrocinador
  useEffect(() => {
    if (formulario.patrocinador) {
      const patrocinador = patrocinadores.find(p => p.id === formulario.patrocinador);
      if (patrocinador) {
        setFormulario(prev => ({
          ...prev,
          whatsapp: patrocinador.telefone || prev.whatsapp,
          creci: patrocinador.creci || "",
        }));
      }
    }
  }, [formulario.patrocinador, patrocinadores]);

  return { formulario, modoEdicao, handleChange, limparFormulario };
}

function useImagens(dadosIniciais: ImovelEdicao | null | undefined) {
  const [previews, setPreviews] = useState<string[]>([]);
  const [imagensNovas, setImagensNovas] = useState<File[]>([]);
  const [imagensExistentes, setImagensExistentes] = useState<string[]>([]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const filesArray = Array.from(e.target.files);
    setImagensNovas(prev => [...prev, ...filesArray]);
    const newPreviews = filesArray.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files?.length) return;
    const filesArray = Array.from(e.dataTransfer.files);
    setImagensNovas(prev => [...prev, ...filesArray]);
    const newPreviews = filesArray.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  }, []);

  const removeImagem = useCallback((index: number) => {
    const imagensExistentesCount = imagensExistentes.length;
    if (index < imagensExistentesCount) {
      setImagensExistentes(prev => prev.filter((_, i) => i !== index));
    } else {
      const novoIndex = index - imagensExistentesCount;
      setImagensNovas(prev => prev.filter((_, i) => i !== novoIndex));
    }
    setPreviews(prev => prev.filter((_, i) => i !== index));
  }, [imagensExistentes.length]);

  const limparImagens = useCallback(() => {
    setPreviews([]);
    setImagensNovas([]);
    setImagensExistentes([]);
  }, []);

  // Inicializar imagens existentes
  useEffect(() => {
    if (Array.isArray(dadosIniciais?.imagens)) {
      const imagensValidas = dadosIniciais.imagens.filter(
        (img): img is string => typeof img === 'string' && img.trim().length > 0
      );
      setImagensExistentes([...imagensValidas]);
      setPreviews([...imagensValidas]);
    }
  }, [dadosIniciais]);

  return {
    previews,
    imagensNovas,
    imagensExistentes,
    handleFileChange,
    handleDrop,
    removeImagem,
    limparImagens
  };
}

function useItens(dadosIniciais: ImovelEdicao | null | undefined, formulario: FormularioState) {
  const [itens, setItens] = useState<Record<string, number>>({});

  const itensDisponiveis = ITENS_POR_SETOR[formulario.tipoNegocio as keyof typeof ITENS_POR_SETOR] || [];

  const inicializarItens = useCallback((): Record<string, number> => {
    const todosItens = Object.values(ITENS_POR_SETOR).flat().filter(Boolean);
    return Object.fromEntries(todosItens.map((item) => [item.chave, 0]));
  }, []);

  const limparItens = useCallback(() => {
    setItens(inicializarItens());
  }, [inicializarItens]);

  // Inicializar itens existentes
  useEffect(() => {
    if (dadosIniciais?.itens) {
      try {
        const itensObj = typeof dadosIniciais.itens === 'string'
          ? JSON.parse(dadosIniciais.itens)
          : dadosIniciais.itens;
        
        if (typeof itensObj === 'object' && itensObj !== null) {
          const itensNumericos = Object.fromEntries(
            Object.entries(itensObj).map(([k, v]) => [k, Number(v) || 0])
          );
          setItens(itensNumericos);
        } else {
          setItens(inicializarItens());
        }
      } catch {
        setItens(inicializarItens());
      }
    } else {
      setItens(inicializarItens());
    }
  }, [dadosIniciais, inicializarItens]);

  return { itens, setItens, itensDisponiveis, limparItens };
}

// COMPONENTE PRINCIPAL
export default function FormularioImovel({
  patrocinadores,
  opcoesTipoImovel,
  onSuccess,
  dadosIniciais,
  onLimpar,
}: FormularioImovelProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  
  // Hooks customizados
  const { alertModal, showAlert, closeAlert } = useAlert();
  const { formulario, modoEdicao, handleChange, limparFormulario } = useFormulario(dadosIniciais, patrocinadores as Patrocinador[]);
  const { previews, imagensNovas, imagensExistentes, handleFileChange, handleDrop, removeImagem, limparImagens } = useImagens(dadosIniciais);
  const { itens, setItens, itensDisponiveis, limparItens } = useItens(dadosIniciais, formulario);

  // Função para verificar limite de imóveis
  const verificarLimiteImoveis = useCallback(async (): Promise<boolean> => {
    if (!user) {
      showAlert("error", "Usuário não autenticado");
      return false;
    }

    // Se for modo edição, não precisa verificar limite
    if (modoEdicao) return true;

    try {
      // Buscar informações do usuário
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("categoria, limite_imoveis")
        .eq("id", user.id)
        .single();

      if (profileError || !profile) {
        showAlert("error", "Erro ao verificar informações do usuário");
        return false;
      }

      const categoria: CategoriaUsuario = profile.categoria || 'usuario_comum';
      const limite = profile.limite_imoveis || LIMITES_POR_CATEGORIA[categoria];

      // Contar imóveis existentes do usuário
      const { count, error: countError } = await supabase
        .from("imoveis")
        .select("*", { count: 'exact', head: true })
        .eq("user_id", user.id)
        .eq("ativo", true);

      if (countError) {
        showAlert("error", "Erro ao verificar limite de imóveis");
        return false;
      }

      const totalImoveis = count || 0;
      
      if (totalImoveis >= limite) {
        showAlert("error", `Limite de ${limite} imóveis atingido para sua categoria. Atualize seu plano para cadastrar mais imóveis.`);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao verificar limite:", error);
      showAlert("error", "Erro ao verificar limite de imóveis");
      return false;
    }
  }, [user, modoEdicao, showAlert]);

  // State local
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [carregando, setCarregando] = useState(false);

  // Validações de etapa
  const etapaValida = useCallback((etapa: number): boolean => {
    const validacoes: Record<number, () => boolean> = {
      1: () => !!(formulario.tipoNegocio && formulario.setorNegocio && formulario.tipoImovel),
      2: () => !!(formulario.cidade && formulario.bairro && formulario.enderecoDetalhado),
      3: () => !!(formulario.valor && formulario.metragem && formulario.descricao && formulario.whatsapp),
      4: () => (imagensExistentes.length + imagensNovas.length) > 0,
    };
    return validacoes[etapa]?.() ?? true;
  }, [formulario, imagensExistentes.length, imagensNovas.length]);

  // Upload de imagens
  const uploadImagensSharp = async (imagens: File[], imovelId?: string): Promise<string[]> => {
    const urls: string[] = [];
    
    for (const imagem of imagens) {
      const formData = new FormData();
      formData.append("imagem", imagem);
      formData.append("imovelId", imovelId || "temp");
      
      const res = await fetch("/api/upload-imagem", {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();
      
      if (data.url) {
        urls.push(data.url);
      } else {
        throw new Error(data.error || "Erro ao enviar imagem");
      }
    }
    
    return urls;
  };

  // Parsear valor monetário
  const parseValor = (valorStr: string): number => {
    let limpo = valorStr.replace(/^R\$\s*/, "");
    limpo = limpo.replace(/\./g, "");
    limpo = limpo.replace(",", ".");
    return parseFloat(limpo) || 0;
  };

  // Handlers principais
  const cancelarEdicao = useCallback(() => {
    limparFormulario();
    limparImagens();
    limparItens();
    setEtapaAtual(1);
    onLimpar?.();
  }, [limparFormulario, limparImagens, limparItens, onLimpar]);

  const enviarFormulario = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    
    try {
      const totalImagens = imagensExistentes.length + imagensNovas.length;
      if (totalImagens === 0) {
        showAlert("error", "Por favor, adicione pelo menos uma imagem");
        return;
      }

      // Verificar limite de imóveis antes de prosseguir
      const podeAdicionar = await verificarLimiteImoveis();
      if (!podeAdicionar) {
        return;
      }

      const capitalizar = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      const dadosImovel = {
        codigoimovel: formulario.codigoImovel?.trim() || "",
        cidade: formulario.cidade.trim(),
        bairro: formulario.bairro.trim(),
        enderecodetalhado: formulario.enderecoDetalhado,
        valor: parseValor(formulario.valor),
        metragem: Number(formulario.metragem.replace(/\D/g, "")),
        descricao: formulario.descricao,
        tipoimovel: formulario.tipoImovel.trim(),
        tiponegocio: capitalizar(formulario.tipoNegocio.trim()),
        setornegocio: capitalizar(formulario.setorNegocio.trim()),
        whatsapp: formulario.whatsapp.replace(/\D/g, ""),
        patrocinadorid: formulario.patrocinador || null,
        itens: Object.fromEntries(
          itensDisponiveis.map(item => [item.chave, itens[item.chave] || 0])
        ),
      };
      
      if (modoEdicao && dadosIniciais?.id) {
        // MODO EDIÇÃO
        let urlsFinais = [...imagensExistentes];
        
        if (imagensNovas.length > 0) {
          const novasUrls = await uploadImagensSharp(imagensNovas, dadosIniciais.id);
          urlsFinais = [...urlsFinais, ...novasUrls];
        }
        
        const { error } = await supabase
          .from("imoveis")
          .update({
            ...dadosImovel,
            imagens: urlsFinais,
            updated_at: new Date().toISOString(),
          })
          .eq("id", dadosIniciais.id);
          
        if (error) throw new Error(`Erro ao atualizar: ${error.message}`);
        
        showAlert("success", "✅ Imóvel atualizado com sucesso!");
        
      } else {
        // MODO CRIAÇÃO
        const { data, error } = await supabase
          .from("imoveis")
          .insert([{
            ...dadosImovel,
            datacadastro: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            ativo: true,
            imagens: [],
          }])
          .select()
          .single();
          
        if (error || !data?.id) throw new Error(error?.message || "Erro ao criar imóvel.");
        
        if (imagensNovas.length > 0) {
          const urlsImagens = await uploadImagensSharp(imagensNovas, data.id);
          
          await supabase
            .from("imoveis")
            .update({
              imagens: urlsImagens,
              updated_at: new Date().toISOString()
            })
            .eq("id", data.id);
        }
        
        showAlert("success", "✅ Imóvel cadastrado com sucesso!");
      }
      
      cancelarEdicao();
      onSuccess?.();
      router.refresh();
      
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido.";
      showAlert("error", `❌ ${mensagemErro}`);
    } finally {
      setCarregando(false);
    }
  }, [
    formulario, imagensExistentes, imagensNovas, itensDisponiveis, itens,
    modoEdicao, dadosIniciais, showAlert, cancelarEdicao, onSuccess, router, verificarLimiteImoveis
  ]);

  return (
    <>
      <AlertModal
        open={alertModal.open}
        type={alertModal.type}
        message={alertModal.message}
        onClose={closeAlert}
      />

      {/* ✅ CONTAINER MAIS COMPACTO */}
      <section className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 border border-blue-100">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <FiHome className="text-blue-600" size={20} />
            </div>
            <h1 className="font-poppins text-lg sm:text-2xl font-bold text-blue-900">
              {modoEdicao ? "✏️ Editando Imóvel" : "🏠 Cadastrar Novo Imóvel"}
            </h1>
          </div>
          {modoEdicao && (
            <button
              type="button"
              onClick={cancelarEdicao}
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm cursor-pointer"
            >
              <FiX size={16} />
              <span className="hidden sm:inline">Cancelar</span>
            </button>
          )}
        </div>

        {/* Indicador de Progresso */}
        <IndicadorProgresso
          etapaAtual={etapaAtual}
          etapaValida={etapaValida}
          onEtapaChange={setEtapaAtual}
        />

        {/* Formulário - PADDING REDUZIDO */}
        <form onSubmit={enviarFormulario} className="space-y-6">
          {/* Etapa 1: Tipo & Categoria */}
          {etapaAtual === 1 && (
            <Etapa1TipoCategoria
              formulario={formulario}
              opcoesTipoImovel={opcoesTipoImovel}
              onChange={handleChange}
            />
          )}

          {/* Etapa 2: Localização */}
          {etapaAtual === 2 && (
            <Etapa2Localizacao
              formulario={formulario}
              onChange={handleChange}
            />
          )}

          {/* Etapa 3: Detalhes & Valor */}
          {etapaAtual === 3 && (
            <Etapa3Detalhes
              formulario={formulario}
              patrocinadores={patrocinadores as Patrocinador[]}
              onChange={handleChange}
            />
          )}

          {/* Etapa 4: Imagens */}
          {etapaAtual === 4 && (
            <Etapa4Imagens
              previews={previews}
              imagensExistentes={imagensExistentes}
              imagensNovas={imagensNovas}
              modoEdicao={modoEdicao}
              onDrop={handleDrop}
              onFileChange={handleFileChange}
              onRemove={removeImagem}
              fileInputRef={fileInputRef}
            />
          )}

          {/* Etapa 5: Características */}
          {etapaAtual === 5 && (
            <Etapa5Caracteristicas
              tipoNegocio={formulario.tipoNegocio}
              itensDisponiveis={itensDisponiveis}
              itens={itens}
              setItens={setItens}
              ITENS_QUANTITATIVOS={ITENS_QUANTITATIVOS}
            />
          )}

          {/* Navegação e Ações */}
          <NavigacaoEtapas
            etapaAtual={etapaAtual}
            totalEtapas={5}
            etapaValida={etapaValida}
            carregando={carregando}
            modoEdicao={modoEdicao}
            onAnterior={() => setEtapaAtual(etapaAtual - 1)}
            onProximo={() => setEtapaAtual(etapaAtual + 1)}
            onSubmit={enviarFormulario}
          />
        </form>
      </section>
    </>
  );
}