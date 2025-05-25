'use client';

import React from 'react';

interface VoltarButtonProps {
  className?: string;
}

const VoltarButton: React.FC<VoltarButtonProps> = ({ className = '' }) => {
  const voltarPagina = () => {
    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      }
    }
  };

  return (
    <button
      onClick={voltarPagina}
      className={`flex items-center gap-2 bg-gradient-to-r from-blue-400 to-blue-600 text-white px-6 py-3 rounded-xl font-bold text-lg shadow-lg hover:scale-105 hover:brightness-110 transition-all duration-200 cursor-pointer ${className}`}
    >
      <span className="text-xl">←</span> Voltar
    </button>
  );
};

export default VoltarButton;