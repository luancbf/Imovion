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
    "h-15 sm:h-20 w-45 sm:w-70 text-white font-poppins font-bold text-lg sm:text-2xl shadow rounded transition-all duration-300 text-center flex items-center justify-center cursor-pointer hover:brightness-110 transform hover:scale-105";

  const botaoSecundarioClasse =
    "flex-1 px-1 py-1 sm:py-2 rounded shadow font-poppins font-semibold text-base sm:text-xl cursor-pointer transform hover:scale-105 hover:shadow-lg";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 justify-items-center" ref={containerRef}>
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
          <div className="flex flex-row gap-1 sm:gap-3 bg-blue-50 p-1 sm:p-4 py-3 rounded-b shadow-inner w-full animate-in slide-in-from-top-2 duration-300">
            <button
              className={`${botaoSecundarioClasse} bg-blue-400 hover:bg-blue-500 text-white animate-in slide-in-from-left-4 duration-500 delay-100`}
              onClick={() => {
                if (typeof window !== "undefined" && window.gtag) {
                  window.gtag("event", "click_filtro_residencial", {
                    acao: "compra",
                    page_path: window.location.pathname,
                  });
                }
                router.push('/residencial/venda');
              }}
            >
              Compra
            </button>
            <button
              className={`${botaoSecundarioClasse} bg-blue-400 hover:bg-blue-500 text-white animate-in slide-in-from-right-4 duration-500 delay-200`}
              onClick={() => {
                if (typeof window !== "undefined" && window.gtag) {
                  window.gtag("event", "click_filtro_residencial", {
                    acao: "aluguel",
                    page_path: window.location.pathname,
                  });
                }
                router.push('/residencial/aluguel');
              }}
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
          <div className="flex flex-row gap-1 sm:gap-3 bg-green-50 p-1 sm:p-4 py-3 rounded-b shadow-inner w-full animate-in slide-in-from-top-2 duration-300">
            <button
              className={`${botaoSecundarioClasse} bg-green-400 hover:bg-green-500 text-white animate-in slide-in-from-left-4 duration-500 delay-100`}
              onClick={() => router.push('/comercial/venda')}
            >
              Compra
            </button>
            <button
              className={`${botaoSecundarioClasse} bg-green-400 hover:bg-green-500 text-white animate-in slide-in-from-right-4 duration-500 delay-200`}
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
          <div className="flex flex-row gap-2 bg-yellow-50 p-1 sm:p-4 py-3 rounded-b shadow-inner w-full animate-in slide-in-from-top-2 duration-300">
            <button
              className={`${botaoSecundarioClasse} bg-yellow-500 hover:bg-yellow-600 text-white animate-in slide-in-from-left-4 duration-500 delay-100`}
              onClick={() => router.push('/rural/venda')}
            >
              Compra
            </button>
            <button
              className={`${botaoSecundarioClasse} bg-yellow-500 hover:bg-yellow-600 text-white animate-in slide-in-from-right-4 duration-500 delay-200`}
              onClick={() => router.push('/rural/aluguel')}
            >
              Aluguel
            </button>
          </div>
        )}
      </div>

      {/* Anunciar */}
      <div className="flex flex-col items-center w-full max-w-45 sm:max-w-70 col-span-1">
        <button
          className={`${botaoPrincipalClasse} bg-gradient-to-r from-gray-500 to-gray-700`}
          onClick={() => setAberto(aberto === "anunciar" ? null : "anunciar")}
          type="button"
        >
          ANUNCIAR
        </button>
        {aberto === "anunciar" && (
          <div className="bg-gray-50 p-4 sm:p-6 rounded-b shadow-inner w-full flex flex-col items-center animate-in slide-in-from-top-2 duration-300">
            <span className="text-gray-700 text-base sm:text-xl mb-4 text-center font-semibold animate-in slide-in-from-bottom-4 duration-500 delay-100">
              Anuncie aqui com a gente e alcance milhares de pessoas!
            </span>
            <button
              className="w-35 sm:w-45 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow text-base sm:text-xl cursor-pointer transform hover:scale-105 animate-in slide-in-from-bottom-4 duration-500 delay-200"
              onClick={() => router.push('/anunciar')}
            >
              Anuncie já
            </button>
          </div>
        )}
      </div>
    </div>
  );
}