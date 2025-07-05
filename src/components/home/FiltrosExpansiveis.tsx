'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FiltrosExpansiveis() {
  const [aberto, setAberto] = useState<null | "residencial" | "comercial" | "rural" | "anunciar">(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setAberto(null);
      }
    }
    if (aberto) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [aberto]);

  const botaoPrincipalClasse =
    "h-15 sm:h-20 w-70 text-white font-poppins font-bold text-lg sm:text-2xl shadow rounded transition-all duration-200 text-center flex items-center justify-center cursor-pointer hover:brightness-110";

  const botaoSecundarioClasse =
    "flex-1 px-1 py-1 sm:py-2 rounded transition-all duration-150 shadow font-poppins font-semibold text-base sm:text-xl cursor-pointer";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 justify-items-center" ref={containerRef}>
      {/* Residencial */}
      <div className="flex flex-col items-center w-full">
        <button
          className={`${botaoPrincipalClasse} bg-gradient-to-r from-blue-500 to-blue-700`}
          onClick={() => setAberto(aberto === "residencial" ? null : "residencial")}
          type="button"
        >
          RESIDENCIAL
        </button>
        {aberto === "residencial" && (
          <div className="flex flex-row gap-1 sm:gap-3 bg-blue-50 p-1 sm:p-4 py-3 rounded-b shadow-inner animate-fade-in w-full">
            <button
              className={`${botaoSecundarioClasse} bg-blue-400 hover:bg-blue-500 text-white`}
              onClick={() => router.push('/residencial/venda')}
            >
              Compra
            </button>
            <button
              className={`${botaoSecundarioClasse} bg-blue-400 hover:bg-blue-500 text-white`}
              onClick={() => router.push('/residencial/aluguel')}
            >
              Aluguel
            </button>
          </div>
        )}
      </div>

      {/* Comercial */}
      <div className="flex flex-col items-center w-full">
        <button
          className={`${botaoPrincipalClasse} bg-gradient-to-r from-green-500 to-green-700`}
          onClick={() => setAberto(aberto === "comercial" ? null : "comercial")}
          type="button"
        >
          COMERCIAL
        </button>
        {aberto === "comercial" && (
          <div className="flex flex-row gap-1 sm:gap-3 bg-green-50 p-1 sm:p-4 py-3 rounded-b shadow-inner animate-fade-in w-full">
            <button
              className={`${botaoSecundarioClasse} bg-green-400 hover:bg-green-500 text-white`}
              onClick={() => router.push('/comercial/venda')}
            >
              Compra
            </button>
            <button
              className={`${botaoSecundarioClasse} bg-green-400 hover:bg-green-500 text-white`}
              onClick={() => router.push('/comercial/aluguel')}
            >
              Aluguel
            </button>
          </div>
        )}
      </div>

      {/* Rural */}
      <div className="flex flex-col items-center w-full">
        <button
          className={`${botaoPrincipalClasse} bg-gradient-to-r from-yellow-600 to-yellow-800`}
          onClick={() => setAberto(aberto === "rural" ? null : "rural")}
          type="button"
        >
          RURAL
        </button>
        {aberto === "rural" && (
          <div className="flex flex-row gap-2 bg-yellow-50 p-1 sm:p-4 py-3 rounded-b shadow-inner animate-fade-in w-full">
            <button
              className={`${botaoSecundarioClasse} bg-yellow-500 hover:bg-yellow-600 text-white`}
              onClick={() => router.push('/rural/venda')}
            >
              Compra
            </button>
            <button
              className={`${botaoSecundarioClasse} bg-yellow-500 hover:bg-yellow-600 text-white`}
              onClick={() => router.push('/rural/aluguel')}
            >
              Aluguel
            </button>
          </div>
        )}
      </div>

      {/* Anunciar */}
      <div className="flex flex-col items-center w-full max-w-40 sm:max-w-70 col-span-1">
        <button
          className={`${botaoPrincipalClasse} bg-gradient-to-r from-gray-500 to-gray-700`}
          onClick={() => setAberto(aberto === "anunciar" ? null : "anunciar")}
          type="button"
        >
          ANUNCIAR
        </button>
        {aberto === "anunciar" && (
          <div className="bg-gray-50 p-4 sm:p-6 rounded-b shadow-inner animate-fade-in flex flex-col items-center w-full">
            <span className="text-gray-700 text-base sm:text-xl mb-4 text-center font-semibold">
              Anuncie aqui com a gente e alcance milhares de pessoas!
            </span>
            <button
              className="w-35 sm:w-45 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow transition-all duration-150 text-base sm:text-xl cursor-pointer"
              onClick={() => router.push('/anunciar')}
            >
              Anuncie já
            </button>
          </div>
        )}
      </div>
      
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.3s;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px);}
          to { opacity: 1; transform: translateY(0);}
        }
      `}</style>
    </div>
  );
}