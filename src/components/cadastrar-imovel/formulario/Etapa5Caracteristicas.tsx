"use client";

import { FiEdit3 } from "react-icons/fi";
import ItensImovel from "./ItensImovel";

interface Item {
  chave: string;
  nome: string;
  icone: string;
}

interface Etapa5Props {
  tipoNegocio: string;
  itensDisponiveis: Item[];
  itens: Record<string, number>;
  setItens: (itens: Record<string, number>) => void;
  ITENS_QUANTITATIVOS: string[];
}

export default function Etapa5Caracteristicas({ 
  tipoNegocio,
  itensDisponiveis,
  itens,
  setItens,
  ITENS_QUANTITATIVOS
}: Etapa5Props) {
  if (!tipoNegocio) {
    return null;
  }

  return (
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
  );
}