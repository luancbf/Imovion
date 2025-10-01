"use client";

import Link from "next/link";
import { FiHome, FiPlus, FiMapPin, FiDollarSign, FiEdit3 } from "react-icons/fi";

interface Imovel {
  id: string;
  tipoimovel: string;
  cidade: string;
  bairro: string;
  valor: number;
  descricao: string;
  ativo: boolean;
  user_id: string;
  datacadastro: string;
}

interface ListaImoveisUsuarioProps {
  imoveis: Imovel[];
  formatarMoeda: (valor: number) => string;
  onEditarImovel: (imovel: Imovel) => void;
}

export default function ListaImoveisUsuario({ 
  imoveis, 
  formatarMoeda, 
  onEditarImovel 
}: ListaImoveisUsuarioProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FiHome className="text-blue-600 h-6 w-6" />
          <h2 className="text-xl font-bold text-gray-900">Meus Imóveis</h2>
        </div>
        <Link 
          href="/anunciar"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="h-4 w-4" />
          <span>Cadastrar Novo</span>
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <FiHome className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhum imóvel cadastrado
          </h3>
          <p className="text-gray-600 mb-4">
            Comece cadastrando seu primeiro imóvel para atrair compradores e locatários.
          </p>
          <Link 
            href="/painel-usuario/cadastrar-imovel"
            className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FiPlus className="h-4 w-4" />
            <span>Cadastrar Primeiro Imóvel</span>
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {imoveis.map((imovel) => (
            <div key={imovel.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {imovel.tipoimovel}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      imovel.ativo 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {imovel.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="h-4 w-4" />
                      <span>{imovel.cidade} - {imovel.bairro}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiDollarSign className="h-4 w-4" />
                      <span className="font-semibold text-blue-600">
                        {formatarMoeda(imovel.valor)}
                      </span>
                    </div>
                  </div>

                  {imovel.descricao && (
                    <p className="text-gray-600 text-sm mt-3 line-clamp-2">
                      {imovel.descricao}
                    </p>
                  )}
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  <button
                    onClick={() => onEditarImovel(imovel)}
                    className="flex items-center space-x-2 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <FiEdit3 className="h-4 w-4" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}