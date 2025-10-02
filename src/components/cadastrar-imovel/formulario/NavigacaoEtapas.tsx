"use client";

import { FiSave } from "react-icons/fi";

interface NavigacaoEtapasProps {
  etapaAtual: number;
  totalEtapas: number;
  etapaValida: (etapa: number) => boolean;
  carregando: boolean;
  modoEdicao: boolean;
  onAnterior: () => void;
  onProximo: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function NavigacaoEtapas({
  etapaAtual,
  totalEtapas,
  etapaValida,
  carregando,
  modoEdicao,
  onAnterior,
  onProximo,
  onSubmit,
}: NavigacaoEtapasProps) {
  const todasEtapasValidas = Array.from({ length: totalEtapas }, (_, i) => i + 1)
    .every(etapa => etapaValida(etapa));

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-blue-100">
      <div className="flex gap-2">
        {etapaAtual > 1 && (
          <button
            type="button"
            onClick={onAnterior}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold transition-colors text-sm cursor-pointer"
          >
            ← Anterior
          </button>
        )}
        {etapaAtual < totalEtapas && etapaValida(etapaAtual) && (
          <button
            type="button"
            onClick={onProximo}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors text-sm cursor-pointer"
          >
            Próximo →
          </button>
        )}
      </div>
      <button
        type="submit"
        onClick={onSubmit}
        disabled={carregando || !todasEtapasValidas}
        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 cursor-pointer disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 text-sm"
      >
        {carregando ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            <span>{modoEdicao ? "Atualizando..." : "Salvando..."}</span>
          </>
        ) : (
          <>
            <FiSave size={16} />
            <span>{modoEdicao ? "Atualizar" : "Salvar"}</span>
          </>
        )}
      </button>
    </div>
  );
}