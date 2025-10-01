'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FiList, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaPlus, FaMinus } from "react-icons/fa";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";

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
  opcoesTipoImovel: Record<string, string[]>;
  setor: "" | "Residencial" | "Comercial" | "Rural";
  tipoNegocio: "" | "Aluguel" | "Venda";
  onSetorChange?: (novoSetor: "" | "Residencial" | "Comercial" | "Rural") => void;
  onTipoNegocioChange?: (novoTipo: "" | "Aluguel" | "Venda") => void;
  onFiltroChange: (filtros: Record<string, string>) => void;
  filtrosIniciais?: Record<string, string>;
  mostrarCategoriaNegocio?: boolean;
}

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: SelectOption[];
  disabled?: boolean;
  icon?: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

interface InputFieldProps {
  label: string;
  name: string;
  value: string;
  placeholder: string;
  icon?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

// CONSTANTES
const VALORES_FILTRO = {
  valor: [
    { label: "Até R$ 500", value: "0-500" },
    { label: "Até R$ 800", value: "0-800" },
    { label: "Até R$ 1.000", value: "0-1000" },
    { label: "Até R$ 1.500", value: "0-1500" },
    { label: "Até R$ 2.000", value: "0-2000" },
    { label: "Até R$ 3.000", value: "0-3000" },
    { label: "Até R$ 5.000", value: "0-5000" },
    { label: "Acima de R$ 5.000", value: "5000-999999" },
  ],
  valorVenda: [
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
  opcoesTipoImovel,
  setor,
  tipoNegocio,
  onSetorChange,
  onTipoNegocioChange,
  onFiltroChange,
  filtrosIniciais: filtrosExternos = {},
  mostrarCategoriaNegocio = false
}: FiltroImovelProps) {

  // COMPUTED VALUES (sem dependência de state)
  const itensDisponiveis = useMemo((): ItemImovel[] =>
    ITENS_POR_SETOR[setor] || [],
    [setor]
  );

  const chaveOpcoes = useMemo(() => `${setor}-${tipoNegocio}`, [setor, tipoNegocio]);
  const tiposDisponiveis = useMemo(() => opcoesTipoImovel[chaveOpcoes] || [], [opcoesTipoImovel, chaveOpcoes]);
  
  const filtrosIniciais = useMemo((): Record<string, string> => ({
    tipoimovel: "",
    cidade: "",
    bairro: "",
    valor: "",
    metragem: "",
    ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""])),
    ...filtrosExternos
  }), [itensDisponiveis, filtrosExternos]);

  const opcoesFormatadas = useMemo(() => ({
    tipos: tiposDisponiveis.map((tipo): SelectOption => ({ 
      label: tipo.replace(/_/g, " "), 
      value: tipo 
    })),
    valores: tipoNegocio === "Aluguel"
      ? VALORES_FILTRO.valor as readonly SelectOption[]
      : VALORES_FILTRO.valorVenda as readonly SelectOption[],
    metragens: VALORES_FILTRO.metragem as readonly SelectOption[]
  }), [tiposDisponiveis, tipoNegocio]);

  // STATE
  const [filtros, setFiltros] = useState<Record<string, string>>(filtrosIniciais);
  const [mostrarItens, setMostrarItens] = useState<boolean>(false);

  // COMPUTED VALUES (com dependência de state)
  const filtrosAtivos = useMemo(() => {
    return Object.values(filtros).filter(valor => valor && valor !== "" && valor !== "0").length;
  }, [filtros]);

  // Verificar se tipo de negócio está selecionado para habilitar valor
  const valorDisponivel = useMemo(() => {
    return tipoNegocio !== "";
  }, [tipoNegocio]);
  
  // REFS
  const itensRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // UTILITY FUNCTIONS
  const processarFiltros = useCallback((novosFiltros: Record<string, string>) => {
    const filtrosProcessados = { ...novosFiltros };
    
    // Trim em strings
    Object.keys(filtrosProcessados).forEach(chave => {
      if (typeof filtrosProcessados[chave] === "string") {
        filtrosProcessados[chave] = filtrosProcessados[chave].trim();
      }
    });
    
    // Processar faixas de valor
    if (filtrosProcessados.valor?.includes('-')) {
      const [min, max] = filtrosProcessados.valor.split('-');
      filtrosProcessados.valorMin = min;
      filtrosProcessados.valorMax = max;
      delete filtrosProcessados.valor;
    }
    
    // Processar faixas de metragem
    if (filtrosProcessados.metragem?.includes('-')) {
      const [min, max] = filtrosProcessados.metragem.split('-');
      filtrosProcessados.metragemMin = min;
      filtrosProcessados.metragemMax = max;
      delete filtrosProcessados.metragem;
    }
    
    return filtrosProcessados;
  }, []);

  // HANDLERS
  const handleFiltroChange = useCallback((novosFiltros: Record<string, string>): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const filtrosProcessados = processarFiltros(novosFiltros);
      onFiltroChange(filtrosProcessados);
    }, 150);
  }, [onFiltroChange, processarFiltros]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    
    const novosFiltros = { ...filtros, [name]: value };
    
    // Limpar bairro quando cidade mudar
    if (name === "cidade") {
      novosFiltros.bairro = "";
    }

    // Limpar valor quando tipo de negócio mudar
    if (name === "setornegocio") {
      novosFiltros.valor = "";
    }
    
    setFiltros(novosFiltros);
    handleFiltroChange(novosFiltros);

    if (name === "setor" && onSetorChange) {
      onSetorChange(value as "" | "Residencial" | "Comercial" | "Rural");
    }
    if (name === "setornegocio" && onTipoNegocioChange) {
      onTipoNegocioChange(value as "" | "Aluguel" | "Venda");
    }
  }, [filtros, handleFiltroChange, onSetorChange, onTipoNegocioChange]);

  const handleItemQuantChange = useCallback((chave: string, valor: number): void => {
    const valorNormalizado = Math.max(0, valor);
    const valorString = valorNormalizado > 0 ? String(valorNormalizado) : "";
    const novosFiltros = { ...filtros, [chave]: valorString };
    setFiltros(novosFiltros);
    handleFiltroChange(novosFiltros);
  }, [filtros, handleFiltroChange]);

  const limparFiltros = useCallback((): void => {
    const filtrosLimpos = {
      tipoimovel: "",
      cidade: "",
      bairro: "",
      valor: "",
      metragem: "",
      ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""]))
    };
    setFiltros(filtrosLimpos);
    setMostrarItens(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onFiltroChange(filtrosLimpos);
  }, [itensDisponiveis, onFiltroChange]);

  const toggleMostrarItens = useCallback((): void => {
    setMostrarItens(prev => !prev);
  }, []);

  // EFFECTS
  useEffect(() => {
    const novosFiltrosIniciais = {
      tipoimovel: "",
      cidade: "",
      bairro: "",
      valor: "",
      metragem: "",
      ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""]))
    };
    setFiltros(novosFiltrosIniciais);
    setMostrarItens(false);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onFiltroChange(novosFiltrosIniciais);
  }, [setor, tipoNegocio, itensDisponiveis, onFiltroChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // COMPONENTS
  const SelectField = ({ label, name, value, options = [], disabled = false, icon }: SelectFieldProps) => (
    <div className="flex flex-col w-full">
      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>} {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        className={`h-12 p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-400 cursor-pointer transition-all duration-200 ${
          disabled 
            ? 'opacity-50 cursor-not-allowed bg-gray-100' 
            : 'hover:border-gray-400'
        }`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const InputField = ({ label, name, value, placeholder, icon, onChange }: InputFieldProps) => (
    <div className="flex flex-col w-full">
      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>} {label}
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        className="h-12 p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-400 transition-all duration-200 hover:border-gray-400"
      />
    </div>
  );

  const ItemImovelComponent = ({ item }: { item: ItemImovel }) => {
    const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
    const valorAtual = Number(filtros[item.chave] || 0);
    const isAtivo = isQuant ? valorAtual > 0 : Number(filtros[item.chave]) > 0;

    return (
      <div className="bg-white rounded-lg border border-indigo-200 p-2 flex flex-col items-center justify-center transition-all duration-200 hover:shadow-md w-full min-h-[70px] select-none">
        <div className="flex items-center gap-2 mb-1 select-none">
          <span className="text-xl select-none">{item.icone}</span>
          <span className="font-medium text-indigo-900 text-xs select-none">{item.nome}</span>
        </div>
        {isQuant ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleItemQuantChange(item.chave, valorAtual - 1)}
              className="w-7 h-7 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              disabled={valorAtual <= 0}
              aria-label={`Diminuir ${item.nome}`}
            >
              <FaMinus size={10} />
            </button>
            <div className="bg-indigo-50 rounded px-2 py-1 min-w-[32px] text-center select-none">
              <span className="text-base font-bold text-indigo-900 select-none">
                {valorAtual}
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleItemQuantChange(item.chave, valorAtual + 1)}
              className="w-7 h-7 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
              aria-label={`Aumentar ${item.nome}`}
            >
              <FaPlus size={10} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => handleItemQuantChange(item.chave, isAtivo ? 0 : 1)}
            className={`mt-1 w-5 h-5 rounded-full border-4 flex items-center justify-center transition-colors duration-200 cursor-pointer ${
              isAtivo
                ? 'bg-green-500 border-green-600'
                : 'bg-gray-100 border-gray-300'
            }`}
            aria-pressed={isAtivo}
            aria-label={item.nome}
          >
            {isAtivo && (
              <span className="w-3 h-3 bg-white rounded-full block select-none" />
            )}
          </button>
        )}
      </div>
    );
  };

  // RENDER
  return (
    <div className="w-full bg-white rounded-2xl shadow p-4 sm:p-6 mb-8 flex flex-col gap-6 max-w-7xl mx-auto border border-blue-100">
      <div className="flex flex-col items-center gap-4 w-full">
        <div className={
          mostrarCategoriaNegocio
            ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full"
            : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full"
        }>
          
          {mostrarCategoriaNegocio && (
            <>
              <SelectField
                label="Categoria"
                name="setor"
                value={setor}
                options={[
                  { label: "Todas as categorias", value: "" },
                  { label: "Residencial", value: "Residencial" },
                  { label: "Comercial", value: "Comercial" },
                  { label: "Rural", value: "Rural" },
                ]}
                icon="🏷️"
                onChange={handleChange}
              />
              <SelectField
                label="Tipo de Negócio"
                name="setornegocio"
                value={tipoNegocio}
                options={[
                  { label: "Todos os tipos de negócio", value: "" },
                  { label: "Aluguel", value: "Aluguel" },
                  { label: "Venda", value: "Venda" },
                ]}
                icon="💼"
                onChange={handleChange}
              />
            </>
          )}
          
          <SelectField
            label="Tipo de imóvel"
            name="tipoimovel"
            value={filtros.tipoimovel}
            options={[
              { label: "Todos os tipos de imóvel", value: "" },
              ...opcoesFormatadas.tipos
            ]}
            icon="🏠"
            onChange={handleChange}
          />
          
          <InputField
            label="Cidade"
            name="cidade"
            value={filtros.cidade}
            placeholder="Digite a cidade..."
            icon="📍"
            onChange={handleChange}
          />
          
          <InputField
            label="Bairro"
            name="bairro"
            value={filtros.bairro}
            placeholder="Digite o bairro..."
            icon="🏘️"
            onChange={handleChange}
          />
          
          <SelectField
            label={`Faixa de valor ${tipoNegocio ? `(${tipoNegocio})` : ''}`}
            name="valor"
            value={filtros.valor}
            options={[
              { 
                label: valorDisponivel ? "Qualquer valor" : "Selecione o tipo de negócio primeiro", 
                value: "" 
              },
              ...(valorDisponivel ? opcoesFormatadas.valores : [])
            ]}
            icon="💰"
            disabled={!valorDisponivel}
            onChange={handleChange}
          />
          
          <SelectField
            label="Faixa de metragem"
            name="metragem"
            value={filtros.metragem}
            options={[
              { label: "Qualquer tamanho", value: "" },
              ...opcoesFormatadas.metragens
            ]}
            icon="📐"
            onChange={handleChange}
          />
        </div>
        
        <div className="flex flex-row flex-wrap gap-3 w-full justify-center mt-4">
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
      
      <div
        ref={itensRef}
        className={`w-full transition-all duration-300 ease-in-out ${
          mostrarItens ? "py-2" : "py-0"
        }`}
        style={{
          maxHeight: mostrarItens ? undefined : 0,
          opacity: mostrarItens ? 1 : 0,
          overflow: mostrarItens ? "visible" : "hidden",
        }}
      >
        {mostrarItens && (
          <div className="max-h-100 bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-6 space-y-6 overflow-y-auto">
            <h3 className="font-poppins text-xl font-bold text-indigo-900 mb-4 flex items-center gap-2">
              🔧 Características {setor}s
            </h3>
            {itensDisponiveis.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🏠</div>
                <p className="text-lg font-medium">Nenhuma característica disponível para {setor}</p>
                <p className="text-sm mt-2">Selecione outro setor para ver as opções</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                {itensDisponiveis.map((item) => (
                  <ItemImovelComponent key={item.chave} item={item} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}