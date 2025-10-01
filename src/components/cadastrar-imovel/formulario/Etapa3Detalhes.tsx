"use client";

import { FiDollarSign } from "react-icons/fi";

const CLASSES = {
  input: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500",
  select: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 cursor-pointer",
  textarea: "w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none",
};

interface Patrocinador {
  id: string;
  nome: string;
  telefone?: string;
  creci?: string;
}

interface FormularioState {
  valor: string;
  metragem: string;
  descricao: string;
  codigoImovel: string;
  whatsapp: string;
  patrocinador: string;
  creci: string;
}

interface Etapa3Props {
  formulario: FormularioState;
  patrocinadores: Patrocinador[];
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export default function Etapa3Detalhes({ formulario, patrocinadores, onChange }: Etapa3Props) {
  return (
    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
      <h3 className="text-lg font-semibold text-purple-900 mb-4 flex items-center gap-2 font-poppins">
        <FiDollarSign size={20} />
        Detalhes Comerciais
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            Valor do Imóvel
          </label>
          <input
            name="valor"
            placeholder="R$ 0,00"
            value={formulario.valor}
            onChange={onChange}
            className={CLASSES.input}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            Metragem
          </label>
          <input
            name="metragem"
            placeholder="0 m²"
            value={formulario.metragem}
            onChange={onChange}
            className={CLASSES.input}
            required
          />
        </div>
      </div>
      
      <div className="mt-6 space-y-2">
        <label className="block text-sm font-semibold text-purple-900 font-inter">
          Descrição do Imóvel
        </label>
        <textarea
          name="descricao"
          placeholder="Descreva as principais características do imóvel..."
          value={formulario.descricao}
          onChange={onChange}
          className={CLASSES.textarea}
          rows={4}
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            Código do Imóvel
          </label>
          <input
            name="codigoImovel"
            placeholder="Digite o código do imóvel"
            value={formulario.codigoImovel || ""}
            onChange={onChange}
            className={CLASSES.input}
            autoComplete="off"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            WhatsApp para Contato
          </label>
          <input
            name="whatsapp"
            placeholder="(00) 00000-0000"
            value={formulario.whatsapp}
            onChange={onChange}
            className={CLASSES.input}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            Patrocinador (Opcional)
          </label>
          <select
            name="patrocinador"
            value={formulario.patrocinador || ''}
            onChange={onChange}
            className={CLASSES.select}
          >
            <option value="">🏢 Selecionar patrocinador</option>
            {patrocinadores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-purple-900 font-inter">
            CRECI
          </label>
          <input
            name="creci"
            placeholder="Digite o CRECI"
            value={formulario.creci || ""}
            onChange={onChange}
            className={CLASSES.input}
          />
        </div>
      </div>
    </div>
  );
}