"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { FiHome, FiSave, FiUpload, FiMapPin, FiDollarSign, FiEdit3, FiX } from "react-icons/fi";
import UploadImages from "./formulario/UploadImages";
import ItensImovel from "./formulario/ItensImovel";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";
import { formatarParaMoeda, formatarMetragem, formatarTelefone } from "@/utils/formatters";
import type { FormularioImovelProps, ImovelEdicao } from "@/types/formularios";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const FORMULARIO_INICIAL = {
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
  { numero: 1, icone: FiHome },
  { numero: 2, icone: FiMapPin },
  { numero: 3, icone: FiDollarSign },
  { numero: 4, icone: FiUpload },
  { numero: 5, icone: FiEdit3 },
];

const CLASSES = {
  input: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500",
  select: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 cursor-pointer",
  textarea: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none",
};

export default function FormularioImovel({
  patrocinadores,
  cidadesComBairros,
  opcoesTipoImovel,
  onSuccess,
  dadosIniciais,
  onLimpar,
}: FormularioImovelProps) {
  const router = useRouter();

  const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);
  const [itens, setItens] = useState<Record<string, number>>({});
  const [previews, setPreviews] = useState<string[]>([]);
  const [imagensNovas, setImagensNovas] = useState<File[]>([]);
  const [imagensExistentes, setImagensExistentes] = useState<string[]>([]);
  const [etapaAtual, setEtapaAtual] = useState(1);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [carregando, setCarregando] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const itensDisponiveis = useMemo(() => {
    const setorSelecionado = formulario.tipoNegocio;
    return setorSelecionado && ITENS_POR_SETOR[setorSelecionado]
      ? ITENS_POR_SETOR[setorSelecionado]
      : [];
  }, [formulario.tipoNegocio]);

  const inicializarItens = useCallback((): Record<string, number> => {
    const todosItens = Object.values(ITENS_POR_SETOR)
      .flat()
      .filter(Boolean);
    return Object.fromEntries(todosItens.map((item) => [item.chave, 0]));
  }, []);

  const getDadoInicial = useCallback((prop: string, dados: ImovelEdicao | null | undefined): string => {
    if (!dados) return "";
    const dadosTyped = dados as Record<string, unknown>;
    const valor = dadosTyped[prop] ?? dadosTyped[prop.replace(/([A-Z])/g, '_$1').toLowerCase()];
    return typeof valor === 'string' ? valor :
      typeof valor === 'number' ? valor.toString() : "";
  }, []);

  const formatarMetragemValor = useCallback((metragem: unknown): string => {
    if (typeof metragem === 'number' && !isNaN(metragem)) return formatarMetragem(metragem.toString());
    if (typeof metragem === 'string' && metragem.trim().length > 0) return metragem;
    return "";
  }, []);

  const limparFormulario = useCallback(() => {
    setFormulario(FORMULARIO_INICIAL);
    setPreviews([]);
    setImagensNovas([]);
    setImagensExistentes([]);
    setItens(inicializarItens());
    setEtapaAtual(1);
    setModoEdicao(false);
  }, [inicializarItens]);

  useEffect(() => {

    if (!dadosIniciais?.id) {
      limparFormulario();
      return;
    }
    setModoEdicao(true);
    setFormulario({
      codigoImovel: getDadoInicial('codigoImovel', dadosIniciais) || "",
      cidade: getDadoInicial('cidade', dadosIniciais),
      bairro: getDadoInicial('bairro', dadosIniciais),
      enderecoDetalhado: getDadoInicial('enderecoDetalhado', dadosIniciais) || getDadoInicial('enderecodetalhado', dadosIniciais),
      valor: typeof dadosIniciais.valor === "number"
    ? formatarParaMoeda(dadosIniciais.valor.toString())
    : formatarParaMoeda(String(dadosIniciais.valor || "")),
      metragem: formatarMetragemValor(dadosIniciais.metragem),
      descricao: getDadoInicial('descricao', dadosIniciais),
      tipoImovel: dadosIniciais.tipoImovel || "",    
      setorNegocio: dadosIniciais.setorNegocio || "",
      tipoNegocio: dadosIniciais.tipoNegocio || "",
      whatsapp: getDadoInicial('whatsapp', dadosIniciais),
      patrocinador: getDadoInicial('patrocinadorid', dadosIniciais) || getDadoInicial('patrocinador', dadosIniciais) || "",
      creci: getDadoInicial('creci', dadosIniciais) || "",
    });
    if (dadosIniciais.itens) {
      try {
        const itensObj = typeof dadosIniciais.itens === 'string'
          ? JSON.parse(dadosIniciais.itens)
          : dadosIniciais.itens;
        const itensNumericos = Object.fromEntries(
          Object.entries(itensObj).map(([k, v]) => [k, Number(v) || 0])
        );
        setItens(itensNumericos);
      } catch {
        setItens(inicializarItens());
      }
    }
    if (Array.isArray(dadosIniciais.imagens)) {
      const imagensValidas = dadosIniciais.imagens.filter(
        (img): img is string => typeof img === 'string' && img.trim().length > 0
      );
      setImagensExistentes([...imagensValidas]);
      setPreviews([...imagensValidas]);
    }
    setEtapaAtual(1);
  }, [dadosIniciais, limparFormulario, inicializarItens, getDadoInicial, formatarMetragemValor]);

  useEffect(() => {
    if (formulario.patrocinador) {
      const patrocinadorSelecionado = patrocinadores.find(
        (p) => p.id === formulario.patrocinador
      );
      let telefonePatrocinador = "";
      let creciPatrocinador = "";
      if (patrocinadorSelecionado) {
        if (typeof patrocinadorSelecionado.telefone === "string" && patrocinadorSelecionado.telefone.trim().length > 0) {
          telefonePatrocinador = patrocinadorSelecionado.telefone;
        }
        if (typeof patrocinadorSelecionado.creci === "string" && patrocinadorSelecionado.creci.trim().length > 0) {
          creciPatrocinador = patrocinadorSelecionado.creci;
        }
      }
      setFormulario(prev => ({
        ...prev,
        whatsapp: telefonePatrocinador ? telefonePatrocinador : prev.whatsapp,
        creci: creciPatrocinador,
      }));
    }
  }, [formulario.patrocinador, patrocinadores]);

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

  const handleReorder = useCallback((fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setPreviews(prev => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, removed);
      return arr;
    });
    const totalExistentes = imagensExistentes.length;
    if (fromIndex < totalExistentes || toIndex < totalExistentes) {
      setImagensExistentes(prev => {
        const arr = [...prev];
        if (fromIndex < totalExistentes && toIndex < totalExistentes) {
          const [removed] = arr.splice(fromIndex, 1);
          arr.splice(toIndex, 0, removed);
        }
        return arr;
      });
    }
  }, [imagensExistentes.length]);

  const cancelarEdicao = useCallback(() => {
    limparFormulario();
    onLimpar?.();
  }, [limparFormulario, onLimpar]);

  const uploadImagensSharp = async (imagens: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const imagem of imagens) {
      const formData = new FormData();
      formData.append("imagem", imagem);
      const res = await fetch("/api/upload-imagem", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) urls.push(data.url);
      else throw new Error(data.error || "Erro ao enviar imagem");
    }
    return urls;
  };

  const etapaValida = useCallback((etapa: number): boolean => {
    const validacoes: Record<number, () => boolean> = {
      1: () => !!(formulario.tipoNegocio && formulario.setorNegocio && formulario.tipoImovel),
      2: () => !!(formulario.cidade && formulario.bairro && formulario.enderecoDetalhado),
      3: () => !!(formulario.valor && formulario.metragem && formulario.descricao && formulario.whatsapp),
      4: () => (imagensExistentes.length + imagensNovas.length) > 0,
    };
    return validacoes[etapa]?.() ?? true;
  }, [formulario, imagensExistentes.length, imagensNovas.length]);

  const parseValor = (valorStr: string): number => {
  // Remove prefixo R$ e espaços
  let limpo = valorStr.replace(/^R\$\s*/, "");
  // Remove pontos de milhares
  limpo = limpo.replace(/\./g, "");
  // Troca vírgula por ponto
  limpo = limpo.replace(",", ".");
  // Converte para float
  return parseFloat(limpo) || 0;
};

  const enviarFormulario = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const totalImagens = imagensExistentes.length + imagensNovas.length;
      if (totalImagens === 0) throw new Error("Por favor, adicione pelo menos uma imagem");
      const capitalizar = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

      const dadosImovel = {
        codigoImovel: formulario.codigoImovel?.trim() || "",
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
        let urlsFinais = [...imagensExistentes];
        if (imagensNovas.length > 0) {
          const novasUrls = await uploadImagensSharp(imagensNovas);
          urlsFinais = [...urlsFinais, ...novasUrls];
        }
        const dadosUpdate = {
          ...dadosImovel,
          imagens: urlsFinais,
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from("imoveis")
          .update(dadosUpdate)
          .eq("id", dadosIniciais.id);
        if (error) throw new Error(`Erro ao atualizar: ${error.message}`);
        alert("✅ Imóvel atualizado com sucesso!");

        // URLs antes da edição
        const imagensAntigas = Array.isArray(dadosIniciais.imagens) ? dadosIniciais.imagens : [];
        // URLs após edição
        const imagensAtuais = urlsFinais;

        // Imagens removidas
        const imagensRemovidas = imagensAntigas.filter(url => !imagensAtuais.includes(url));

        // Exclui do storage
        for (const url of imagensRemovidas) {
          // Extrai o caminho relativo do arquivo no storage
          const path = url.split('/storage/v1/object/public/imagens/')[1];
          if (path) {
            await supabase.storage.from('imagens').remove([path]);
          }
        }
      } else {
        const dadosInsert = {
          ...dadosImovel,
          datacadastro: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ativo: true,
          imagens: [],
        };
        const { data, error } = await supabase
          .from("imoveis")
          .insert([dadosInsert])
          .select()
          .single();
        if (error || !data?.id) throw new Error(error?.message || "Erro ao criar imóvel.");
        if (imagensNovas.length > 0) {
          const urlsImagens = await uploadImagensSharp(imagensNovas);
          await supabase
            .from("imoveis")
            .update({
              imagens: urlsImagens,
              updated_at: new Date().toISOString()
            })
            .eq("id", data.id);
        }
        alert("✅ Imóvel cadastrado com sucesso!");
      }
      limparFormulario();
      onSuccess?.();
      onLimpar?.();
      router.refresh();
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : "Erro desconhecido ao processar imóvel.";
      alert(`❌ ${mensagemErro}`);
    } finally {
      setCarregando(false);
    }
  }, [
    formulario, imagensExistentes, imagensNovas, itensDisponiveis, itens,
    modoEdicao, dadosIniciais, limparFormulario,
    onSuccess, onLimpar, router
  ]);

  return (
    <section className="bg-white rounded-3xl shadow-xl p-4 sm:p-8 border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiHome className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="font-poppins text-xl sm:text-3xl font-bold text-blue-900">
              {modoEdicao ? "✏️ Editando Imóvel" : "🏠 Cadastrar Novo Imóvel"}
            </h1>
          </div>
        </div>
        {modoEdicao && (
          <button
            type="button"
            onClick={cancelarEdicao}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors font-inter"
          >
            <FiX size={18} />
            <span className="hidden sm:inline">Cancelar</span>
          </button>
        )}
      </div>

      {/* Indicador de Progresso */}
      <div className="mb-8">
        <div className="flex flex-row items-center justify-between mb-4 gap-1 overflow-x-auto">
          {ETAPAS.map((etapa, index) => {
            const Icone = etapa.icone;
            const isAtual = etapaAtual === etapa.numero;
            const isConcluida = etapaValida(etapa.numero) && etapaAtual > etapa.numero;
            const isAcessivel = index === 0 || ETAPAS.slice(0, index).every((_, i) => etapaValida(i + 1));
            // O último só é concluído se etapaAtual for maior que ele e todas anteriores válidas
            const isUltimo = index === ETAPAS.length - 1;
            const isFinalizado = isUltimo
              ? ETAPAS.every((_, i) => etapaValida(i + 1)) && etapaAtual > etapa.numero
              : isConcluida;

            return (
              <div key={etapa.numero} className="flex flex-col items-center flex-1 min-w-[70px]">
                <button
                  type="button"
                  onClick={() => isAcessivel && setEtapaAtual(etapa.numero)}
                  disabled={!isAcessivel}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 mb-2 cursor-pointer font-poppins
                    ${isAtual
                      ? "bg-blue-600 text-white"
                      : isFinalizado
                      ? "bg-green-500 text-white"
                      : isAcessivel
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                    }`}
                >
                  {isFinalizado && !isAtual ? "✓" : <Icone size={20} />}
                </button>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{
              width: `${(ETAPAS.filter((_, i) => etapaValida(i + 1) && etapaAtual > i + 1).length / ETAPAS.length) * 100}%`
            }}
          />
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={enviarFormulario} className="space-y-8">
        {/* Etapa 1: Tipo & Categoria */}
        {etapaAtual === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
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
          </div>
        )}

        {/* Etapa 2: Localização */}
        {etapaAtual === 2 && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2 font-poppins">
                <FiMapPin size={20} />
                Localização do Imóvel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-900 font-inter">
                    Cidade
                  </label>
                  <select
                    name="cidade"
                    value={formulario.cidade}
                    onChange={handleChange}
                    className={CLASSES.select}
                    required
                  >
                    <option value="">🏙️ Selecione a cidade</option>
                    {Object.keys(cidadesComBairros).map((cidade) => (
                      <option key={cidade} value={cidade}>
                        {cidade.replace(/_/g, ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-green-900 font-inter">
                    Bairro
                  </label>
                  <input
                    name="bairro"
                    placeholder="Digite o bairro"
                    value={formulario.bairro}
                    onChange={handleChange}
                    className={CLASSES.input}
                    required
                  />
                </div>
              </div>
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-semibold text-green-900 font-inter">
                  Endereço Completo
                </label>
                <input
                  name="enderecoDetalhado"
                  placeholder="Rua, número, complemento, ponto de referência..."
                  value={formulario.enderecoDetalhado}
                  onChange={handleChange}
                  className={CLASSES.input}
                  required
                />
                <p className="text-xs text-green-600">
                  💡 Inclua informações que ajudem a localizar o imóvel
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 3: Detalhes & Valor */}
        {etapaAtual === 3 && (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-200">
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
                  placeholder="Descreva as principais características, diferenciais e detalhes do imóvel..."
                  value={formulario.descricao}
                  onChange={handleChange}
                  className={CLASSES.textarea}
                  rows={4}
                  required
                />
              </div>
              {/* CÓDIGO DO IMÓVEL */}
              <div className="mt-6 space-y-2">
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
              {/* Patrocinador */}
              <div className="mt-6 space-y-2">
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
                  {patrocinadores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6 space-y-2">
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
              <div className="mt-6 space-y-2">
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
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
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
                onReorder={handleReorder}
                fileInputRef={fileInputRef}
                required={previews.length === 0}
                imagensExistentes={imagensExistentes}
                triggerFileInput={() => fileInputRef.current?.click()}
              />
            </div>
          </div>
        )}

        {/* Etapa 5: Características */}
        {etapaAtual === 5 && formulario.tipoNegocio && (
          <div className="space-y-6">
            <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-200">
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
          </div>
        )}

        {/* Navegação e Ações */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-8 border-t border-blue-100">
          <div className="flex gap-3">
            {etapaAtual > 1 && (
              <button
                type="button"
                onClick={() => setEtapaAtual(etapaAtual - 1)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                ← Anterior
              </button>
            )}
            {etapaAtual < ETAPAS.length && etapaValida(etapaAtual) && (
              <button
                type="button"
                onClick={() => setEtapaAtual(etapaAtual + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors cursor-pointer"
              >
                Próximo →
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={carregando || !ETAPAS.every((_, i) => etapaValida(i + 1))}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {carregando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>{modoEdicao ? "Atualizando..." : "Salvando..."}</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>{modoEdicao ? "💾 Atualizar Imóvel" : "🏠 Salvar Imóvel"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}