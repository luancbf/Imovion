'use client';

import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiCalendar, FiShield, FiTrash2, FiEdit3, FiAward } from 'react-icons/fi';
import { useUsuarios, Usuario } from '@/hooks/admin/useUsuarios';
import ConfirmModal from '@/components/ui/ConfirmModal';

interface UsuariosListProps {
  filtros?: {
    busca: string;
    role: string;
    corretor: boolean | null;
  };
}

export default function UsuariosList({ filtros }: UsuariosListProps) {
  const { usuarios, loading, updateUserRole, deleteUser } = useUsuarios();
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Usuario | null>(null);

  // Filtrar usuários
  const usuariosFiltrados = usuarios.filter(usuario => {
    if (filtros?.busca) {
      const busca = filtros.busca.toLowerCase();
      const match = 
        usuario.nome?.toLowerCase().includes(busca) ||
        usuario.sobrenome?.toLowerCase().includes(busca) ||
        usuario.email?.toLowerCase().includes(busca) ||
        usuario.telefone?.includes(busca);
      if (!match) return false;
    }
    
    if (filtros?.role && filtros.role !== 'todos') {
      if (usuario.role !== filtros.role) return false;
    }
    
    if (filtros?.corretor !== null) {
      if (usuario.corretor !== filtros.corretor) return false;
    }
    
    return true;
  });

  const handleRoleChange = async (userId: string, newRole: 'user' | 'admin') => {
    const success = await updateUserRole(userId, newRole);
    if (success) {
      setEditingUser(null);
    }
  };

  const handleDelete = async () => {
    if (confirmDelete) {
      const success = await deleteUser(confirmDelete.id);
      if (success) {
        setConfirmDelete(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            Usuários Cadastrados ({usuariosFiltrados.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usuário
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cadastro
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {usuariosFiltrados.map(usuario => (
                <tr key={usuario.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FiUser className="text-blue-600" size={20} />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {usuario.nome} {usuario.sobrenome}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {usuario.id.slice(0, 8)}...
                        </div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiMail size={14} className="mr-1 text-gray-400" />
                        {usuario.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <FiPhone size={14} className="mr-1 text-gray-400" />
                        {usuario.telefone}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        {editingUser === usuario.id ? (
                          <select
                            value={usuario.role}
                            onChange={(e) => handleRoleChange(usuario.id, e.target.value as 'user' | 'admin')}
                            className="text-sm border rounded px-2 py-1"
                          >
                            <option value="user">Usuário</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            usuario.role === 'admin' 
                              ? 'bg-red-100 text-red-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            <FiShield size={12} className="mr-1" />
                            {usuario.role === 'admin' ? 'Admin' : 'Usuário'}
                          </span>
                        )}
                      </div>
                      {usuario.corretor && (
                        <div className="flex items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FiAward size={12} className="mr-1" />
                            Corretor
                          </span>
                        </div>
                      )}
                      {usuario.creci && (
                        <div className="text-xs text-gray-500">
                          CRECI: {usuario.creci}
                        </div>
                      )}
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      usuario.email_confirmed_at 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {usuario.email_confirmed_at ? '✓ Confirmado' : '⏳ Pendente'}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar size={14} className="mr-1" />
                      {formatDate(usuario.created_at)}
                    </div>
                    {usuario.last_sign_in_at && (
                      <div className="text-xs text-gray-400 mt-1">
                        Último login: {formatDate(usuario.last_sign_in_at)}
                      </div>
                    )}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => setEditingUser(editingUser === usuario.id ? null : usuario.id)}
                        className="text-blue-600 hover:text-blue-900 transition"
                        title="Editar role"
                      >
                        <FiEdit3 size={16} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(usuario)}
                        className="text-red-600 hover:text-red-900 transition"
                        title="Deletar usuário"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {usuariosFiltrados.length === 0 && (
          <div className="text-center py-12">
            <FiUser size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum usuário encontrado
            </h3>
            <p className="text-gray-500">
              Não há usuários que correspondam aos filtros aplicados.
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!confirmDelete}
        title="Excluir Usuário"
        message={`Deseja excluir permanentemente o usuário "${confirmDelete?.nome} ${confirmDelete?.sobrenome}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}