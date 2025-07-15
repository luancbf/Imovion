'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { FiList, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaPlus, FaMinus } from "react-icons/fa";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";

// TIPOS
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
  onSetorChange?: (novoSetor: 'Residencial' | 'Comercial' | 'Rural') => void;
  onTipoNegocioChange?: (novoTipo: 'Aluguel' | 'Venda') => void;
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
  cidadesComBairros,
  opcoesTipoImovel,
  setor,
  tipoNegocio,
  onSetorChange,
  onTipoNegocioChange,
  onFiltroChange,
  filtrosIniciais: filtrosExternos = {}
}: FiltroImovelProps) {

  // ITENS DISPONÍVEIS
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

  // FILTROS INICIAIS
  const filtrosIniciais = useMemo((): Record<string, string> => ({
    tipoImovel: "",
    cidade: "",
    bairro: "",
    valor: "",
    metragem: "",
    ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""])),
    ...filtrosExternos
  }), [itensDisponiveis, filtrosExternos]);

  // ESTADO
  const [filtros, setFiltros] = useState<Record<string, string>>(filtrosIniciais);
  const [mostrarItens, setMostrarItens] = useState<boolean>(false);
  const itensRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // DEBOUNCE
  const handleFiltroChange = useCallback((novosFiltros: Record<string, string>): void => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      const filtrosProcessados = { ...novosFiltros };
      Object.keys(filtrosProcessados).forEach(key => {
        if (typeof filtrosProcessados[key] === "string") {
          filtrosProcessados[key] = filtrosProcessados[key].trim().toLowerCase();
        }
      });
      if (filtrosProcessados.valor && filtrosProcessados.valor.includes('-')) {
        const [min, max] = filtrosProcessados.valor.split('-');
        filtrosProcessados.valorMin = min;
        filtrosProcessados.valorMax = max;
        delete filtrosProcessados.valor;
      }
      if (filtrosProcessados.metragem && filtrosProcessados.metragem.includes('-')) {
        const [min, max] = filtrosProcessados.metragem.split('-');
        filtrosProcessados.metragemMin = min;
        filtrosProcessados.metragemMax = max;
        delete filtrosProcessados.metragem;
      }
      onFiltroChange({
        ...filtrosProcessados,
        tipoimovel: filtrosProcessados.tipoimovel.trim().toLowerCase(),
        cidade: filtrosProcessados.cidade.trim().toLowerCase(),
        bairro: filtrosProcessados.bairro.trim().toLowerCase(),
      });
    }, 300);
  }, [onFiltroChange]);

  // HANDLERS
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value, type } = e.target;
    let novoValor = value;
    if (type === "checkbox") {
      novoValor = (e.target as HTMLInputElement).checked ? "1" : "";
    }
    const novosFiltros = { ...filtros, [name]: novoValor };
    if (name === "cidade") novosFiltros.bairro = "";
    setFiltros(novosFiltros);
    handleFiltroChange(novosFiltros);
  }, [filtros, handleFiltroChange]);

  const handleItemQuantChange = useCallback((chave: string, valor: number): void => {
    const valorNormalizado = Math.max(0, valor);
    const valorString = valorNormalizado > 0 ? String(valorNormalizado) : "";
    const novosFiltros = { ...filtros, [chave]: valorString };
    setFiltros(novosFiltros);
    handleFiltroChange(novosFiltros);
  }, [filtros, handleFiltroChange]);

  const limparFiltros = useCallback((): void => {
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onFiltroChange(filtrosLimpos);
  }, [itensDisponiveis, onFiltroChange]);

  const toggleMostrarItens = useCallback((): void => {
    setMostrarItens(prev => !prev);
  }, []);

  useEffect(() => {
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
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    onFiltroChange(novosFiltrosIniciais);
  }, [setor, tipoNegocio, itensDisponiveis, onFiltroChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // COMPONENTES AUXILIARES
  const SelectField = ({ label, name, value, options, placeholder = "Todos", disabled = false, icon }: SelectFieldProps) => (
    <div className="flex flex-col w-full">
      <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>} {label}
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
      <div
        className="bg-white rounded-xl border-2 border-indigo-200 p-4 hover:border-indigo-300 transition-all duration-200 hover:shadow-md flex flex-col items-center"
        tabIndex={-1} 
        onMouseDown={e => e.preventDefault()}
      >
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">{item.icone}</span>
          <span className="font-medium text-indigo-900 text-sm">{item.nome}</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()}
            onClick={() => handleItemQuantChange(item.chave, valorAtual - 1)}
            className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={valorAtual <= 0}
            aria-label={`Diminuir ${item.nome}`}
          >
            <FaMinus size={12} />
          </button>
          <div className="bg-indigo-50 rounded-lg px-4 py-2 min-w-[48px] text-center">
            <span className="text-lg font-bold text-indigo-900">
              {valorAtual}
            </span>
          </div>
          <button
            type="button"
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()} 
            onClick={() => handleItemQuantChange(item.chave, valorAtual + 1)}
            className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200"
            aria-label={`Aumentar ${item.nome}`}
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
        tabIndex={-1}
        onMouseDown={e => e.preventDefault()} 
        onClick={() => handleItemQuantChange(item.chave, isAtivo ? 0 : 1)}
        className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] flex flex-col items-center w-full
          ${isAtivo
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md'
            : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
        }`}
        aria-pressed={isAtivo}
        aria-label={item.nome}
      >
        <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-colors duration-200 ${
          isAtivo ? 'bg-green-500' : 'bg-gray-300'
        }`} />
        <span className="text-2xl mb-1">{item.icone}</span>
        <span className={`text-xs font-medium text-center leading-tight ${
          isAtivo ? 'text-green-800' : 'text-gray-700'
        }`}>
          {item.nome}
        </span>
        <span className={`mt-1 text-xs font-bold ${
          isAtivo ? 'text-green-600' : 'text-gray-400'
        }`}>
          {isAtivo ? 'SIM' : 'NÃO'}
        </span>
      </button>
    );
  };

  // OPÇÕES FORMATADAS
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
    valores: tipoNegocio === "Aluguel"
      ? VALORES_FILTRO.valor as readonly SelectOption[]
      : VALORES_FILTRO.valorVenda as readonly SelectOption[],
    metragens: VALORES_FILTRO.metragem as readonly SelectOption[]
  }), [tiposDisponiveis, cidadesComBairros, filtros.cidade, tipoNegocio]);

  // FILTROS ATIVOS
  const filtrosAtivos = useMemo(() => {
    return Object.values(filtros).filter(valor => valor && valor !== "" && valor !== "0").length;
  }, [filtros]);

  // RENDER
  return (
    <div className="w-full bg-white rounded-2xl shadow p-4 sm:p-6 mb-8 flex flex-col gap-6 max-w-7xl mx-auto border border-blue-100">
      {/* FILTROS PRINCIPAIS */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Linha responsiva com todos os selects principais */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Categoria</label>
            <select
              value={setor}
              onChange={e => onSetorChange?.(e.target.value as 'Residencial' | 'Comercial' | 'Rural')}
              className="p-3 border border-gray-300 rounded-lg bg-white text-black w-full"
            >
              <option value="Residencial">Residencial</option>
              <option value="Comercial">Comercial</option>
              <option value="Rural">Rural</option>
            </select>
          </div>
          {/* Tipo de Negócio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Negócio</label>
            <select
              value={tipoNegocio}
              onChange={e => onTipoNegocioChange?.(e.target.value as 'Aluguel' | 'Venda')}
              className="p-3 border border-gray-300 rounded-lg bg-white text-black w-full"
            >
              <option value="Aluguel">Aluguel</option>
              <option value="Venda">Venda</option>
            </select>
          </div>
          {/* Tipo de imóvel */}
          <SelectField
            label="Tipo de imóvel"
            name="tipoImovel"
            value={filtros.tipoImovel}
            options={opcoesFormatadas.tipos}
            placeholder="Todos os tipos"
            icon="🏠"
          />
          {/* Cidade */}
          <SelectField
            label="Cidade"
            name="cidade"
            value={filtros.cidade}
            options={opcoesFormatadas.cidades}
            placeholder="Todas as cidades"
            icon="📍"
          />
          {/* Bairro */}
          <div className="flex flex-col w-full">
            <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              🏘️ Bairro
            </label>
            <input
              type="text"
              name="bairro"
              value={filtros.bairro}
              onChange={handleChange}
              placeholder="Digite o bairro"
              className="p-3 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          {/* Faixa de valor */}
          <SelectField
            label="Faixa de valor"
            name="valor"
            value={filtros.valor}
            options={opcoesFormatadas.valores as SelectOption[]}
            placeholder="Qualquer valor"
            icon="💰"
          />
          {/* Faixa de metragem */}
          <SelectField
            label="Faixa de metragem"
            name="metragem"
            value={filtros.metragem}
            options={opcoesFormatadas.metragens as SelectOption[]}
            placeholder="Qualquer tamanho"
            icon="📐"
          />
        </div>
        {/* BOTÕES DE AÇÃO */}
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
      {/* CARACTERÍSTICAS ESPECÍFICAS */}
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
          <div
            className="max-h-100 bg-indigo-50 border border-indigo-200 rounded-xl p-4 sm:p-6 space-y-6 overflow-y-auto"
          >
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
              <div className="space-y-6">
                {/* ITENS QUANTITATIVOS */}
                {itensQuantitativos.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                      🔢 Características Quantitativas
                      <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {itensQuantitativos.length} itens
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                      {itensQuantitativos.map((item) => (
                        <ItemQuantitativo key={item.chave} item={item} />
                      ))}
                    </div>
                  </div>
                )}
                {/* ITENS BOOLEANOS */}
                {itensBooleanos.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-indigo-800 mb-4 flex items-center gap-2">
                      ✅ Características Opcionais
                      <span className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        {itensBooleanos.length} itens
                      </span>
                    </h4>
                    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
                      {itensBooleanos.map((item) => (
                        <ItemBooleano key={item.chave} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}