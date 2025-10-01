'use client';

import { useState } from 'react';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiCalendar, 
  FiAward, 
  FiCreditCard,
  FiHome,
  FiTrendingUp,
  FiShield,
  FiBriefcase,
  FiSettings
} from 'react-icons/fi';
import { useGerenciamentoUsuarios } from '@/hooks/useGerenciamentoUsuarios';
import { FiltrosUsuarios, UsuarioComEstatisticas, CategoriaUsuario } from '@/types/usuarios';
import { TipoUsuario, PlanoUsuario } from '@/constants/tiposUsuarioPlanos';
import EditarCategoriaModal from './EditarCategoriaModal';
import ConfigurarUsuarioModal from './usuarios/ConfigurarUsuarioModal';
// import GerenciamentoPlanosModal from './GerenciamentoPlanosModal';

interface GerenciamentoUsuariosListProps {
  filtros: FiltrosUsuarios;
}

export default function GerenciamentoUsuariosList({ filtros }: GerenciamentoUsuariosListProps) {
  const { 
    loading, 
    filtrarUsuarios, 
    alterarCategoriaUsuario
  } = useGerenciamentoUsuarios();
  
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<UsuarioComEstatisticas | null>(null);
  const [modalCategoriaAberto, setModalCategoriaAberto] = useState(false);
  const [modalConfiguracaoAberto, setModalConfiguracaoAberto] = useState(false);

  const usuariosFiltrados = filtrarUsuarios(filtros);

  const formatarData = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const fecharModalCategoria = () => {
    setUsuarioSelecionado(null);
    setModalCategoriaAberto(false);
  };

  const abrirModalConfiguracao = (usuario: UsuarioComEstatisticas) => {
    setUsuarioSelecionado(usuario);
    setModalConfiguracaoAberto(true);
  };

  const fecharModalConfiguracao = () => {
    setUsuarioSelecionado(null);
    setModalConfiguracaoAberto(false);
  };

  const handleAlterarCategoria = async (novaCategoria: CategoriaUsuario): Promise<boolean> => {
    if (usuarioSelecionado) {
      const sucesso = await alterarCategoriaUsuario(usuarioSelecionado.id, novaCategoria);
      if (sucesso) {
        fecharModalCategoria();
      }
      return sucesso;
    }
    return false;
  };

  const handleSalvarConfiguracoes = async (
    usuarioId: string, 
    dados: { tipo_usuario: TipoUsuario; plano_ativo: PlanoUsuario }
  ): Promise<void> => {
    try {
      // Aqui você chamaria o endpoint da API para atualizar o usuário
      const response = await fetch(`/api/admin/usuarios/${usuarioId}/configurar`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações');
      }

      // Atualizar a lista de usuários (você pode implementar um refetch aqui)
      window.location.reload(); // Temporário - idealmente seria um refetch
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Usuários Cadastrados ({usuariosFiltrados.length})
            </h2>
            
            {/* Resumo rápido */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <FiUser className="text-blue-600" />
                {usuariosFiltrados.filter(u => u.categoria === 'usuario_comum').length} Comum
              </span>
              <span className="flex items-center gap-1">
                <FiAward className="text-green-600" />
                {usuariosFiltrados.filter(u => u.categoria === 'corretor').length} Corretores
              </span>
              <span className="flex items-center gap-1">
                <FiBriefcase className="text-purple-600" />
                {usuariosFiltrados.filter(u => u.categoria === 'imobiliaria').length} Imobiliárias
              </span>
              <span className="flex items-center gap-1">
                <FiShield className="text-emerald-600" />
                {usuariosFiltrados.filter(u => u.categoria === 'proprietario_com_plano').length} Proprietários
              </span>
              <span className="flex items-center gap-1">
                <FiCreditCard className="text-orange-600" />
                {usuariosFiltrados.filter(u => u.plano_atual?.status === 'ativo').length} com Planos
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {usuariosFiltrados.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FiUser size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg">Nenhum usuário encontrado</p>
              <p className="text-sm">Tente ajustar os filtros de busca</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {usuariosFiltrados.map((usuario) => (
                <div key={usuario.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    {/* Informações do usuário */}
                    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Dados pessoais */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2">
                            <FiUser className="text-gray-400" size={16} />
                            <span className="font-semibold text-gray-900">
                              {usuario.nome} {usuario.sobrenome}
                            </span>
                          </div>
                          
                          {usuario.categoria === 'corretor' && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                              <FiAward size={12} className="mr-1" />
                              Corretor
                            </span>
                          )}
                          
                          {usuario.categoria === 'imobiliaria' && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                              <FiBriefcase size={12} className="mr-1" />
                              Imobiliária
                            </span>
                          )}
                          
                          {usuario.categoria === 'proprietario_com_plano' && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-emerald-100 text-emerald-800 rounded-full">
                              <FiShield size={12} className="mr-1" />
                              Proprietário Plano
                            </span>
                          )}
                          
                          {usuario.creci && (
                            <span className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              <FiShield size={12} className="mr-1" />
                              CRECI: {usuario.creci}
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiMail size={14} />
                          {usuario.email}
                        </div>
                        
                        {usuario.telefone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FiPhone size={14} />
                            {usuario.telefone}
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FiCalendar size={14} />
                          Cadastrado em {formatarData(usuario.created_at)}
                        </div>
                      </div>

                      {/* Estatísticas */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Estatísticas</h4>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <FiHome className="text-blue-500" size={14} />
                          <span className="text-gray-600">
                            {usuario.total_imoveis} imóveis total
                          </span>
                          <span className="text-green-600 font-medium">
                            ({usuario.imoveis_ativos} ativos)
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm">
                          <FiTrendingUp className="text-green-500" size={14} />
                          <span className="text-gray-600">Receita:</span>
                          <span className="font-semibold text-green-600">
                            {formatarValor(usuario.receita_total)}
                          </span>
                        </div>
                      </div>

                      {/* Plano atual */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-700">Plano Atual</h4>
                        
                        {usuario.plano_atual ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FiCreditCard className="text-purple-500" size={14} />
                              <span className="font-medium text-purple-700">
                                {usuario.plano_atual.plano.nome}
                              </span>
                              <span className={`px-2 py-1 text-xs rounded-full ${
                                usuario.plano_atual.status === 'ativo' 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {usuario.plano_atual.status}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Tipo: {usuario.plano_atual.plano.tipo === 'mensal' ? 'Mensal' : 'Por Anúncio'}
                            </div>
                            
                            <div className="text-sm text-gray-600">
                              Valor: {formatarValor(usuario.plano_atual.plano.valor)}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">
                            Nenhum plano ativo
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        onClick={() => abrirModalConfiguracao(usuario)}
                        className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <FiSettings size={14} />
                        Configurar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de edição de categoria */}
      <EditarCategoriaModal
        isOpen={modalCategoriaAberto}
        usuario={usuarioSelecionado}
        onClose={fecharModalCategoria}
        onSave={handleAlterarCategoria}
      />

      {/* Modal de configuração de usuário e plano */}
      {usuarioSelecionado && (
        <ConfigurarUsuarioModal
          usuario={usuarioSelecionado}
          isOpen={modalConfiguracaoAberto}
          onClose={fecharModalConfiguracao}
          onSave={handleSalvarConfiguracoes}
        />
      )}
    </>
  );
}