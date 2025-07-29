'use client';

import { FiMinus, FiPlus } from 'react-icons/fi';

interface ItemImovel {
  chave: string;
  nome: string;
  icone: string;
}

interface ItensImovelProps {
  itensDisponiveis: ItemImovel[];
  itens: Record<string, number>;
  setItens: (itens: Record<string, number>) => void;
  ITENS_QUANTITATIVOS: string[];
}

export default function ItensImovel({
  itensDisponiveis,
  itens,
  setItens,
  ITENS_QUANTITATIVOS,
}: ItensImovelProps) {
  const handleItemChange = (chave: string, valor: number) => {
    setItens({ ...itens, [chave]: Math.max(0, valor) });
  };

  const incrementar = (chave: string) => {
    handleItemChange(chave, (itens[chave] || 0) + 1);
  };

  const decrementar = (chave: string) => {
    handleItemChange(chave, (itens[chave] || 0) - 1);
  };

  if (itensDisponiveis.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">🏠</div>
        <p className="text-gray-500 font-medium">
          Selecione o tipo de negócio para ver as características disponíveis
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-3">
      {itensDisponiveis.map((item) => {
        const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
        const valorAtual = Number(itens[item.chave] || 0);
        const isAtivo = isQuant ? valorAtual > 0 : Number(itens[item.chave]) > 0;

        return (
          <div
            key={item.chave}
            className="bg-white rounded-lg border border-indigo-200 p-2 flex flex-col items-center justify-center transition-all duration-200 hover:shadow-md w-full min-h-[70px] select-none"
            tabIndex={-1}
            onMouseDown={e => e.preventDefault()}
          >
            <div className="flex items-center gap-2 mb-1 select-none">
              <span className="text-xl select-none">{item.icone}</span>
              <span className="font-medium text-indigo-900 text-xs select-none">{item.nome}</span>
            </div>
            {isQuant ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => decrementar(item.chave)}
                  className="w-7 h-7 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  disabled={valorAtual <= 0}
                  aria-label={`Diminuir ${item.nome}`}
                >
                  <FiMinus size={10} />
                </button>
                <div className="bg-indigo-50 rounded px-2 py-1 min-w-[32px] text-center select-none">
                  <span className="text-base font-bold text-indigo-900 select-none">
                    {valorAtual}
                  </span>
                </div>
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={e => e.preventDefault()}
                  onClick={() => incrementar(item.chave)}
                  className="w-7 h-7 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full flex items-center justify-center transition-colors duration-200 cursor-pointer"
                  aria-label={`Aumentar ${item.nome}`}
                >
                  <FiPlus size={10} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                tabIndex={-1}
                onMouseDown={e => e.preventDefault()}
                onClick={() => handleItemChange(item.chave, isAtivo ? 0 : 1)}
                className={`mt-1 w-5 h-5 rounded-full border-4 flex items-center justify-center transition-colors duration-200 cursor-pointer ${
                  isAtivo
                    ? 'bg-green-500 border-green-600'
                    : 'bg-gray-100 border-gray-300'
                }`}
                aria-pressed={isAtivo}
                aria-label={item.nome}
              >
                {isAtivo && (
                  <span className="w-3 h-3 bg-white rounded-full block select-none" />
                )}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}