"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { FiHome, FiSave, FiUpload, FiMapPin, FiDollarSign, FiEdit3 } from "react-icons/fi";
import UploadImages from "./formulario/UploadImages";
import SelectCidadeBairro from "./formulario/SelectCidadeBairro";
import ItensImovel from "./formulario/ItensImovel";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";
import { formatarParaMoeda, formatarMetragem, formatarTelefone } from "@/utils/formatters";
import { validarImagens } from "@/utils/validators";
import type { FormularioImovelProps } from "@/types/formularios";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createBrowserClient(supabaseUrl, supabaseKey);

export default function FormularioImovel({
  patrocinadores,
  cidadesComBairros,
  opcoesTipoImovel,
  onSuccess,
  dadosIniciais,
}: FormularioImovelProps) {
  const router = useRouter();
  const [previews, setPreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [carregando, setCarregando] = useState(false);
  const [etapaAtual, setEtapaAtual] = useState(1);

  const [formulario, setFormulario] = useState({
    cidade: dadosIniciais?.cidade || "",
    bairro: dadosIniciais?.bairro || "",
    enderecoDetalhado: dadosIniciais?.enderecoDetalhado || "",
    valor: dadosIniciais?.valor || "",
    metragem: dadosIniciais?.metragem || "",
    descricao: dadosIniciais?.descricao || "",
    tipoImovel: dadosIniciais?.tipoImovel || "",
    setorNegocio: dadosIniciais?.setorNegocio || "",
    tipoNegocio: dadosIniciais?.tipoNegocio || "",
    whatsapp: dadosIniciais?.whatsapp || "",
    patrocinador: dadosIniciais?.patrocinador || "",
    imagens: [] as File[],
  });

  const setorSelecionado = formulario.tipoNegocio;
  const itensDisponiveis = setorSelecionado ? ITENS_POR_SETOR[setorSelecionado] : [];
  const [itens, setItens] = useState<Record<string, number>>(
    () =>
      dadosIniciais?.itens
        ? { ...dadosIniciais.itens }
        : Object.fromEntries(
            Object.values(ITENS_POR_SETOR)
              .flat()
              .map((item) => [item.chave, 0])
          )
  );

  const inputClass =
    "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500";
  const selectClass =
    "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 cursor-pointer";
  const textareaClass =
    "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name === "valor")
      setFormulario({ ...formulario, valor: formatarParaMoeda(value) });
    else if (name === "metragem")
      setFormulario({ ...formulario, metragem: formatarMetragem(value) });
    else if (name === "whatsapp")
      setFormulario({ ...formulario, whatsapp: formatarTelefone(value) });
    else setFormulario({ ...formulario, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      const filesArray = Array.from(e.target.files);
      setFormulario({ ...formulario, imagens: filesArray });
      setPreviews(filesArray.map((file) => URL.createObjectURL(file)));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) {
      const filesArray = Array.from(e.dataTransfer.files);
      setFormulario({ ...formulario, imagens: filesArray });
      setPreviews(filesArray.map((file) => URL.createObjectURL(file)));
    }
  };

  const removeImagem = (index: number) => {
    setFormulario((f) => ({
      ...f,
      imagens: f.imagens.filter((_, i) => i !== index),
    }));
    setPreviews((p) => p.filter((_, i) => i !== index));
  };

  const handleReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setPreviews((prev) => {
      const arr = [...prev];
      const [removed] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, removed);
      return arr;
    });
    setFormulario((prev) => {
      const arr = [...prev.imagens];
      const [removed] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, removed);
      return { ...prev, imagens: arr };
    });
  };

  const limparFormulario = () => {
    setFormulario({
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
      imagens: [],
    });
    setPreviews([]);
    setItens(
      Object.fromEntries(
        Object.values(ITENS_POR_SETOR)
          .flat()
          .map((item) => [item.chave, 0])
      )
    );
    setEtapaAtual(1);
  };

  // Upload de imagens para o Supabase Storage
  const uploadImagensSupabase = async (imagens: File[], imovelId: string) => {
    const urls: string[] = [];
    for (const imagem of imagens) {
      if (!imagem.type.startsWith("image/")) continue;
      if (imagem.size > 5 * 1024 * 1024)
        throw new Error(`A imagem ${imagem.name} excede o limite de 5MB`);
      const filePath = `imoveis/${imovelId}/${Date.now()}_${imagem.name}`;
      const { error: uploadError } = await supabase.storage
        .from("imagens")
        .upload(filePath, imagem);
      if (uploadError) throw new Error(uploadError.message);
      const { data: urlData } = supabase.storage.from("imagens").getPublicUrl(filePath);
      urls.push(urlData.publicUrl);
    }
    return urls;
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    try {
      if (!validarImagens(formulario.imagens, dadosIniciais?.imagens)) {
        throw new Error("Por favor, adicione pelo menos uma imagem");
      }
      const { data, error } = await supabase
        .from("imoveis")
        .insert([
          {
            cidade: formulario.cidade,
            bairro: formulario.bairro,
            enderecoDetalhado: formulario.enderecoDetalhado,
            valor: Number(formulario.valor.replace(/\D/g, "")) / 100,
            metragem: Number(formulario.metragem.replace(/\D/g, "")),
            descricao: formulario.descricao,
            tipoImovel: formulario.tipoImovel,
            tipoNegocio: formulario.tipoNegocio,
            setorNegocio: formulario.setorNegocio,
            whatsapp: formulario.whatsapp.replace(/\D/g, ""),
            patrocinador: formulario.patrocinador || null,
            imagens: [],
            dataCadastro: new Date().toISOString(),
            itens: Object.fromEntries(
              (itensDisponiveis || []).map((item) => [
                item.chave,
                itens[item.chave] || 0,
              ])
            ),
          },
        ])
        .select()
        .single();

      if (error || !data?.id)
        throw new Error(error?.message || "Erro ao criar imóvel.");

      // Upload das imagens para o Supabase Storage
      const urlsImagens = await uploadImagensSupabase(formulario.imagens, data.id);
      await supabase
        .from("imoveis")
        .update({ imagens: urlsImagens })
        .eq("id", data.id);

      limparFormulario();
      if (typeof onSuccess === "function") onSuccess();
      router.refresh();
      alert("Imóvel cadastrado com sucesso!");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Erro ao cadastrar imóvel."
      );
    } finally {
      setCarregando(false);
    }
  };

  // Etapas do formulário
  const etapas = [
    { numero: 1, titulo: "Tipo & Categoria", icone: FiHome },
    { numero: 2, titulo: "Localização", icone: FiMapPin },
    { numero: 3, titulo: "Detalhes & Valor", icone: FiDollarSign },
    { numero: 4, titulo: "Imagens", icone: FiUpload },
    { numero: 5, titulo: "Características", icone: FiEdit3 },
  ];

  const etapaValida = (etapa: number): boolean => {
    switch (etapa) {
      case 1: return !!(formulario.tipoNegocio && formulario.setorNegocio && formulario.tipoImovel);
      case 2: return !!(formulario.cidade && formulario.bairro && formulario.enderecoDetalhado);
      case 3: return !!(formulario.valor && formulario.metragem && formulario.descricao && formulario.whatsapp);
      case 4: return formulario.imagens.length > 0 || (dadosIniciais?.imagens?.length || 0) > 0;
      default: return true;
    }
  };

  return (
    <section className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-blue-100">
      {/* Header da Seção */}
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-blue-100 rounded-2xl">
          <FiHome className="text-blue-600" size={24} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
            🏠 {dadosIniciais ? "Editar Imóvel" : "Cadastrar Novo Imóvel"}
          </h1>
          <p className="text-blue-600 text-sm">
            {dadosIniciais ? "Atualize as informações do imóvel" : "Preencha os dados para cadastrar um novo imóvel"}
          </p>
        </div>
      </div>

      {/* Indicador de Progresso */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {etapas.map((etapa, index) => {
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
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold transition-all duration-200 mb-2 ${
                    isAtual
                      ? "bg-blue-600 text-white shadow-lg scale-110"
                      : isConcluida
                      ? "bg-green-500 text-white"
                      : isAcessivel
                      ? "bg-blue-100 text-blue-600 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isConcluida && !isAtual ? (
                    "✓"
                  ) : (
                    <Icone size={20} />
                  )}
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

        {/* Barra de Progresso */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${(Object.values(etapas).filter((_, i) => etapaValida(i + 1)).length / etapas.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Formulário */}
      <form onSubmit={enviarFormulario} className="space-y-8">
        
        {/* Etapa 1: Tipo & Categoria */}
        {etapaAtual === 1 && (
          <div className="space-y-6 animate-slide-in">
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
                    className={selectClass}
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
                      className={selectClass}
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
                    className={selectClass}
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
          <div className="space-y-6 animate-slide-in">
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
                selectClass={selectClass}
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
                  className={inputClass}
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
          <div className="space-y-6 animate-slide-in">
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
                    className={inputClass}
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
                    className={inputClass}
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
                  className={inputClass}
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
                  className={textareaClass}
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
                    className={selectClass}
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
          <div className="space-y-6 animate-slide-in">
            <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
              <h3 className="text-lg font-semibold text-orange-900 mb-4 flex items-center gap-2">
                <FiUpload size={20} />
                Galeria de Imagens
              </h3>
              
              <UploadImages
                previews={previews}
                onDrop={handleDrop}
                onFileChange={handleFileChange}
                onRemove={removeImagem}
                onReorder={handleReorder}
                fileInputRef={fileInputRef}
                required={
                  !dadosIniciais?.imagens?.length && formulario.imagens.length === 0
                }
                imagensExistentes={dadosIniciais?.imagens || []}
                triggerFileInput={() => fileInputRef.current?.click()}
              />
              
              <div className="mt-4 bg-orange-100 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-orange-900 mb-2">
                  📸 Dicas para Melhores Fotos:
                </h4>
                <div className="text-xs text-orange-700 space-y-1">
                  <p>• Use boa iluminação natural quando possível</p>
                  <p>• Tire fotos de diferentes ângulos e cômodos</p>
                  <p>• A primeira imagem será a capa do anúncio</p>
                  <p>• Máximo 5MB por imagem</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Etapa 5: Características */}
        {etapaAtual === 5 && setorSelecionado && (
          <div className="space-y-6 animate-slide-in">
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
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                ← Anterior
              </button>
            )}
            
            {etapaAtual < etapas.length && etapaValida(etapaAtual) && (
              <button
                type="button"
                onClick={() => setEtapaAtual(etapaAtual + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
              >
                Próximo →
              </button>
            )}
          </div>

          <div className="flex gap-3">
            {/* Botão Salvar */}
            <button 
              type="submit" 
              disabled={carregando || !Object.values(etapas).every((_, i) => etapaValida(i + 1))}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100"
            >
              {carregando ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <FiSave size={18} />
                  <span>Salvar Imóvel</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* CSS para animações */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </section>
  );
}