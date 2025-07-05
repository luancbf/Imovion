'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FiList, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaPlus, FaMinus } from "react-icons/fa";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";

// ✅ TIPOS DEFINIDOS
interface ItemImovel {
  chave: string;
  nome: string;
  icone: string;
}

interface SelectOption {
  label: string;
  value: string;
}

interface FiltroImovelProps {
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  setor: 'Residencial' | 'Comercial' | 'Rural';
  tipoNegocio: 'Aluguel' | 'Venda';
  onFiltroChange: (filtros: Record<string, string>) => void;
  filtrosIniciais?: Record<string, string>;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  icon?: string;
}

interface ItemComponentProps {
  item: ItemImovel;
}

// ✅ CONSTANTES CORRIGIDAS PARA BUSCA
const VALORES_FILTRO = {
  valor: [
    { label: "Até R$ 100.000", value: "0-100000" },
    { label: "Até R$ 200.000", value: "0-200000" },
    { label: "Até R$ 300.000", value: "0-300000" },
    { label: "Até R$ 500.000", value: "0-500000" },
    { label: "Até R$ 800.000", value: "0-800000" },
    { label: "Até R$ 1.000.000", value: "0-1000000" },
    { label: "Até R$ 2.000.000", value: "0-2000000" },
    { label: "Acima de R$ 2.000.000", value: "2000000-999999999" },
  ],
  metragem: [
    { label: "Até 50 m²", value: "0-50" },
    { label: "50 a 80 m²", value: "50-80" },
    { label: "80 a 100 m²", value: "80-100" },
    { label: "100 a 150 m²", value: "100-150" },
    { label: "150 a 200 m²", value: "150-200" },
    { label: "200 a 300 m²", value: "200-300" },
    { label: "300 a 500 m²", value: "300-500" },
    { label: "Acima de 500 m²", value: "500-999999" },
  ]
} as const;

