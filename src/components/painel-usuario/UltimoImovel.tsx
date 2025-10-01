"use client";

import Link from "next/link";
import { FiExternalLink, FiDollarSign, FiMapPin, FiCalendar } from "react-icons/fi";

interface Imovel {
  id: string;
  tipoimovel: string;
  cidade: string;
  bairro: string;
  valor: number;
  datacadastro: string;
}

interface UltimoImovelProps {
  ultimoImovel: Imovel;
  formatarMoeda: (valor: number) => string;
}

export default function UltimoImovel({ ultimoImovel, formatarMoeda }: UltimoImovelProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Último Imóvel Cadastrado
      </h2>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-blue-700">
            {ultimoImovel.tipoimovel}
          </h3>
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <FiMapPin size={16} />
            <span>
              {ultimoImovel.cidade}, {ultimoImovel.bairro}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <FiDollarSign size={16} />
            <span>{formatarMoeda(ultimoImovel.valor)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mt-1">
            <FiCalendar size={16} />
            <span>
              {new Date(ultimoImovel.datacadastro).toLocaleDateString("pt-BR")}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Link
            href={`/imoveis/${ultimoImovel.id}`}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiExternalLink size={16} />
            Ver Anúncio
          </Link>
          <Link
            href="/painel-usuario/meus-imoveis"
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Gerenciar
          </Link>
        </div>
      </div>
    </div>
  );
}