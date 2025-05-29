import { FaPlus, FaMinus } from "react-icons/fa";

interface Item {
  chave: string;
  label: string;
}

interface ItensImovelProps {
  itensDisponiveis: Item[];
  itens: Record<string, number>;
  setItens: React.Dispatch<React.SetStateAction<Record<string, number>>>;
  ITENS_QUANTITATIVOS: string[];
}

export default function ItensImovel({
  itensDisponiveis,
  itens,
  setItens,
  ITENS_QUANTITATIVOS,
}: ItensImovelProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-2">
      <h3 className="font-poppins text-lg font-bold text-blue-800 mb-3">Itens do imóvel</h3>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-3">
        {itensDisponiveis.map((item) => {
          const isQuant = ITENS_QUANTITATIVOS.includes(item.chave);
          return (
            <div
              key={item.chave}
              className="flex flex-col items-center bg-white rounded shadow px-2 py-2 min-w-0"
            >
              <label
                className="text-blue-900 font-inter text-xs sm:text-sm mb-1 text-center truncate w-full"
                htmlFor={item.chave}
                title={item.label}
              >
                {item.label}
              </label>
              {isQuant ? (
                <div className="flex items-center gap-2 w-full justify-center">
                  <button
                    type="button"
                    className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                    onClick={() =>
                      setItens((prev) => ({
                        ...prev,
                        [item.chave]: Math.max(0, (prev[item.chave] || 0) - 1),
                      }))
                    }
                    tabIndex={-1}
                  >
                    <FaMinus size={12} />
                  </button>
                  <input
                    id={item.chave}
                    type="number"
                    min={0}
                    value={itens[item.chave] || 0}
                    onChange={(e) =>
                      setItens((prev) => ({
                        ...prev,
                        [item.chave]: Math.max(0, Number(e.target.value)),
                      }))
                    }
                    className="w-10 text-center border border-gray-300 rounded text-xs sm:text-sm"
                  />
                  <button
                    type="button"
                    className="p-1 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                    onClick={() =>
                      setItens((prev) => ({
                        ...prev,
                        [item.chave]: (prev[item.chave] || 0) + 1,
                      }))
                    }
                    tabIndex={-1}
                  >
                    <FaPlus size={12} />
                  </button>
                </div>
              ) : (
                <input
                  id={item.chave}
                  type="checkbox"
                  checked={!!itens[item.chave]}
                  onChange={e =>
                    setItens((prev) => ({
                      ...prev,
                      [item.chave]: e.target.checked ? 1 : 0,
                    }))
                  }
                  className="accent-blue-600 w-5 h-5"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}