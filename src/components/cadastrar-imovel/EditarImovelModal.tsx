import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import type { Imovel } from '@/types/Imovel';
import ItensImovel from './formulario/ItensImovel';
import { ITENS_POR_SETOR, ITENS_QUANTITATIVOS } from '@/constants/itensImovel';

interface EditarImovelModalProps {
  open: boolean;
  form: Partial<Imovel>;
  onClose: () => void;
  onSave: (form: Partial<Imovel>) => void;
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  patrocinadores: { id: string; nome: string }[];
}

function ensureItensAreNumbers(obj: unknown): Record<string, number> {
  if (!obj || typeof obj !== 'object') return {};
  const result: Record<string, number> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    result[k] = typeof v === 'number' ? v : Number(v) || 0;
  }
  return result;
}

export default function EditarImovelModal({
  open,
  form,
  onClose,
  onSave,
  cidadesComBairros,
  opcoesTipoImovel,
  patrocinadores,
}: EditarImovelModalProps) {
  const [localForm, setLocalForm] = useState<Partial<Imovel>>(form);

  useEffect(() => {
    setLocalForm(form);
  }, [form, open]);

  const handleField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setLocalForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localForm);
  };

  if (!open) return null;

  const setorSelecionado = localForm.tipoNegocio as keyof typeof ITENS_POR_SETOR;
  const itensDisponiveis = setorSelecionado ? ITENS_POR_SETOR[setorSelecionado] : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-4 md:p-8 w-full max-w-3xl mx-2 relative overflow-y-auto max-h-[95vh]"
      >
        <button className="absolute top-3 right-3" onClick={onClose} type="button">
          <FaTimes size={22} />
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center font-poppins">Editar Imóvel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Setor de negociação</label>
            <select
              name="tipoNegocio"
              value={localForm.tipoNegocio ?? ''}
              onChange={handleField}
              className="w-full p-2 border border-gray-400 rounded-lg font-poppins cursor-pointer"
              required
            >
              <option value="">Selecione</option>
              <option value="Residencial">Residencial</option>
              <option value="Comercial">Comercial</option>
              <option value="Rural">Rural</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Tipo de negócio</label>
            <select
              name="setorNegocio"
              value={localForm.setorNegocio ?? ''}
              onChange={handleField}
              className="w-full p-2 border border-gray-400 rounded-lg font-poppins cursor-pointer"
              required
            >
              <option value="">Selecione</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Venda">Venda</option>
            </select>
          </div>
        </div>
        {localForm.tipoNegocio && localForm.setorNegocio && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Tipo de imóvel</label>
            <select
              name="tipoImovel"
              value={localForm.tipoImovel ?? ''}
              onChange={handleField}
              className="w-full p-2 border border-gray-400 rounded-lg font-poppins cursor-pointer"
              required
            >
              <option value="">Selecione</option>
              {(opcoesTipoImovel[`${localForm.tipoNegocio}-${localForm.setorNegocio}`] || []).map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Preço</label>
            <input
              name="valor"
              placeholder="Ex: 500000"
              value={localForm.valor !== undefined && localForm.valor !== null ? String(localForm.valor) : ""}
              onChange={handleField}
              className="w-full p-2 border border-gray-400 rounded-lg font-poppins"
              required
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Metragem</label>
            <input
              name="metragem"
              placeholder="Ex: 120"
              value={localForm.metragem !== undefined && localForm.metragem !== null ? String(localForm.metragem) : ""}
              onChange={handleField}
              className="w-full p-2 border border-gray-400 rounded-lg font-poppins"
              required
              inputMode="numeric"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Cidade</label>
            <select
              name="cidade"
              value={localForm.cidade ?? ''}
              onChange={handleField}
              className="w-full p-2 border border-gray-400 rounded-lg font-poppins cursor-pointer"
              required
            >
              <option value="">Selecione</option>
              {Object.keys(cidadesComBairros).map((cidade) => (
                <option key={cidade} value={cidade}>
                  {cidade.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Bairro</label>
            <select
              name="bairro"
              value={localForm.bairro ?? ''}
              onChange={handleField}
              className="w-full p-2 border border-gray-400 rounded-lg font-poppins cursor-pointer"
              required
            >
              <option value="">Selecione</option>
              {(cidadesComBairros[localForm.cidade ?? ''] ?? []).map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Endereço detalhado</label>
          <input
            name="enderecoDetalhado"
            placeholder="Ex: Rua das Flores, 123, apto 45"
            value={localForm.enderecoDetalhado ?? ''}
            onChange={handleField}
            className="w-full p-2 border border-gray-400 rounded-lg font-poppins"
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Descrição</label>
          <textarea
            name="descricao"
            placeholder="Descrição do imóvel"
            value={localForm.descricao ?? ''}
            onChange={handleField}
            className="w-full p-2 border border-gray-400 rounded-lg font-poppins"
            rows={4}
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">WhatsApp</label>
          <input
            name="whatsapp"
            placeholder="(99) 99999-9999"
            value={localForm.whatsapp ?? ''}
            onChange={handleField}
            className="w-full p-2 border border-gray-400 rounded-lg font-poppins"
            required
            inputMode="tel"
            maxLength={15}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1 font-poppins">Patrocinador</label>
          <select
            name="patrocinador"
            value={localForm.patrocinador ?? ''}
            onChange={handleField}
            className="w-full p-2 border border-gray-400 rounded-lg font-poppins cursor-pointer"
            disabled={patrocinadores.length === 0}
          >
            <option value="">
              {patrocinadores.length > 0
                ? 'Selecionar patrocinador (opcional)'
                : 'Nenhum patrocinador cadastrado'}
            </option>
            {patrocinadores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Itens do imóvel */}
        {setorSelecionado && (
          <div className="mt-8">
            <div className="mb-2 flex items-center gap-2">
              <span className="block text-base font-semibold text-blue-900 font-poppins">
                Itens do imóvel
              </span>
              <span className="text-xs text-gray-500 font-poppins">(preencha o que for relevante)</span>
            </div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
              <ItensImovel
                itensDisponiveis={itensDisponiveis}
                itens={ensureItensAreNumbers(localForm.itens)}
                setItens={(novo) =>
                  setLocalForm((prev) => {
                    const prevItens = ensureItensAreNumbers(prev.itens);
                    return {
                      ...prev,
                      itens: typeof novo === "function" ? novo(prevItens) : novo,
                    };
                  })
                }
                ITENS_QUANTITATIVOS={ITENS_QUANTITATIVOS}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
              />
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition-colors font-semibold cursor-pointer font-poppins"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-semibold cursor-pointer disabled:bg-gray-400 font-poppins"
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}