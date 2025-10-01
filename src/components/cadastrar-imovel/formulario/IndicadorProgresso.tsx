"use client";

import { FiHome, FiMapPin, FiDollarSign, FiUpload, FiEdit3 } from "react-icons/fi";

const ETAPAS = [
  { numero: 1, icone: FiHome, label: "Tipo & Categoria" },
  { numero: 2, icone: FiMapPin, label: "Localização" },
  { numero: 3, icone: FiDollarSign, label: "Detalhes" },
  { numero: 4, icone: FiUpload, label: "Imagens" },
  { numero: 5, icone: FiEdit3, label: "Características" },
];

interface IndicadorProgressoProps {
  etapaAtual: number;
  etapaValida: (etapa: number) => boolean;
  onEtapaChange: (etapa: number) => void;
}

export default function IndicadorProgresso({ etapaAtual, etapaValida, onEtapaChange }: IndicadorProgressoProps) {
  return (
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
                onClick={() => isAcessivel && onEtapaChange(etapa.numero)}
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
  );
}