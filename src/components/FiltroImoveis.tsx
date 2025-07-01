'use client';

import { useState, useRef, useEffect } from "react";
import { FiList, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { FaPlus, FaMinus } from "react-icons/fa";
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from "@/constants/itensImovel";

interface FiltroImovelProps {
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  setor: 'Residencial' | 'Comercial' | 'Rural';
  tipoNegocio: string;
  onFiltroChange: (filtros: Record<string, string>) => void;
}

export function FiltroImovel({
  cidadesComBairros,
  opcoesTipoImovel,
  setor,
  tipoNegocio,
  onFiltroChange,
}: FiltroImovelProps) {
  const itensDisponiveis = ITENS_POR_SETOR[setor];

  const [filtros, setFiltros] = useState<Record<string, string>>({
    tipoImovel: "",
    cidade: "",
    bairro: "",
    ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""])),
  });

  const [mostrarItens, setMostrarItens] = useState(false);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const itensRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mostrarItens) return;
    const el = itensRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 16) {
        setShowScrollHint(false);
      } else {
        setShowScrollHint(true);
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [mostrarItens]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement | HTMLSelectElement;
    const { name, value, type } = target;
    let novoValor = value;
    if (type === "checkbox") {
      novoValor = (target as HTMLInputElement).checked ? "1" : "";
    }
    const novosFiltros = { ...filtros, [name]: novoValor };
    if (name === "cidade") {
      novosFiltros.bairro = "";
    }
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const handleItemQuantChange = (chave: string, valor: number) => {
    const novosFiltros = { ...filtros, [chave]: valor > 0 ? String(valor) : "" };
    setFiltros(novosFiltros);
    onFiltroChange(novosFiltros);
  };

  const limparFiltros = () => {
    const filtrosLimpos = {
      tipoImovel: "",
      cidade: "",
      bairro: "",
      ...Object.fromEntries(itensDisponiveis.map(item => [item.chave, ""])),
    };
    setFiltros(filtrosLimpos);
    onFiltroChange(filtrosLimpos);
    setMostrarItens(false);
  };

  return (
    <div className="w-full bg-white rounded-xl shadow p-4 sm:p-6 mb-8 flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col items-center gap-2 w-full">
        <div className="flex flex-col md:flex-row gap-4 w-full md:justify-center">
          <div className="flex flex-col w-full md:w-1/4 min-w-[180px]">
            <label className="text-sm font-semibold text-gray-700 mb-1">Tipo de imóvel</label>
            <select
              name="tipoImovel"
              value={filtros.tipoImovel}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              <option value="">Selecionar</option>
              {(opcoesTipoImovel[`${setor}-${tipoNegocio}`] || []).map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full md:w-1/4 min-w-[150px]">
            <label className="text-sm font-semibold text-gray-700 mb-1">Cidade</label>
            <select
              name="cidade"
              value={filtros.cidade}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-400 cursor-pointer"
            >
              <option value="">Selecionar</option>
              {Object.keys(cidadesComBairros).map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-full md:w-1/4 min-w-[150px]">
            <label className="text-sm font-semibold text-gray-700 mb-1">Bairro</label>
            <select
              name="bairro"
              value={filtros.bairro}
              onChange={handleChange}
              className="p-2 border border-gray-300 rounded-lg bg-white text-black focus:ring-2 focus:ring-blue-400 cursor-pointer"
              disabled={!filtros.cidade}
            >
              <option value="">Selecionar</option>
              {(cidadesComBairros[filtros.cidade] || []).map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-row gap-2 w-full justify-center mt-2">
          <button
            type="button"
            onClick={() => setMostrarItens((v) => !v)}
            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-800 px-4 py-2 rounded font-semibold transition cursor-pointer"
          >
            <FiList size={20} />
            Itens
            {mostrarItens ? <FiChevronUp size={18} /> : <FiChevronDown size={18} />}
          </button>
          <button
            type="button"
            onClick={limparFiltros}
            className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded font-semibold transition cursor-pointer"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <div
        ref={itensRef}
        style={{
          maxHeight: mostrarItens ? 260 : 0,
          opacity: mostrarItens ? 1 : 0,
          overflow: mostrarItens ? "auto" : "hidden",
          transition: "opacity 0.4s cubic-bezier(0.4,0,0.2,1), max-height 0.4s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
        }}
        className="w-full"
      >
        {mostrarItens && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2 mt-2 min-h-[120px] relative">
            <h3 className="font-poppins text-lg font-bold text-blue-800 mb-3">Itens do imóvel</h3>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
              {itensDisponiveis.map((item) => {
                const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
                return (
                  <div
                    key={item.chave}
                    className="flex flex-col items-center bg-white rounded shadow px-2 py-2 min-w-0"
                  >
                    <label
                      className="text-blue-900 font-inter text-xs sm:text-sm mb-1 text-center truncate w-full flex items-center justify-center gap-1"
                      htmlFor={item.chave}
                      title={item.nome}
                    >
                      <span className="text-sm">{item.icone}</span>
                      <span className="truncate">{item.nome}</span>
                    </label>
                    {isQuant ? (
                      <div className="flex items-center gap-2 w-full justify-center">
                        <button
                          type="button"
                          className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer"
                          onClick={() =>
                            handleItemQuantChange(
                              item.chave,
                              Math.max(0, Number(filtros[item.chave] || 0) - 1)
                            )
                          }
                          tabIndex={-1}
                        >
                          <FaMinus size={12} />
                        </button>
                        <input
                          id={item.chave}
                          type="number"
                          min={0}
                          value={filtros[item.chave] || 0}
                          onChange={e =>
                            handleItemQuantChange(
                              item.chave,
                              Math.max(0, Number(e.target.value))
                            )
                          }
                          className="w-10 text-center border border-gray-300 rounded text-xs sm:text-sm no-spinner"
                          style={{
                            MozAppearance: "textfield",
                          }}
                          inputMode="numeric"
                          pattern="[0-9]*"
                        />
                        <button
                          type="button"
                          className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 cursor-pointer"
                          onClick={() =>
                            handleItemQuantChange(
                              item.chave,
                              Number(filtros[item.chave] || 0) + 1
                            )
                          }
                          tabIndex={-1}
                        >
                          <FaPlus size={12} />
                        </button>
                      </div>
                    ) : (
                      <input
                        id={item.chave}
                        type="checkbox"
                        checked={!!Number(filtros[item.chave])}
                        onChange={handleChange}
                        name={item.chave}
                        className="accent-blue-600 w-5 h-5 cursor-pointer"
                      />
                    )}
                  </div>
                );
              })}
            </div>
            {showScrollHint && (
              <div
                className="flex flex-col items-center animate-bounce pointer-events-none"
                style={{
                  position: "sticky",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  marginLeft: "auto",
                  marginRight: "auto",
                  width: "fit-content",
                  opacity: 0.85,
                  background: "rgba(255,255,255,0.7)",
                  borderRadius: 8,
                  padding: "2px 8px",
                  zIndex: 20,
                  transition: "opacity 0.3s",
                }}
              >
                <span className="text-blue-400 text-xs font-medium mb-1">Role para ver mais</span>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 16L6 10H18L12 16Z" fill="#60A5FA"/>
                </svg>
              </div>
            )}
          </div>
        )}
      </div>
      <style>
        {`
          input[type=number]::-webkit-inner-spin-button, 
          input[type=number]::-webkit-outer-spin-button { 
            -webkit-appearance: none;
            margin: 0;
          }
          input[type=number] {
            -moz-appearance: textfield;
          }
        `}
      </style>
    </div>
  );
}