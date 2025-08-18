"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { FiHome, FiSave, FiUpload, FiMapPin, FiDollarSign, FiEdit3, FiX } from "react-icons/fi";
import UploadImages from "./formulario/UploadImages";
import ItensImovel from "./formulario/ItensImovel";
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

const ETAPAS = [
  { numero: 1, icone: FiHome, label: "Tipo & Categoria" },
  { numero: 2, icone: FiMapPin, label: "Localização" },
  { numero: 3, icone: FiDollarSign, label: "Detalhes" },
  { numero: 4, icone: FiUpload, label: "Imagens" },
  { numero: 5, icone: FiEdit3, label: "Características" },
];

const CLASSES = {
  input: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500",
  select: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 cursor-pointer",
  textarea: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none",
};

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
  
  // Hooks customizados
  const { alertModal, showAlert, closeAlert } = useAlert();
  const { formulario, modoEdicao, handleChange, limparFormulario } = useFormulario(dadosIniciais, patrocinadores as Patrocinador[]);
  const { previews, imagensNovas, imagensExistentes, handleFileChange, handleDrop, removeImagem, limparImagens } = useImagens(dadosIniciais);
  const { itens, setItens, itensDisponiveis, limparItens } = useItens(dadosIniciais, formulario);

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
    modoEdicao, dadosIniciais, showAlert, cancelarEdicao, onSuccess, router
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
              className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              <FiX size={16} />
              <span className="hidden sm:inline">Cancelar</span>
            </button>
          )}
        </div>

        {/* Indicador de Progresso - MAIS COMPACTO */}
        <div className="mb-6">
          <div className="flex flex-row items-center justify-between mb-3 gap-1 overflow-x-auto">
            {ETAPAS.map((etapa, index) => {
              const Icone = etapa.icone;
              const isAtual = etapaAtual === etapa.numero;
              const isConcluida = etapaValida(etapa.numero) && etapaAtual > etapa.numero;
              const isAcessivel = index === 0 || ETAPAS.slice(0, index).every((_, i) => etapaValida(i + 1));

              return (
                <div key={etapa.numero} className="flex flex-col items-center flex-1 min-w-[60px]">
                  <button
                    type="button"
                    onClick={() => isAcessivel && setEtapaAtual(etapa.numero)}
                    disabled={!isAcessivel}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 mb-1 cursor-pointer
                      ${isAtual
                        ? "bg-blue-600 text-white"
                        : isConcluida
                        ? "bg-green-500 text-white"
                        : isAcessivel
                        ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isConcluida && !isAtual ? "✓" : <Icone size={16} />}
                  </button>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(ETAPAS.filter((_, i) => etapaValida(i + 1) && etapaAtual > i + 1).length / ETAPAS.length) * 100}%`
              }}
            />
          </div>
        </div>

        {/* Formulário - PADDING REDUZIDO */}
        <form onSubmit={enviarFormulario} className="space-y-6">
          {/* Etapa 1: Tipo & Categoria */}
          {etapaAtual === 1 && (
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2 font-poppins">
                <FiHome size={20} />
                Classificação do Imóvel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-900 font-inter">
                    Setor de Negociação
                  </label>
                  <select
                    name="tipoNegocio"
                    value={formulario.tipoNegocio}
                    onChange={handleChange}
                    className={CLASSES.select}
                    required
                  >
                    <option value="">🏢 Selecione o setor</option>
                    <option value="Residencial">🏠 Residencial</option>
                    <option value="Comercial">🏪 Comercial</option>
                    <option value="Rural">🌾 Rural</option>
                  </select>
                </div>
                {formulario.tipoNegocio && (
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-blue-900 font-inter">
                      Tipo de Negócio
                    </label>
                    <select
                      name="setorNegocio"
                      value={formulario.setorNegocio}
                      onChange={handleChange}
                      className={CLASSES.select}
                      required
                    >
                      <option value="">💼 Tipo de negócio</option>
                      <option value="Aluguel">🏠 Aluguel</option>
                      <option value="Venda">💰 Venda</option>
                    </select>
                  </div>
                )}
              </div>
              {formulario.tipoNegocio && formulario.setorNegocio && (
                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-semibold text-blue-900 font-inter">
                    Tipo de Imóvel
                  </label>
                  <select
                    name="tipoImovel"
                    value={formulario.tipoImovel}
                    onChange={handleChange}
                    className={CLASSES.select}
                    required
                  >
                    <option value="">🏘️ Selecione o tipo de imóvel</option>
                    {(opcoesTipoImovel[
                      `${formulario.tipoNegocio}-${formulario.setorNegocio}`
                    ] || []).map((opcao) => (
                      <option key={opcao} value={opcao}>
                        {opcao}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Etapa 2: Localização */}
          {etapaAtual === 2 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2 font-poppins">
                <FiMapPin size={20} />
                Localização do Imóvel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-900 font-inter">
                    Cidade
                  </label>
                  <input
                    name="cidade"
                    type="text"
                    placeholder="Digite a cidade..."
                    value={formulario.cidade}
                    onChange={handleChange}
                    className={CLASSES.input}
                    required
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-900 font-inter">
                    Bairro
                  </label>
                  <input
                    name="bairro"
                    type="text"
                    placeholder="Digite o bairro..."
                    value={formulario.bairro}
                    onChange={handleChange}
                    className={CLASSES.input}
                    required
                    autoComplete="off"
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-semibold text-green-900 font-inter">
                  Endereço Completo
                </label>
                <input
                  name="enderecoDetalhado"
                  placeholder="Rua, número, complemento..."
                  value={formulario.enderecoDetalhado}
                  onChange={handleChange}
                  className={CLASSES.input}
                  required
                />
              </div>
            </div>
          )}

          {/* Etapa 3: Detalhes & Valor */}
          {etapaAtual === 3 && (
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2 font-poppins">
                <FiDollarSign size={20} />
                Detalhes Comerciais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-900 font-inter">
                    Valor do Imóvel
                  </label>
                  <input
                    name="valor"
                    placeholder="R$ 0,00"
                    value={formulario.valor}
                    onChange={handleChange}
                    className={CLASSES.input}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-900 font-inter">
                    Metragem
                  </label>
                  <input
                    name="metragem"
                    placeholder="0 m²"
                    value={formulario.metragem}
                    onChange={handleChange}
                    className={CLASSES.input}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-semibold text-purple-900 font-inter">
                  Descrição do Imóvel
                </label>
                <textarea
                  name="descricao"
                  placeholder="Descreva as principais características do imóvel..."
                  value={formulario.descricao}
                  onChange={handleChange}
                  className={CLASSES.textarea}
                  rows={4}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-900 font-inter">
                    Código do Imóvel
                  </label>
                  <input
                    name="codigoImovel"
                    placeholder="Digite o código do imóvel"
                    value={formulario.codigoImovel || ""}
                    onChange={handleChange}
                    className={CLASSES.input}
                    autoComplete="off"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-900 font-inter">
                    WhatsApp para Contato
                  </label>
                  <input
                    name="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={formulario.whatsapp}
                    onChange={handleChange}
                    className={CLASSES.input}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-900 font-inter">
                    Patrocinador (Opcional)
                  </label>
                  <select
                    name="patrocinador"
                    value={formulario.patrocinador || ''}
                    onChange={handleChange}
                    className={CLASSES.select}
                  >
                    <option value="">🏢 Selecionar patrocinador</option>
                    {(patrocinadores as Patrocinador[]).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-900 font-inter">
                    CRECI
                  </label>
                  <input
                    name="creci"
                    placeholder="Digite o CRECI"
                    value={formulario.creci || ""}
                    onChange={handleChange}
                    className={CLASSES.input}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Etapa 4: Imagens */}
          {etapaAtual === 4 && (
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2 font-poppins">
                <FiUpload size={20} />
                Galeria de Imagens
                {modoEdicao && (
                  <span className="text-sm bg-orange-200 text-orange-800 px-2 py-1 rounded-full">
                    {imagensExistentes.length} existente(s) + {imagensNovas.length} nova(s)
                  </span>
                )}
              </h3>
              <UploadImages
                previews={previews}
                onDrop={handleDrop}
                onFileChange={handleFileChange}
                onRemove={removeImagem}
                onReorder={() => {}} // Simplificado para esta versão
                fileInputRef={fileInputRef}
                required={previews.length === 0}
                imagensExistentes={imagensExistentes}
                triggerFileInput={() => fileInputRef.current?.click()}
              />
            </div>
          )}

          {/* Etapa 5: Características */}
          {etapaAtual === 5 && formulario.tipoNegocio && (
            <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-200">
              <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2 font-poppins">
                <FiEdit3 size={20} />
                Características Específicas
              </h3>
              <ItensImovel
                itensDisponiveis={itensDisponiveis}
                itens={itens}
                setItens={setItens}
                ITENS_QUANTITATIVOS={ITENS_QUANTITATIVOS}
              />
            </div>
          )}

          {/* Navegação e Ações - MAIS COMPACTA */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-blue-100">
            <div className="flex gap-2">
              {etapaAtual > 1 && (
                <button
                  type="button"
                  onClick={() => setEtapaAtual(etapaAtual - 1)}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  ← Anterior
                </button>
              )}
              {etapaAtual < ETAPAS.length && etapaValida(etapaAtual) && (
                <button
                  type="button"
                  onClick={() => setEtapaAtual(etapaAtual + 1)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
                >
                  Próximo →
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={carregando || !ETAPAS.every((_, i) => etapaValida(i + 1))}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
            >
              {carregando ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>{modoEdicao ? "Atualizando..." : "Salvando..."}</span>
                </>
              ) : (
                <>
                  <FiSave size={16} />
                  <span>{modoEdicao ? "💾 Atualizar" : "🏠 Salvar"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </>
  );
}