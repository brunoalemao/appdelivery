import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { LogOut, User, MapPin, Clock, Settings, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../contexts/LayoutContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

interface ProfileFormData {
  nome: string;
  telefone: string;
}

const Profile: React.FC = () => {
  const { user, userProfile, signOut } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setPageTitle } = useLayout();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ProfileFormData>();
  
  useEffect(() => {
    setPageTitle('Meu Perfil');
    
    if (userProfile) {
      reset({
        nome: userProfile.nome,
        telefone: userProfile.telefone,
      });
    }
  }, [userProfile]);
  
  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('perfis')
        .update({
          nome: data.nome,
          telefone: data.telefone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      toast.success('Perfil atualizado com sucesso!');
      setEditing(false);
      
      // Recarregar a página para atualizar o userProfile
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
      console.error('Erro ao atualizar perfil:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <Layout>
      <div className="pb-20">
        <div className="bg-gradient-to-r from-red-500 to-red-600 h-32 relative">
          <div className="absolute -bottom-16 left-0 right-0 flex justify-center">
            <div className="bg-white h-32 w-32 rounded-full flex items-center justify-center shadow-md">
              <User size={64} className="text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="pt-20 px-4">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              {userProfile?.nome || 'Usuário'}
            </h1>
            <p className="text-gray-600">{user?.email}</p>
          </div>
          
          {editing ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-4 mb-6"
            >
              <h2 className="text-lg font-semibold mb-4">Editar Perfil</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Nome completo"
                  type="text"
                  error={errors.nome?.message}
                  {...register('nome', { 
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 3,
                      message: 'Nome deve ter pelo menos 3 caracteres'
                    }
                  })}
                />
                
                <Input
                  label="Telefone"
                  type="tel"
                  error={errors.telefone?.message}
                  {...register('telefone', { 
                    required: 'Telefone é obrigatório',
                    pattern: {
                      value: /^\(\d{2}\) \d{5}-\d{4}$/,
                      message: 'Telefone deve estar no formato (00) 00000-0000'
                    }
                  })}
                />
                
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditing(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-sm p-4 mb-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Informações Pessoais</h2>
                <button
                  onClick={() => setEditing(true)}
                  className="text-red-600 flex items-center text-sm"
                >
                  <Edit size={16} className="mr-1" />
                  Editar
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Nome</p>
                  <p className="font-medium">{userProfile?.nome}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Telefone</p>
                  <p className="font-medium">{userProfile?.telefone}</p>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="space-y-4">
            <button
              onClick={() => window.location.href = '/addresses'}
              className="bg-white w-full rounded-lg shadow-sm p-4 flex items-center"
            >
              <MapPin className="text-red-500 mr-3" size={20} />
              <span className="flex-1 text-left font-medium">Meus Endereços</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/orders'}
              className="bg-white w-full rounded-lg shadow-sm p-4 flex items-center"
            >
              <Clock className="text-red-500 mr-3" size={20} />
              <span className="flex-1 text-left font-medium">Histórico de Pedidos</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/settings'}
              className="bg-white w-full rounded-lg shadow-sm p-4 flex items-center"
            >
              <Settings className="text-red-500 mr-3" size={20} />
              <span className="flex-1 text-left font-medium">Configurações</span>
            </button>
            
            <Button
              onClick={handleSignOut}
              variant="outline"
              fullWidth
              className="mt-6"
              icon={<LogOut size={18} />}
            >
              Sair da Conta
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;