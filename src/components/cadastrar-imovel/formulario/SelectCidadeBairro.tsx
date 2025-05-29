interface SelectCidadeBairroProps {
  cidadesComBairros: Record<string, string[]>;
  cidade: string;
  bairro: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  selectClass?: string;
}

export default function SelectCidadeBairro({
  cidadesComBairros,
  cidade,
  bairro,
  onChange,
  selectClass = "",
}: SelectCidadeBairroProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <select
        name="cidade"
        value={cidade}
        onChange={onChange}
        className={selectClass}
        required
      >
        <option value="">Selecione a cidade</option>
        {Object.keys(cidadesComBairros).map((cidade) => (
          <option key={cidade} value={cidade}>
            {cidade.replace(/_/g, ' ')}
          </option>
        ))}
      </select>

      <select
        name="bairro"
        value={bairro}
        onChange={onChange}
        className={selectClass}
        required
      >
        <option value="">Selecione o bairro</option>
        {(cidadesComBairros[cidade] ?? []).map((bairro) => (
          <option key={bairro} value={bairro}>
            {bairro}
          </option>
        ))}
      </select>
    </div>
  );
}