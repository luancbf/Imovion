"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { FiHome, FiSave, FiUpload, FiMapPin, FiDollarSign, FiEdit3, FiX } from "react-icons/fi";
import UploadImages from "./formulario/UploadImages";
import SelectCidadeBairro from "./formulario/SelectCidadeBairro";
import ItensImovel from "./formulario/ItensImovel";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";
import { formatarParaMoeda, formatarMetragem, formatarTelefone } from "@/utils/formatters";
import type { FormularioImovelProps, ImovelEdicao } from "@/types/formularios";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ✅ Constantes extraídas
const FORMULARIO_INICIAL = {
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
};

const ETAPAS = [
  { numero: 1, titulo: "Tipo & Categoria", icone: FiHome },
  { numero: 2, titulo: "Localização", icone: FiMapPin },
  { numero: 3, titulo: "Detalhes & Valor", icone: FiDollarSign },
  { numero: 4, titulo: "Imagens", icone: FiUpload },
  { numero: 5, titulo: "Características", icone: FiEdit3 },
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

  const formatarValor = useCallback((valor: unknown): string => {
    if (typeof valor === 'number' && !isNaN(valor)) return formatarParaMoeda(valor.toString());
    if (typeof valor === 'string' && valor.trim().length > 0) return valor;
    return "";
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
      cidade: getDadoInicial('cidade', dadosIniciais),
      bairro: getDadoInicial('bairro', dadosIniciais),
      enderecoDetalhado: getDadoInicial('enderecoDetalhado', dadosIniciais) || getDadoInicial('enderecodetalhado', dadosIniciais),
      valor: formatarValor(dadosIniciais.valor),
      metragem: formatarMetragemValor(dadosIniciais.metragem),
      descricao: getDadoInicial('descricao', dadosIniciais),
      tipoImovel: getDadoInicial('tipoImovel', dadosIniciais) || getDadoInicial('tipoimovel', dadosIniciais),
      setorNegocio: getDadoInicial('setorNegocio', dadosIniciais) || getDadoInicial('setornegocio', dadosIniciais),
      tipoNegocio: getDadoInicial('tipoNegocio', dadosIniciais) || getDadoInicial('tiponegocio', dadosIniciais),
      whatsapp: getDadoInicial('whatsapp', dadosIniciais),
      patrocinador: getDadoInicial('patrocinador', dadosIniciais) || getDadoInicial('patrocinadorid', dadosIniciais),
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
  }, [dadosIniciais, limparFormulario, inicializarItens, getDadoInicial, formatarValor, formatarMetragemValor]);

  useEffect(() => {
    if (formulario.patrocinador) {
      const patrocinadorSelecionado = patrocinadores.find(
        (p) => p.id === formulario.patrocinador
      );
      let telefonePatrocinador = "";
      if (patrocinadorSelecionado) {
        if (typeof patrocinadorSelecionado.telefone === "string" && patrocinadorSelecionado.telefone.trim().length > 0) {
          telefonePatrocinador = patrocinadorSelecionado.telefone;
        }
        // Se quiser usar outros campos, adicione aqui (whatsapp, celular)
      }
      // Atualiza o campo whatsapp se estiver vazio ou diferente do telefone do patrocinador selecionado
      if (
        telefonePatrocinador &&
        (formulario.whatsapp === "" || formulario.whatsapp !== telefonePatrocinador)
      ) {
        setFormulario(prev => ({
          ...prev,
          whatsapp: telefonePatrocinador
        }));
      }
    }
  }, [formulario.patrocinador, formulario.whatsapp, patrocinadores]);

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

  const uploadImagensSupabase = useCallback(async (imagens: File[], imovelId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const imagem of imagens) {
      if (!imagem.type.startsWith("image/")) continue;
      if (imagem.size > 5 * 1024 * 1024) throw new Error(`A imagem ${imagem.name} excede o limite de 5MB`);
      const filePath = `imoveis/${imovelId}/${Date.now()}_${imagem.name}`;
      const { error } = await supabase.storage.from("imagens").upload(filePath, imagem);
      if (error) throw new Error(error.message);
      const { data } = supabase.storage.from("imagens").getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  }, []);

  const etapaValida = useCallback((etapa: number): boolean => {
    const validacoes: Record<number, () => boolean> = {
      1: () => !!(formulario.tipoNegocio && formulario.setorNegocio && formulario.tipoImovel),
      2: () => !!(formulario.cidade && formulario.bairro && formulario.enderecoDetalhado),
      3: () => !!(formulario.valor && formulario.metragem && formulario.descricao && formulario.whatsapp),
      4: () => (imagensExistentes.length + imagensNovas.length) > 0,
    };
    return validacoes[etapa]?.() ?? true;
  }, [formulario, imagensExistentes.length, imagensNovas.length]);

  const enviarFormulario = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      const totalImagens = imagensExistentes.length + imagensNovas.length;
      if (totalImagens === 0) throw new Error("Por favor, adicione pelo menos uma imagem");
      const dadosImovel = {
        cidade: formulario.cidade,
        bairro: formulario.bairro,
        enderecodetalhado: formulario.enderecoDetalhado,
        valor: Number(formulario.valor.replace(/\D/g, "")) / 100,
        metragem: Number(formulario.metragem.replace(/\D/g, "")),
        descricao: formulario.descricao,
        tipoimovel: formulario.tipoImovel,
        tiponegocio: formulario.tipoNegocio,
        setornegocio: formulario.setorNegocio,
        whatsapp: formulario.whatsapp.replace(/\D/g, ""),
        patrocinadorid: formulario.patrocinador || null,
        itens: Object.fromEntries(
          itensDisponiveis.map(item => [item.chave, itens[item.chave] || 0])
        ),
      };
      if (modoEdicao && dadosIniciais?.id) {
        let urlsFinais = [...imagensExistentes];
        if (imagensNovas.length > 0) {
          const novasUrls = await uploadImagensSupabase(imagensNovas, dadosIniciais.id);
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
          const urlsImagens = await uploadImagensSupabase(imagensNovas, data.id);
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
    modoEdicao, dadosIniciais, uploadImagensSupabase, limparFormulario,
    onSuccess, onLimpar, router
  ]);

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-2xl">
            <FiHome className="text-blue-600" size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
              {modoEdicao ? "✏️ Editando Imóvel" : "🏠 Cadastrar Novo Imóvel"}
            </h1>
            <p className="text-blue-600 text-sm">
              {modoEdicao
                ? `Atualizando ${formulario.tipoImovel || 'imóvel'} em ${formulario.cidade}`
                : "Preencha os dados para cadastrar um novo imóvel"
              }
            </p>
          </div>
        </div>
        {modoEdicao && (
          <button
            type="button"
            onClick={cancelarEdicao}
            className="flex items-center gap-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-xl font-semibold transition-colors"
          >
            <FiX size={18} />
            <span className="hidden sm:inline">Cancelar</span>
          </button>
        )}
      </div>

      {/* Indicador de Progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {ETAPAS.map((etapa, index) => {
            const Icone = etapa.icone;
            const isAtual = etapaAtual === etapa.numero;
            const isConcluida = etapaValida(etapa.numero);
            const isAcessivel = index === 0 || etapaValida(etapa.numero - 1);
            return (
              <div key={etapa.numero} className="flex flex-col items-center flex-1">
                <button
                  type="button"
                  onClick={() => isAcessivel && setEtapaAtual(etapa.numero)}
                  disabled={!isAcessivel}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 mb-2 cursor-pointer ${
                    isAtual
                      ? "bg-blue-600 text-white shadow-lg scale-110"
                      : isConcluida
                      ? "bg-green-500 text-white"
                      : isAcessivel
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isConcluida && !isAtual ? "✓" : <Icone size={20} />}
                </button>
                <span className={`text-xs font-medium text-center ${
                  isAtual ? "text-blue-600" : isConcluida ? "text-green-600" : "text-gray-500"
                }`}>
                  {etapa.titulo}
                </span>
              </div>
            );
          })}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(ETAPAS.filter((_, i) => etapaValida(i + 1)).length / ETAPAS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={enviarFormulario} className="space-y-8">
        {/* Etapa 1: Tipo & Categoria */}
        {etapaAtual === 1 && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <FiHome size={20} />
                Classificação do Imóvel
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-blue-900">
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
                    <label className="block text-sm font-semibold text-blue-900">
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
                  <label className="block text-sm font-semibold text-blue-900">
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
              <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
                <FiMapPin size={20} />
                Localização do Imóvel
              </h3>
              <SelectCidadeBairro
                cidadesComBairros={cidadesComBairros}
                cidade={formulario.cidade}
                bairro={formulario.bairro}
                onChange={handleChange}
                selectClass={CLASSES.select}
              />
              <div className="mt-6 space-y-2">
                <label className="block text-sm font-semibold text-green-900">
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
              <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <FiDollarSign size={20} />
                Detalhes Comerciais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-purple-900">
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
                  <label className="block text-sm font-semibold text-purple-900">
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
                <label className="block text-sm font-semibold text-purple-900">
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
                <label className="block text-sm font-semibold text-purple-900">
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
                <p className="text-xs text-purple-600">
                  💡 Uma boa descrição atrai mais interessados
                </p>
              </div>
              {/* Patrocinador */}
              {patrocinadores.length > 0 && (
                <div className="mt-6 space-y-2">
                  <label className="block text-sm font-semibold text-purple-900">
                    Patrocinador (Opcional)
                  </label>
                  <select
                    name="patrocinador"
                    value={formulario.patrocinador}
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
              )}
            </div>
          </div>
        )}

        {/* Etapa 4: Imagens */}
        {etapaAtual === 4 && (
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
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
              <h3 className="text-lg font-semibold text-indigo-900 mb-4 flex items-center gap-2">
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