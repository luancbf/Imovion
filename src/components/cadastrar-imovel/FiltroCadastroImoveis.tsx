'use client';

import { useState, useEffect } from 'react';

interface FiltroCadastroImoveisProps {
  patrocinadores: { id: string; nome: string }[];
  onFiltroChange: (filtros: {
    tipoNegocio: string;
    setorNegocio: string;
    patrocinador: string;
  }) => void;
}

export default function FiltroCadastroImoveis({
  patrocinadores,
  onFiltroChange
}: FiltroCadastroImoveisProps) {
  const [filtrosLocais, setFiltrosLocais] = useState({
    tipoNegocio: '',
    setorNegocio: '',
    patrocinador: ''
  });

  useEffect(() => {
    onFiltroChange(filtrosLocais);
  }, [filtrosLocais, onFiltroChange]);

  const handleFiltroChange = (name: string, value: string) => {
    setFiltrosLocais(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const limparFiltros = () => {
    setFiltrosLocais({
      tipoNegocio: '',
      setorNegocio: '',
      patrocinador: ''
    });
  };

  const selectClass =
    "w-full p-2 border border-gray-300 rounded-lg bg-white text-black cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition";
  const buttonClass =
    "bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-colors font-semibold cursor-pointer";

  return (
    <div className="bg-white/90 p-4 md:p-8 rounded-2xl shadow flex flex-col gap-4 w-full max-w-6xl mx-auto">
      <h2 className="font-poppins text-lg md:text-xl font-bold mb-2 text-blue-900">Filtrar Imóveis</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="font-poppins block text-sm font-medium text-blue-900 mb-1">Setor</label>
          <select
            name="tipoNegocio"
            value={filtrosLocais.tipoNegocio}
            onChange={(e) => handleFiltroChange('tipoNegocio', e.target.value)}
            className={selectClass}
          >
            <option value="">Todos os setores</option>
            <option value="Residencial">Residencial</option>
            <option value="Comercial">Comercial</option>
            <option value="Rural">Rural</option>
          </select>
        </div>

        <div>
          <label className="font-poppins block text-sm font-medium text-blue-900 mb-1">Tipo de Negócio</label>
          <select
            name="setorNegocio"
            value={filtrosLocais.setorNegocio}
            onChange={(e) => handleFiltroChange('setorNegocio', e.target.value)}
            className={selectClass}
          >
            <option value="">Todos os tipos</option>
            <option value="Venda">Venda</option>
            <option value="Aluguel">Aluguel</option>
          </select>
        </div>

        <div>
          <label className="font-poppins block text-sm font-medium text-blue-900 mb-1">Patrocinador</label>
          <select
            name="patrocinador"
            value={filtrosLocais.patrocinador}
            onChange={(e) => handleFiltroChange('patrocinador', e.target.value)}
            className={selectClass}
            disabled={patrocinadores.length === 0}
          >
            <option value="">Todos os patrocinadores</option>
            {patrocinadores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={limparFiltros}
          className={buttonClass}
          aria-label="Limpar todos os filtros"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}