'use client';

import { useState } from 'react';
import { 
  FiX, 
  FiCreditCard, 
  FiDollarSign, 
  FiCalendar, 
  FiCheck,
  FiInfo 
} from 'react-icons/fi';
import { UsuarioComEstatisticas, Plano } from '@/types/usuarios';

interface GerenciamentoPlanosModalProps {
  usuario: UsuarioComEstatisticas;
  planos: Plano[];
  onClose: () => void;
  onAlterarPlano: (planoId: string, valorPago: number) => Promise<void>;
}

export default function GerenciamentoPlanosModal({
  usuario,
  planos,
  onClose,
  onAlterarPlano
}: GerenciamentoPlanosModalProps) {
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('');
  const [valorPago, setValorPago] = useState<number>(0);
  const [salvando, setSalvando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!planoSelecionado) {
      alert('Selecione um plano');
      return;
    }

    setSalvando(true);
    try {
      await onAlterarPlano(planoSelecionado, valorPago);
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
    } finally {
      setSalvando(false);
    }
  };

  const planoAtual = usuario.plano_atual;
  const planoSelecionadoObj = planos.find(p => p.id === planoSelecionado);

  // Atualizar valor quando selecionar plano
  const handlePlanoChange = (planoId: string) => {
    setPlanoSelecionado(planoId);
    const plano = planos.find(p => p.id === planoId);
    if (plano) {
      setValorPago(plano.valor);
    }
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gerenciar Plano</h2>
            <p className="text-gray-600 mt-1">
              {usuario.nome} {usuario.sobrenome} - {usuario.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Plano atual */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <FiInfo className="text-blue-600" />
            Plano Atual
          </h3>
          
          {planoAtual ? (
            <div className="bg-white rounded-lg p-4 border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">
                  {planoAtual.plano.nome}
                </span>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  planoAtual.status === 'ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {planoAtual.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Tipo:</span> {
                    planoAtual.plano.tipo === 'mensal' ? 'Mensal' : 'Por Anúncio'
                  }
                </div>
                <div>
                  <span className="font-medium">Valor:</span> {formatarValor(planoAtual.plano.valor)}
                </div>
                <div>
                  <span className="font-medium">Início:</span> {
                    new Date(planoAtual.data_inicio).toLocaleDateString('pt-BR')
                  }
                </div>
                <div>
                  <span className="font-medium">Valor Pago:</span> {formatarValor(planoAtual.valor_pago)}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-500 italic">
              Usuário não possui plano ativo
            </div>
          )}
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiCreditCard className="text-purple-600" />
            {planoAtual ? 'Alterar para Novo Plano' : 'Definir Plano'}
          </h3>

          {/* Seleção de plano */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Selecionar Plano
            </label>
            
            <div className="grid gap-3">
              {planos.map((plano) => (
                <label
                  key={plano.id}
                  className={`
                    relative border rounded-lg p-4 cursor-pointer transition-all
                    ${planoSelecionado === plano.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="plano"
                    value={plano.id}
                    checked={planoSelecionado === plano.id}
                    onChange={(e) => handlePlanoChange(e.target.value)}
                    className="sr-only"
                  />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">
                        {plano.nome}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {plano.descricao}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-gray-600">
                          Tipo: <span className="font-medium">
                            {plano.tipo === 'mensal' ? 'Mensal' : 'Por Anúncio'}
                          </span>
                        </span>
                        {plano.limite_imoveis && (
                          <span className="text-gray-600">
                            Limite: <span className="font-medium">
                              {plano.limite_imoveis} imóveis
                            </span>
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        {formatarValor(plano.valor)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {plano.tipo === 'mensal' ? 'por mês' : 'por anúncio'}
                      </div>
                    </div>
                  </div>

                  {planoSelecionado === plano.id && (
                    <div className="absolute top-4 right-4">
                      <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                        <FiCheck className="text-white" size={12} />
                      </div>
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>

          {/* Valor pago */}
          {planoSelecionadoObj && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor a ser Cobrado
              </label>
              
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={valorPago}
                  onChange={(e) => setValorPago(Number(e.target.value))}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0,00"
                />
              </div>
              
              <div className="mt-2 text-sm text-gray-600">
                Valor sugerido: {formatarValor(planoSelecionadoObj.valor)}
              </div>
            </div>
          )}

          {/* Informações adicionais */}
          {planoSelecionadoObj && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <FiCalendar className="text-blue-600 mt-0.5" size={16} />
                <div className="text-sm">
                  <p className="text-blue-800 font-medium">
                    {planoSelecionadoObj.tipo === 'mensal' 
                      ? 'Plano Mensal' 
                      : 'Plano por Anúncio'
                    }
                  </p>
                  <p className="text-blue-700 mt-1">
                    {planoSelecionadoObj.tipo === 'mensal' 
                      ? 'O usuário será cobrado mensalmente e poderá publicar imóveis ilimitados durante o período ativo.'
                      : 'O usuário será cobrado por cada imóvel publicado individualmente.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="submit"
              disabled={!planoSelecionado || salvando}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {salvando ? 'Salvando...' : (planoAtual ? 'Alterar Plano' : 'Definir Plano')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}