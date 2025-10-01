"use client";

import React, { useState } from 'react';
import { FiEdit3, FiSave, FiX, FiDollarSign, FiFileText } from 'react-icons/fi';
import { supabase } from '@/lib/supabase';
import { formatarParaMoeda } from '@/utils/formatters';

interface Imovel {
  id: string;
  tipoimovel: string;
  cidade: string;
  bairro: string;
  valor: number;
  descricao: string;
  datacadastro?: string;
  ativo?: boolean;
  user_id?: string;
}

interface EditarImovelModalProps {
  imovel: Imovel;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditarImovelModal({ imovel, isOpen, onClose, onSuccess }: EditarImovelModalProps) {
  const [loading, setLoading] = useState(false);
  const [valor, setValor] = useState(imovel.valor.toString());
  const [descricao, setDescricao] = useState(imovel.descricao || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleValorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarParaMoeda(e.target.value);
    setValor(valorFormatado);
  };

  const handleSalvar = async () => {
    setLoading(true);
    setError('');

    try {
      // Converter valor formatado para número
      const valorNumerico = parseFloat(valor.replace(/[^\d,]/g, '').replace(',', '.'));
      
      if (isNaN(valorNumerico) || valorNumerico <= 0) {
        setError('Por favor, insira um valor válido');
        setLoading(false);
        return;
      }

      if (!descricao.trim()) {
        setError('Por favor, insira uma descrição');
        setLoading(false);
        return;
      }

      const { error: updateError } = await supabase
        .from('imoveis')
        .update({
          valor: valorNumerico,
          descricao: descricao.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', imovel.id)
        .eq('user_id', imovel.user_id); // Garantir que só o dono pode editar

      if (updateError) {
        throw new Error(updateError.message);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar alterações');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiEdit3 className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Editar Imóvel</h2>
              <p className="text-sm text-gray-500">{imovel.tipoimovel} - {imovel.cidade}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Informações do imóvel (não editáveis) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">Informações do Imóvel</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Tipo:</span> {imovel.tipoimovel}</p>
              <p><span className="font-medium">Localização:</span> {imovel.cidade} - {imovel.bairro}</p>
              <p><span className="font-medium">Código:</span> #{imovel.id.slice(0, 8)}</p>
            </div>
            <div className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded">
              ⚠️ Apenas valor e descrição podem ser editados
            </div>
          </div>

          {/* Valor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiDollarSign className="inline h-4 w-4 mr-1" />
              Valor
            </label>
            <input
              type="text"
              value={valor}
              onChange={handleValorChange}
              placeholder="Ex: R$ 250.000"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-medium"
            />
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FiFileText className="inline h-4 w-4 mr-1" />
              Descrição
            </label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva as características do imóvel..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              {descricao.length}/500 caracteres
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <FiSave className="h-4 w-4" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}