export function FiltroImovel({
  cidadesComBairros,
  opcoesTipoImovel,
  setor,
  tipoNegocio,
  onFiltroChange,
  filtrosIniciais: filtrosExternos = {}
}: FiltroImovelProps) {
  
  // ✅ VALORES MEMOIZADOS COM TIPOS CORRETOS
  const itensDisponiveis = useMemo((): ItemImovel[] => 
    ITENS_POR_SETOR[setor] || [], 
    [setor]
  );

  const chaveOpcoes = useMemo((): string => 
    `${setor}-${tipoNegocio}`, 
    [setor, tipoNegocio]
  );
  
  const tiposDisponiveis = useMemo((): string[] => 
    opcoesTipoImovel[chaveOpcoes] || [], 
    [opcoesTipoImovel, chaveOpcoes]
  );

  const itensQuantitativos = useMemo((): ItemImovel[] =>
    itensDisponiveis.filter(item => ITENS_QUANTITATIVOS.includes(item.chave)),
    [itensDisponiveis]
  );

  const itensBooleanos = useMemo((): ItemImovel[] =>
    itensDisponiveis.filter(item => !ITENS_QUANTITATIVOS.includes(item.chave)),
    [itensDisponiveis]
  );

  // ✅ FILTROS INICIAIS PADRONIZADOS
  const filtrosIniciais = useMemo((): Record<string, string> => ({
    tipoImovel: "",
    cidade: "",
    bairro: "",
    valor: "",
    metragem: "",
    ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""])),
    ...filtrosExternos
  }), [itensDisponiveis, filtrosExternos]);

  // ✅ ESTADO
  const [filtros, setFiltros] = useState<Record<string, string>>(filtrosIniciais);
  const [mostrarItens, setMostrarItens] = useState<boolean>(false);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(true);
  const itensRef = useRef<HTMLDivElement>(null);

  // ✅ REF PARA TIMEOUT (evita dependência)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ✅ CALLBACK OTIMIZADO COM DEBOUNCE SEM DEPENDÊNCIA DE TIMEOUT
  const handleFiltroChange = useCallback((novosFiltros: Record<string, string>): void => {
    // ✅ Limpar timeout anterior usando ref
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // ✅ Criar novo timeout para debounce
    timeoutRef.current = setTimeout(() => {
      console.log('🔍 [FILTRO] Aplicando filtros:', novosFiltros);
      
      // ✅ PROCESSAR FILTROS PARA ENVIO CORRETO
      const filtrosProcessados = { ...novosFiltros };
      
      // ✅ Processar filtro de valor (extrair min e max)
      if (filtrosProcessados.valor && filtrosProcessados.valor.includes('-')) {
        const [min, max] = filtrosProcessados.valor.split('-');
        filtrosProcessados.valorMin = min;
        filtrosProcessados.valorMax = max;
        delete filtrosProcessados.valor; // Remove o campo original
      }
      
      // ✅ Processar filtro de metragem (extrair min e max)
      if (filtrosProcessados.metragem && filtrosProcessados.metragem.includes('-')) {
        const [min, max] = filtrosProcessados.metragem.split('-');
        filtrosProcessados.metragemMin = min;
        filtrosProcessados.metragemMax = max;
        delete filtrosProcessados.metragem; // Remove o campo original
      }
      
      console.log('📤 [FILTRO] Filtros processados enviados:', filtrosProcessados);
      onFiltroChange(filtrosProcessados);
    }, 300);
  }, [onFiltroChange]);

  // ✅ FUNÇÃO PARA NORMALIZAR VALORES
  const normalizarValor = useCallback((valor: string, tipo: string): string => {
    if (!valor || valor.trim() === "") return "";
    
    switch (tipo) {
      case "numero":
        const num = parseInt(valor.replace(/\D/g, ''));
        return isNaN(num) || num <= 0 ? "" : String(num);
      case "boolean":
        return valor === "1" || valor.toLowerCase() === "true" ? "1" : "";
      default:
        return valor.trim();
    }
  }, []);

  // ✅ HANDLER DE MUDANÇA OTIMIZADO E CORRIGIDO
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    let novoValor = value;
    
    if (type === "checkbox") {
      novoValor = (e.target as HTMLInputElement).checked ? "1" : "";
    } else if (type === "number") {
      novoValor = normalizarValor(value, "numero");
    }
    
    console.log('📝 [FILTRO] Mudança detectada:', { name, value: novoValor, tipo: type });
    
    const novosFiltros = { ...filtros, [name]: novoValor };
    
    // ✅ Lógica especial para cidade/bairro
    if (name === "cidade") {
      novosFiltros.bairro = "";
      console.log('🏘️ [FILTRO] Cidade alterada, limpando bairro');
    }
    
    // ✅ Log específico para valor e metragem
    if (name === "valor") {
      console.log('💰 [FILTRO] Valor selecionado:', novoValor);
      if (novoValor.includes('-')) {
        const [min, max] = novoValor.split('-');
        console.log('💰 [FILTRO] Range de valor:', { min, max });
      }
    }
    
    if (name === "metragem") {
      console.log('📐 [FILTRO] Metragem selecionada:', novoValor);
      if (novoValor.includes('-')) {
        const [min, max] = novoValor.split('-');
        console.log('📐 [FILTRO] Range de metragem:', { min, max });
      }
    }
    
    setFiltros(novosFiltros);
    handleFiltroChange(novosFiltros);
  }, [filtros, handleFiltroChange, normalizarValor]);

  // ✅ HANDLER PARA ITENS QUANTITATIVOS OTIMIZADO
  const handleItemQuantChange = useCallback((chave: string, valor: number): void => {
    const valorNormalizado = Math.max(0, valor);
    const valorString = valorNormalizado > 0 ? String(valorNormalizado) : "";
    
    console.log('🔢 [FILTRO] Item quantitativo alterado:', { chave, valor: valorNormalizado });
    
    const novosFiltros = { ...filtros, [chave]: valorString };
    setFiltros(novosFiltros);
    handleFiltroChange(novosFiltros);
  }, [filtros, handleFiltroChange]);

  // ✅ LIMPAR FILTROS OTIMIZADO
  const limparFiltros = useCallback((): void => {
    console.log('🧹 [FILTRO] Limpando todos os filtros');
    
    const filtrosLimpos = {
      tipoImovel: "",
      cidade: "",
      bairro: "",
      valor: "",
      metragem: "",
      ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""]))
    };
    
    setFiltros(filtrosLimpos);
    setMostrarItens(false);
    
    // ✅ Aplicar filtros limpos imediatamente (sem debounce)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onFiltroChange(filtrosLimpos);
  }, [itensDisponiveis, onFiltroChange]);

  const toggleMostrarItens = useCallback((): void => {
    setMostrarItens(prev => !prev);
  }, []);

  // ✅ EFFECTS OTIMIZADOS COM DEPENDÊNCIAS CORRETAS
  useEffect(() => {
    console.log('🔄 [FILTRO] Setor/Tipo mudou, resetando filtros');
    const novosFiltrosIniciais = {
      tipoImovel: "",
      cidade: "",
      bairro: "",
      valor: "",
      metragem: "",
      ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""]))
    };
    
    setFiltros(novosFiltrosIniciais);
    setMostrarItens(false);
    
    // ✅ Aplicar filtros iniciais imediatamente
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onFiltroChange(novosFiltrosIniciais);
  }, [setor, tipoNegocio, itensDisponiveis, onFiltroChange]);

  useEffect(() => {
    if (!mostrarItens) return;
    
    const el = itensRef.current;
    if (!el) return;
    
    const onScroll = (): void => {
      setShowScrollHint(el.scrollTop + el.clientHeight < el.scrollHeight - 16);
    };
    
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [mostrarItens]);

  // ✅ CLEANUP DO TIMEOUT USANDO REF
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // ✅ COMPONENTES AUXILIARES COM TIPOS CORRETOS
  const SelectField = ({ 
    label, 
    name, 
    value, 
    options, 
    placeholder = "Todos",
    disabled = false,
    icon 
  }: SelectFieldProps) => (
    <div className="flex flex-col">
      <label className="text-sm font-semibold text-gray-700 mb-2">
        {icon} {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className="p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-400 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const ItemQuantitativo = ({ item }: ItemComponentProps) => {
    const valorAtual = Number(filtros[item.chave] || 0);
    
    return (
      <div className="bg-white rounded-xl border-2 border-indigo-200 p-4 hover:border-indigo-300 transition-all duration-200 hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{item.icone}</span>
            <span className="font-medium text-indigo-900 text-sm">{item.nome}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => handleItemQuantChange(item.chave, valorAtual - 1)}
            className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={valorAtual <= 0}
          >
            <FaMinus size={12} />
          </button>
          
          <div className="bg-indigo-50 rounded-lg px-4 py-2 min-w-[60px] text-center">
            <span className="text-lg font-bold text-indigo-900">
              {valorAtual}
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => handleItemQuantChange(item.chave, valorAtual + 1)}
            className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            <FaPlus size={12} />
          </button>
        </div>
      </div>
    );
  };

  const ItemBooleano = ({ item }: ItemComponentProps) => {
    const isAtivo = Number(filtros[item.chave]) > 0;
    
    return (
      <button
        type="button"
        onClick={() => handleItemQuantChange(item.chave, isAtivo ? 0 : 1)}
        className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
          isAtivo
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md'
            : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
        }`}
      >
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-colors duration-200 ${
          isAtivo ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        
        <div className="flex flex-col items-center gap-2">
          <span className="text-2xl">{item.icone}</span>
          <span className={`text-xs font-medium text-center leading-tight ${
            isAtivo ? 'text-green-800' : 'text-gray-700'
          }`}>
            {item.nome}
          </span>
        </div>
        
        <div className={`mt-1 text-xs font-bold ${
          isAtivo ? 'text-green-600' : 'text-gray-400'
        }`}>
          {isAtivo ? 'SIM' : 'NÃO'}
        </div>
      </button>
    );
  };

  // ✅ PREPARAR OPÇÕES COM TIPOS CORRETOS
  const opcoesFormatadas = useMemo(() => ({
    tipos: tiposDisponiveis.map((tipo): SelectOption => ({ label: tipo, value: tipo })),
    cidades: Object.keys(cidadesComBairros).map((cidade): SelectOption => ({ 
      label: cidade.replace(/_/g, " "), 
      value: cidade 
    })),
    bairros: (cidadesComBairros[filtros.cidade] || []).map((bairro): SelectOption => ({ 
      label: bairro.replace(/_/g, " "), 
      value: bairro 
    })),
    valores: VALORES_FILTRO.valor as readonly SelectOption[],
    metragens: VALORES_FILTRO.metragem as readonly SelectOption[]
  }), [tiposDisponiveis, cidadesComBairros, filtros.cidade]);

  // ✅ FUNÇÃO AUXILIAR PARA FILTROS ATIVOS MELHORADA
  const obterFiltrosAtivos = useCallback((): Array<{ chave: string; valor: string; item?: ItemImovel }> => {
    return Object.entries(filtros)
      .filter(([, valor]) => valor && valor !== "" && valor !== "0")
      .map(([chave, valor]) => {
        // ✅ Formatação especial para valor e metragem
        let valorFormatado = valor;
        
        if (chave === 'valor' && valor.includes('-')) {
          const [min, max] = valor.split('-');
          if (max === '999999999') {
            valorFormatado = `Acima de R$ ${Number(min).toLocaleString('pt-BR')}`;
          } else {
            valorFormatado = `R$ ${Number(min).toLocaleString('pt-BR')} - R$ ${Number(max).toLocaleString('pt-BR')}`;
          }
        }
        
        if (chave === 'metragem' && valor.includes('-')) {
          const [min, max] = valor.split('-');
          if (max === '999999') {
            valorFormatado = `Acima de ${min}m²`;
          } else {
            valorFormatado = `${min}m² - ${max}m²`;
          }
        }
        
        return {
          chave,
          valor: valorFormatado,
          item: itensDisponiveis.find(i => i.chave === chave)
        };
      });
  }, [filtros, itensDisponiveis]);

  // ✅ CONTADOR DE FILTROS ATIVOS
  const filtrosAtivos = useMemo(() => {
    return Object.values(filtros).filter(valor => valor && valor !== "" && valor !== "0").length;
  }, [filtros]);

  return (
    <div className="w-full bg-white rounded-xl shadow p-4 sm:p-6 mb-8 flex flex-col gap-6 max-w-7xl mx-auto">
      
      {/* ✅ FILTROS PRINCIPAIS */}
      <div className="flex flex-col items-center gap-4 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 w-full">
          <SelectField
            label="Tipo de imóvel"
            name="tipoImovel"
            value={filtros.tipoImovel}
            options={opcoesFormatadas.tipos}
            placeholder="Todos os tipos"
            icon="🏠"
          />
          
          <SelectField
            label="Cidade"
            name="cidade"
            value={filtros.cidade}
            options={opcoesFormatadas.cidades}
            placeholder="Todas as cidades"
            icon="📍"
          />
          
          <SelectField
            label="Bairro"
            name="bairro"
            value={filtros.bairro}
            options={opcoesFormatadas.bairros}
            placeholder="Todos os bairros"
            disabled={!filtros.cidade}
            icon="🏘️"
          />

          <SelectField
            label="Faixa de valor"
            name="valor"
            value={filtros.valor}
            options={opcoesFormatadas.valores as SelectOption[]}
            placeholder="Qualquer valor"
            icon="💰"
          />

          <SelectField
            label="Faixa de metragem"
            name="metragem"
            value={filtros.metragem}
            options={opcoesFormatadas.metragens as SelectOption[]}
            placeholder="Qualquer tamanho"
            icon="📐"
          />
        </div>
        
        {/* ✅ BOTÕES DE AÇÃO COM CONTADOR */}
        <div className="flex flex-row gap-3 w-full justify-center mt-4">
          <button
            type="button"
            onClick={toggleMostrarItens}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-6 py-3 rounded-xl font-semibold transition cursor-pointer"
          >
            <FiList size={20} />
            Características Específicas ({itensDisponiveis.length})
            {mostrarItens ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
          
          <button
            type="button"
            onClick={limparFiltros}
            className={`px-6 py-3 rounded-xl font-semibold transition cursor-pointer ${
              filtrosAtivos > 0 
                ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                : 'bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
            disabled={filtrosAtivos === 0}
          >
            🧹 Limpar Filtros {filtrosAtivos > 0 && `(${filtrosAtivos})`}
          </button>
        </div>
      </div>

      {/* ✅ CARACTERÍSTICAS ESPECÍFICAS */}
      <div
        ref={itensRef}
        className="w-full transition-all duration-300 ease-in-out overflow-hidden"
        style={{
          maxHeight: mostrarItens ? "600px" : "0px",
          opacity: mostrarItens ? 1 : 0,
        }}
      >
        {mostrarItens && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-6">
            <h3 className="font-poppins text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              🔧 Características {setor}s
              <span className="text-sm bg-indigo-200 text-indigo-800 px-3 py-1 rounded-full">
                {itensQuantitativos.length} quantitativas + {itensBooleanos.length} opcionais
              </span>
            </h3>
            
            {itensDisponiveis.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🏠</div>
                <p className="text-lg font-medium">Nenhuma característica disponível para {setor}</p>
                <p className="text-sm mt-2">Selecione outro setor para ver as opções</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* ✅ ITENS QUANTITATIVOS */}
                {itensQuantitativos.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                      🔢 Características Quantitativas
                      <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {itensQuantitativos.length} itens
                      </span>
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {itensQuantitativos.map((item) => (
                        <ItemQuantitativo key={item.chave} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ ITENS BOOLEANOS */}
                {itensBooleanos.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                      ✅ Características Opcionais
                      <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {itensBooleanos.length} itens
                      </span>
                    </h4>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                      {itensBooleanos.map((item) => (
                        <ItemBooleano key={item.chave} item={item} />
                      ))}
                    </div>
                  </div>
                )}

                {/* ✅ RESUMO DOS FILTROS MELHORADO */}
                <div className="bg-blue-100 rounded-xl p-4 border border-blue-200">
                  <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    📋 Resumo dos Filtros Aplicados
                    {filtrosAtivos > 0 && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                        {filtrosAtivos} ativo{filtrosAtivos !== 1 ? 's' : ''}
                      </span>
                    )}
                  </h5>
                  
                  <div className="text-sm text-blue-700">
                    {(() => {
                      const filtrosAtivosDetalhados = obterFiltrosAtivos();
                      
                      if (filtrosAtivosDetalhados.length === 0) {
                        return (
                          <p className="italic text-blue-600">
                            ℹ️ Nenhum filtro específico aplicado - mostrando todos os imóveis
                          </p>
                        );
                      }
                      
                      return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {filtrosAtivosDetalhados.map(({ chave, valor, item }) => {
                            let nome = chave;
                            let icone = '🔧';
                            
                            // ✅ Nomes e ícones especiais para filtros principais
                            if (chave === 'valor') {
                              nome = 'Valor';
                              icone = '💰';
                            } else if (chave === 'metragem') {
                              nome = 'Metragem';
                              icone = '📐';
                            } else if (chave === 'tipoImovel') {
                              nome = 'Tipo';
                              icone = '🏠';
                            } else if (chave === 'cidade') {
                              nome = 'Cidade';
                              icone = '📍';
                            } else if (chave === 'bairro') {
                              nome = 'Bairro';
                              icone = '🏘️';
                            } else if (item) {
                              nome = item.nome;
                              icone = item.icone;
                            }
                            
                            return (
                              <div key={chave} className="flex items-center gap-2 bg-blue-50 px-2 py-1 rounded">
                                <span>{icone}</span>
                                <span className="font-medium">{nome}:</span>
                                <span className="font-bold text-blue-900">
                                  {ITENS_QUANTITATIVOS.includes(chave) ? valor : (chave === 'valor' || chave === 'metragem' ? valor : (valor === '1' ? 'Sim' : valor))}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            )}
            
            {/* ✅ SCROLL HINT */}
            {showScrollHint && itensDisponiveis.length > 10 && (
              <div className="flex flex-col items-center animate-bounce pointer-events-none sticky bottom-0 bg-white/90 rounded-lg p-2">
                <span className="text-indigo-500 text-xs font-medium mb-1">Role para ver mais</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16L6 10H18L12 16Z" fill="#6366F1"/>
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}