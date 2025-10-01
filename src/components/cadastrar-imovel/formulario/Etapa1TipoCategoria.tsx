"use client";

import { FiHome } from "react-icons/fi";

const CLASSES = {
  select: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 cursor-pointer",
};

interface FormularioState {
  tipoNegocio: string;
  setorNegocio: string;
  tipoImovel: string;
}

interface Etapa1Props {
  formulario: FormularioState;
  opcoesTipoImovel?: Record<string, string[]>;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Etapa1({ formulario, opcoesTipoImovel, onChange }: Etapa1Props) {
  return (
    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
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
            onChange={onChange}
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
              onChange={onChange}
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
            onChange={onChange}
            className={CLASSES.select}
            required
          >
            <option value="">🏘️ Selecione o tipo de imóvel</option>
            {(opcoesTipoImovel?.[
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
  );
}