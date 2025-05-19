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

  return (
    <div className="bg-gray-600 p-4 rounded-lg mb-6">
      <h2 className="text-xl font-bold mb-4 text-white">Filtrar Imóveis Cadastrados</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-white mb-1">Setor</label>
          <select
            name="tipoNegocio"
            value={filtrosLocais.tipoNegocio}
            onChange={(e) => handleFiltroChange('tipoNegocio', e.target.value)}
            className="w-full p-2 bg-gray-500 text-white border rounded cursor-pointer"
          >
            <option value="">Todos os setores</option>
            <option value="Residencial">Residencial</option>
            <option value="Comercial">Comercial</option>
            <option value="Rural">Rural</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Tipo de Negócio</label>
          <select
            name="setorNegocio"
            value={filtrosLocais.setorNegocio}
            onChange={(e) => handleFiltroChange('setorNegocio', e.target.value)}
            className="w-full p-2 bg-gray-500 text-white border rounded cursor-pointer"
          >
            <option value="">Todos os tipos</option>
            <option value="Venda">Venda</option>
            <option value="Aluguel">Aluguel</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-1">Patrocinador</label>
          <select
            name="patrocinador"
            value={filtrosLocais.patrocinador}
            onChange={(e) => handleFiltroChange('patrocinador', e.target.value)}
            className="w-full p-2 bg-gray-500 text-white border rounded cursor-pointer"
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
          onClick={limparFiltros}
          className="bg-gray-500 hover:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
          aria-label="Limpar todos os filtros"
        >
          Limpar Filtros
        </button>
      </div>
    </div>
  );
}