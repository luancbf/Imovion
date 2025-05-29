import { FaTimes } from 'react-icons/fa';
import type { Imovel } from '@/types/Imovel';
import { useRef } from 'react';

interface EditarImovelModalProps {
  open: boolean;
  form: Partial<Imovel>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  onClose: () => void;
  onSave: () => void;
  cidadesComBairros: Record<string, string[]>;
  opcoesTipoImovel: Record<string, string[]>;
  patrocinadores: { id: string; nome: string }[];
}

function formatCurrency(value: string) {
  const onlyNums = value.replace(/\D/g, '');
  const num = Number(onlyNums) / 100;
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPhone(value: string) {
  const onlyNums = value.replace(/\D/g, '');
  if (onlyNums.length <= 2) return onlyNums;
  if (onlyNums.length <= 7)
    return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2)}`;
  if (onlyNums.length <= 11)
    return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2, 7)}-${onlyNums.slice(7)}`;
  return `(${onlyNums.slice(0, 2)}) ${onlyNums.slice(2, 7)}-${onlyNums.slice(7, 11)}`;
}

function formatM2(value: string) {
  const onlyNums = value.replace(/\D/g, '');
  return onlyNums ? `${Number(onlyNums)} m²` : '';
}

export default function EditarImovelModal({
  open,
  form,
  onChange,
  onClose,
  onSave,
  cidadesComBairros,
  opcoesTipoImovel,
  patrocinadores,
}: EditarImovelModalProps) {
    const valorRef = useRef<HTMLInputElement>(null);
    const metragemRef = useRef<HTMLInputElement>(null);
    const whatsappRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const inputClass =
    "w-full p-2 border border-gray-400 rounded-lg bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition";
  const selectClass =
    "w-full p-2 border border-gray-400 rounded-lg bg-white text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition";
  const buttonYellow =
    "flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg transition-colors font-semibold cursor-pointer";
  const buttonGreen =
    "flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition-colors font-semibold cursor-pointer disabled:bg-gray-400";

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    let formatted = '';
    if (rawValue) {
      formatted = formatCurrency(rawValue);
    }
    onChange({
      ...e,
      target: {
        ...e.target,
        name: 'valor',
        value: formatted.replace(/\D/g, '') ? Number(rawValue) / 100 : '',
      }
    } as React.ChangeEvent<HTMLInputElement>);
    if (valorRef.current) valorRef.current.value = formatted;
  };

  const handleMetragemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    let formatted = '';
    if (rawValue) {
      formatted = formatM2(rawValue);
    }
    onChange({
      ...e,
      target: {
        ...e.target,
        name: 'metragem',
        value: rawValue ? Number(rawValue) : '',
      }
    } as React.ChangeEvent<HTMLInputElement>);
    if (metragemRef.current) metragemRef.current.value = formatted;
  };

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    let formatted = '';
    if (rawValue) {
      formatted = formatPhone(rawValue);
    }
    onChange({
      ...e,
      target: {
        ...e.target,
        name: 'whatsapp',
        value: rawValue,
      }
    } as React.ChangeEvent<HTMLInputElement>);
    if (whatsappRef.current) whatsappRef.current.value = formatted;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-lg mx-2 relative"
      >
        <button className="absolute top-3 right-3" onClick={onClose} type="button">
          <FaTimes size={22} />
        </button>
        <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">Editar Imóvel</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Setor de negociação</label>
            <select
              name="tipoNegocio"
              value={form.tipoNegocio || ''}
              onChange={onChange}
              className={selectClass}
              required
            >
              <option value="">Selecione</option>
              <option value="Residencial">Residencial</option>
              <option value="Comercial">Comercial</option>
              <option value="Rural">Rural</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Tipo de negócio</label>
            <select
              name="setorNegocio"
              value={form.setorNegocio || ''}
              onChange={onChange}
              className={selectClass}
              required
            >
              <option value="">Selecione</option>
              <option value="Aluguel">Aluguel</option>
              <option value="Venda">Venda</option>
            </select>
          </div>
        </div>
        {form.tipoNegocio && form.setorNegocio && (
          <div className="mt-4">
            <label className="block text-sm font-semibold text-blue-900 mb-1">Tipo de imóvel</label>
            <select
              name="tipoImovel"
              value={form.tipoImovel || ''}
              onChange={onChange}
              className={selectClass}
              required
            >
              <option value="">Selecione</option>
              {(opcoesTipoImovel[`${form.tipoNegocio}-${form.setorNegocio}`] || []).map((opcao) => (
                <option key={opcao} value={opcao}>
                  {opcao}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Preço</label>
            <input
              ref={valorRef}
              name="valor"
              placeholder="Ex: R$ 500.000,00"
              defaultValue={form.valor ? formatCurrency(String(Number(form.valor) * 100)) : ''}
              onChange={handleValorChange}
              className={inputClass}
              required
              inputMode="numeric"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Metragem</label>
            <input
              ref={metragemRef}
              name="metragem"
              placeholder="Ex: 120 m²"
              defaultValue={form.metragem ? formatM2(String(form.metragem)) : ''}
              onChange={handleMetragemChange}
              className={inputClass}
              required
              inputMode="numeric"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-semibold text-blue-900 mb-1">Cidade</label>
            <select
              name="cidade"
              value={form.cidade || ''}
              onChange={onChange}
              className={selectClass}
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
            <label className="block text-sm font-semibold text-blue-900 mb-1">Bairro</label>
            <select
              name="bairro"
              value={form.bairro || ''}
              onChange={onChange}
              className={selectClass}
              required
            >
              <option value="">Selecione</option>
              {(cidadesComBairros[form.cidade || ''] ?? []).map((bairro) => (
                <option key={bairro} value={bairro}>
                  {bairro}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1">Endereço detalhado</label>
          <input
            name="enderecoDetalhado"
            placeholder="Ex: Rua das Flores, 123, apto 45"
            value={form.enderecoDetalhado || ''}
            onChange={onChange}
            className={inputClass}
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1">Descrição</label>
          <textarea
            name="descricao"
            placeholder="Descrição do imóvel"
            value={form.descricao || ''}
            onChange={onChange}
            className={inputClass}
            rows={4}
            required
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1">WhatsApp</label>
          <input
            ref={whatsappRef}
            name="whatsapp"
            placeholder="(99) 99999-9999"
            defaultValue={form.whatsapp ? formatPhone(String(form.whatsapp)) : ''}
            onChange={handleWhatsappChange}
            className={inputClass}
            required
            inputMode="tel"
            maxLength={15}
          />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-semibold text-blue-900 mb-1">Patrocinador</label>
          <select
            name="patrocinador"
            value={form.patrocinador || ''}
            onChange={onChange}
            className={selectClass}
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
        <div className="flex flex-col md:flex-row gap-4 mt-8">
          <button
            type="button"
            onClick={onClose}
            className={buttonYellow}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className={buttonGreen}
          >
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  );
}