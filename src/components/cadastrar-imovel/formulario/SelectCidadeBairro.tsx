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
        {Object.keys(cidadesComBairros).map((c) => (
          <option key={c} value={c}>
            {c.replace(/_/g, ' ')}
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
        {(cidadesComBairros[cidade] ?? []).map((b, idx) => (
          <option key={`${b}-${idx}`} value={b}>
            {b}
          </option>
        ))}
      </select>
    </div>
  );
}