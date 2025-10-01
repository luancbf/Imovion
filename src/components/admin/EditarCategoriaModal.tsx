'use client';

import { useState } from 'react';
import { FiX, FiUser, FiBriefcase, FiHome, FiShield } from 'react-icons/fi';
import { CategoriaUsuario, LIMITES_POR_CATEGORIA } from '@/types/usuarios';

interface EditarCategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario: {
    id: string;
    nome: string;
    email: string;
    categoria: CategoriaUsuario;
    limite_imoveis: number;
  } | null;
  onSave: (categoria: CategoriaUsuario) => Promise<boolean>;
}

export default function EditarCategoriaModal({ 
  isOpen, 
  onClose, 
  usuario, 
  onSave 
}: EditarCategoriaModalProps) {
  const [categoria, setCategoria] = useState<CategoriaUsuario>('usuario_comum');
  const [salvando, setSalvando] = useState(false);

  if (!isOpen || !usuario) return null;

  const handleSave = async () => {
    setSalvando(true);
    try {
      const sucesso = await onSave(categoria);
      if (sucesso) {
        onClose();
      }
    } finally {
      setSalvando(false);
    }
  };

  const getCategoriaInfo = (cat: CategoriaUsuario) => {
    switch (cat) {
      case 'usuario_comum':
        return {
          nome: 'Usuário Comum',
          limite: LIMITES_POR_CATEGORIA.usuario_comum,
          icone: FiUser,
          cor: 'text-gray-600',
          bgCor: 'bg-gray-100'
        };
      case 'corretor':
        return {
          nome: 'Corretor',
          limite: LIMITES_POR_CATEGORIA.corretor,
          icone: FiBriefcase,
          cor: 'text-blue-600',
          bgCor: 'bg-blue-100'
        };
      case 'imobiliaria':
        return {
          nome: 'Imobiliária',
          limite: LIMITES_POR_CATEGORIA.imobiliaria,
          icone: FiHome,
          cor: 'text-purple-600',
          bgCor: 'bg-purple-100'
        };
      case 'proprietario_com_plano':
        return {
          nome: 'Proprietário com Plano',
          limite: LIMITES_POR_CATEGORIA.proprietario_com_plano,
          icone: FiShield,
          cor: 'text-emerald-600',
          bgCor: 'bg-emerald-100'
        };
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            Editar Categoria do Usuário
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Informações do usuário */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-semibold text-gray-900">{usuario.nome}</p>
            <p className="text-sm text-gray-600">{usuario.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Categoria atual: {getCategoriaInfo(usuario.categoria).nome} 
              ({usuario.limite_imoveis} imóveis)
            </p>
          </div>

          {/* Seleção de categoria */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Nova Categoria:
            </label>
            
            {(['usuario_comum', 'corretor', 'imobiliaria', 'proprietario_com_plano'] as CategoriaUsuario[]).map((cat) => {
              const info = getCategoriaInfo(cat);
              const IconComponent = info.icone;
              
              return (
                <label
                  key={cat}
                  className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    categoria === cat
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="categoria"
                    value={cat}
                    checked={categoria === cat}
                    onChange={(e) => setCategoria(e.target.value as CategoriaUsuario)}
                    className="sr-only"
                  />
                  
                  <div className={`w-10 h-10 rounded-full ${info.bgCor} flex items-center justify-center mr-4`}>
                    <IconComponent className={info.cor} size={20} />
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{info.nome}</p>
                    <p className="text-sm text-gray-600">
                      Até {info.limite} imóvel{info.limite > 1 ? 'eis' : ''} por pagamento
                    </p>
                  </div>
                  
                  {categoria === cat && (
                    <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </label>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t">
          <button
            onClick={onClose}
            disabled={salvando}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={salvando}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {salvando ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
}