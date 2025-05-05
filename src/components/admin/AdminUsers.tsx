import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { User, Edit, Trash2, Check, X } from 'lucide-react';
import Button from '../Button';
import toast from 'react-hot-toast';

interface UserProfile {
  id: string;
  user_id: string;
  nome: string;
  telefone: string;
  is_admin: boolean;
  created_at: string;
  email?: string; // Adicionado da tabela auth.users
}

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Buscar perfis de usuários
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('nome');
      
      if (error) throw error;
      
      // Buscar emails dos usuários (isso normalmente exigiria permissões administrativas)
      // Na versão atual, apresentaremos apenas os dados disponíveis nos perfis
      
      setUsers(data || []);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  };
  
  const handleToggleAdmin = async (user: UserProfile) => {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ is_admin: !user.is_admin })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Atualizar a lista local
      setUsers(users.map(u => 
        u.id === user.id ? { ...u, is_admin: !u.is_admin } : u
      ));
      
      toast.success(`Usuário ${user.nome} ${!user.is_admin ? 'promovido a' : 'removido de'} administrador`);
    } catch (error) {
      console.error('Erro ao atualizar permissões do usuário:', error);
      toast.error('Erro ao atualizar permissões do usuário');
    }
  };
  
  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Tem certeza que deseja excluir o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
      return;
    }
    
    try {
      // Excluir o perfil do usuário
      const { error } = await supabase
        .from('perfis')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Atualizar a lista local
      setUsers(users.filter(u => u.id !== userId));
      
      toast.success(`Usuário ${userName} excluído com sucesso`);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Erro ao excluir usuário');
    }
  };
  
  const filteredUsers = users.filter(user => 
    user.nome.toLowerCase().includes(search.toLowerCase()) ||
    user.telefone.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Usuários</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <div>
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cadastro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admin
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nenhum usuário encontrado
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="h-6 w-6 text-gray-500" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.nome}</div>
                            <div className="text-sm text-gray-500">{user.email || user.user_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.telefone}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.is_admin ? (
                          <Check className="text-green-500" />
                        ) : (
                          <X className="text-gray-400" />
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-3">
                          <button
                            onClick={() => handleToggleAdmin(user)}
                            className={`text-sm px-2 py-1 rounded ${
                              user.is_admin 
                                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                                : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                            }`}
                            title={user.is_admin ? 'Remover admin' : 'Tornar admin'}
                          >
                            {user.is_admin ? 'Remover Admin' : 'Tornar Admin'}
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user.id, user.nome)}
                            className="text-sm px-2 py-1 rounded bg-red-100 text-red-600 hover:bg-red-200"
                            title="Excluir usuário"
                          >
                            Excluir
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;