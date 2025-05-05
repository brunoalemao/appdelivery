import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddressForm {
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
}

interface Address {
  id: string;
  rua: string;
  numero: string;
  complemento?: string | null;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  padrao: boolean;
}

const Addresses: React.FC = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addressesLoading, setAddressesLoading] = useState(true);
  const navigate = useNavigate();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressForm>();

  useEffect(() => {
    fetchAddresses();
  }, [user]);

  const fetchAddresses = async () => {
    if (!user) return;
    setAddressesLoading(true);
    try {
      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('user_id', user.id)
        .order('padrao', { ascending: false });
      if (error) throw error;
      setAddresses(data || []);
    } catch (error) {
      toast.error('Erro ao buscar endereços');
    } finally {
      setAddressesLoading(false);
    }
  };

  const onEdit = (address: Address) => {
    setEditingId(address.id);
    reset({
      rua: address.rua,
      numero: address.numero,
      complemento: address.complemento || '',
      bairro: address.bairro,
      cidade: address.cidade,
      estado: address.estado,
      cep: address.cep,
    });
  };

  const onCancelEdit = () => {
    setEditingId(null);
    reset();
  };

  const onEditSubmit = async (formData: AddressForm) => {
    if (!user || !editingId) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('enderecos')
        .update({ ...formData })
        .eq('id', editingId);
      if (error) throw error;
      toast.success('Endereço atualizado!');
      setEditingId(null);
      fetchAddresses();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar endereço');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Meus Endereços</h1>
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label="Fechar"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>
      </div>
      {addressesLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : addresses.length === 0 ? (
        <p className="text-gray-600">Nenhum endereço cadastrado.</p>
      ) : (
        <div className="space-y-6">
          {addresses.map(address => (
            <div key={address.id} className="bg-white rounded-lg shadow p-4">
              {editingId === address.id ? (
                <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <Input label="CEP" type="text" placeholder="00000-000" error={errors.cep?.message} {...register('cep', { required: 'CEP é obrigatório' })} />
                    </div>
                    <div className="col-span-2">
                      <Input label="Rua" type="text" placeholder="Nome da rua" error={errors.rua?.message} {...register('rua', { required: 'Rua é obrigatória' })} />
                    </div>
                    <div className="col-span-1">
                      <Input label="Número" type="text" placeholder="123" error={errors.numero?.message} {...register('numero', { required: 'Número é obrigatório' })} />
                    </div>
                    <div className="col-span-1">
                      <Input label="Complemento" type="text" placeholder="Apto, Bloco, etc." error={errors.complemento?.message} {...register('complemento')} />
                    </div>
                    <div className="col-span-2">
                      <Input label="Bairro" type="text" placeholder="Seu bairro" error={errors.bairro?.message} {...register('bairro', { required: 'Bairro é obrigatório' })} />
                    </div>
                    <div className="col-span-1">
                      <Input label="Cidade" type="text" placeholder="Sua cidade" error={errors.cidade?.message} {...register('cidade', { required: 'Cidade é obrigatória' })} />
                    </div>
                    <div className="col-span-1">
                      <Input label="Estado" type="text" placeholder="UF" error={errors.estado?.message} {...register('estado', { required: 'Estado é obrigatório', maxLength: { value: 2, message: 'Use a sigla do estado (UF)' } })} />
                    </div>
                  </div>
                  <div className="flex space-x-3 pt-2">
                    <Button type="button" variant="outline" onClick={onCancelEdit} className="flex-1">Cancelar</Button>
                    <Button type="submit" className="flex-1" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mb-2">
                    <span className="font-medium text-gray-800">{address.rua}, {address.numero}</span>
                    <span className="text-sm text-gray-600 ml-2">{address.bairro}, {address.cidade} - {address.estado}</span>
                    <span className="text-sm text-gray-600 ml-2">CEP: {address.cep}</span>
                    {address.complemento && <span className="text-sm text-gray-600 ml-2">Comp: {address.complemento}</span>}
                    {address.padrao && <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Padrão</span>}
                  </div>
                  <Button onClick={() => onEdit(address)}>Editar</Button>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses; 