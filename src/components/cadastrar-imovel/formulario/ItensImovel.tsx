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

  const itensQuantitativos = itensDisponiveis.filter(item => 
    ITENS_QUANTITATIVOS.includes(item.chave)
  );
  
  const itensBooleanos = itensDisponiveis.filter(item => 
    !ITENS_QUANTITATIVOS.includes(item.chave)
  );

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
    <div className="space-y-8">
      {/* Itens Quantitativos */}
      {itensQuantitativos.length > 0 && (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {itensQuantitativos.map((item) => (
              <div
                key={item.chave}
                className="bg-white rounded-xl border-2 border-indigo-200 p-4 hover:border-indigo-300 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{item.icone}</span>
                    <span className="font-medium text-indigo-900 text-sm">
                      {item.nome}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => decrementar(item.chave)}
                    className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={(itens[item.chave] || 0) <= 0}
                  >
                    <FiMinus size={14} />
                  </button>
                  
                  <div className="bg-indigo-50 rounded-lg px-4 py-2 min-w-[60px] text-center">
                    <span className="text-lg font-bold text-indigo-900">
                      {itens[item.chave] || 0}
                    </span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => incrementar(item.chave)}
                    className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-lg flex items-center justify-center transition-colors duration-200"
                  >
                    <FiPlus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Itens Booleanos (Sim/Não) */}
      {itensBooleanos.length > 0 && (
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {itensBooleanos.map((item) => {
              const isAtivo = (itens[item.chave] || 0) > 0;
              
              return (
                <button
                  key={item.chave}
                  type="button"
                  onClick={() => handleItemChange(item.chave, isAtivo ? 0 : 1)}
                  className={`relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02] ${
                    isAtivo
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-300 shadow-md'
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                  }`}
                >
                  {/* Indicador de status */}
                  <div className={`absolute top-2 right-2 w-3 h-3 rounded-full transition-colors duration-200 ${
                    isAtivo ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">{item.icone}</span>
                    <span className={`text-xs font-medium text-center leading-tight ${
                      isAtivo ? 'text-green-800' : 'text-gray-700'
                    }`}>
                      {item.nome}
                    </span>
                  </div>
                  
                  {/* Status text */}
                  <div className={`mt-1 text-xs font-bold ${
                    isAtivo ? 'text-green-600' : 'text-gray-400'
                  }`}>
                    {isAtivo ? 'SIM' : 'NÃO'}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Resumo dos itens selecionados */}
      <div className="bg-indigo-100 rounded-xl p-4 border border-indigo-200">
        <h5 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
          📋 Resumo das Características
        </h5>
        
        <div className="text-sm text-indigo-700">
          {(() => {
            const itensSelecionados = itensDisponiveis.filter(item => (itens[item.chave] || 0) > 0);
            
            if (itensSelecionados.length === 0) {
              return (
                <p className="italic text-indigo-600">
                  Nenhuma característica selecionada ainda
                </p>
              );
            }
            
            return (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {itensSelecionados.map(item => (
                  <div key={item.chave} className="flex items-center gap-2">
                    <span>{item.icone}</span>
                    <span className="font-medium">{item.nome}:</span>
                    <span className="font-bold text-indigo-900">
                      {ITENS_QUANTITATIVOS.includes(item.chave) 
                        ? itens[item.chave] 
                        : 'Sim'
                      }
                    </span>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}