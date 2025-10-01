"use client";

import { FiMapPin } from "react-icons/fi";

const CLASSES = {
  input: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500",
};

interface FormularioState {
  cidade: string;
  bairro: string;
  enderecoDetalhado: string;
}

interface Etapa2Props {
  formulario: FormularioState;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Etapa2Localizacao({ formulario, onChange }: Etapa2Props) {
  return (
    <div className="bg-green-50 rounded-xl p-4 border border-green-200">
      <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2 font-poppins">
        <FiMapPin size={20} />
        Localização do Imóvel
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-green-900 font-inter">
            Cidade
          </label>
          <input
            name="cidade"
            type="text"
            placeholder="Digite a cidade..."
            value={formulario.cidade}
            onChange={onChange}
            className={CLASSES.input}
            required
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-green-900 font-inter">
            Bairro
          </label>
          <input
            name="bairro"
            type="text"
            placeholder="Digite o bairro..."
            value={formulario.bairro}
            onChange={onChange}
            className={CLASSES.input}
            required
            autoComplete="off"
          />
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <label className="block text-sm font-semibold text-green-900 font-inter">
          Endereço Completo
        </label>
        <input
          name="enderecoDetalhado"
          placeholder="Rua, número, complemento..."
          value={formulario.enderecoDetalhado}
          onChange={onChange}
          className={CLASSES.input}
          required
        />
      </div>
    </div>
  );
}