import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { MapPin, Home, Building, CreditCard, Wallet, Truck, QrCode } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLayout } from '../contexts/LayoutContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import Input from '../components/Input';
import toast from 'react-hot-toast';

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
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  padrao: boolean;
}

const PaymentMethod = {
  CREDIT_CARD: 'credit_card',
  CASH: 'cash',
  PIX: 'pix',
};

const Checkout: React.FC = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addingNewAddress, setAddingNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(PaymentMethod.CREDIT_CARD);
  const [loading, setLoading] = useState(false);
  const [addressesLoading, setAddressesLoading] = useState(true);
  
  const { user, userProfile } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  
  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>();
  
  useEffect(() => {
    setPageTitle('Finalizar Pedido');
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    
    fetchAddresses();
  }, []);
  
  const fetchAddresses = async () => {
    if (!user) return;
    
    try {
      setAddressesLoading(true);
      const { data, error } = await supabase
        .from('enderecos')
        .select('*')
        .eq('user_id', user.id)
        .order('padrao', { ascending: false });
      
      if (error) throw error;
      
      setAddresses(data || []);
      
      // Selecionar o endereço padrão se existir
      const defaultAddress = data?.find(addr => addr.padrao);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      } else if (data && data.length > 0) {
        setSelectedAddressId(data[0].id);
      } else {
        setAddingNewAddress(true);
      }
    } catch (error) {
      console.error('Erro ao buscar endereços:', error);
    } finally {
      setAddressesLoading(false);
    }
  };
  
  const onAddressSubmit = async (formData: AddressForm) => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Verificar se é o primeiro endereço
      const isFirstAddress = addresses.length === 0;
      
      const { data, error } = await supabase
        .from('enderecos')
        .insert({
          user_id: user.id,
          rua: formData.rua,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
          cep: formData.cep,
          padrao: isFirstAddress, // Primeiro endereço é o padrão
        })
        .select();
      
      if (error) throw error;
      
      toast.success('Endereço adicionado com sucesso!');
      await fetchAddresses();
      
      // Selecionar o novo endereço
      if (data && data.length > 0) {
        setSelectedAddressId(data[0].id);
        setAddingNewAddress(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar endereço');
      console.error('Erro ao adicionar endereço:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const createOrder = async () => {
    if (!user || !selectedAddressId) return;
    
    try {
      setLoading(true);
      
      // Encontrar o endereço selecionado
      const selectedAddress = addresses.find(a => a.id === selectedAddressId);
      if (!selectedAddress) {
        toast.error('Selecione um endereço de entrega');
        return;
      }
      
      // Formatar o endereço para o pedido
      const endereco_entrega = `${selectedAddress.rua}, ${selectedAddress.numero}, ${selectedAddress.bairro}, ${selectedAddress.cidade} - ${selectedAddress.estado}, ${selectedAddress.cep} ${selectedAddress.complemento ? `(${selectedAddress.complemento})` : ''}`;
      
      // Criar o pedido
      const { data: orderData, error: orderError } = await supabase
        .from('pedidos')
        .insert({
          user_id: user.id,
          status: 'pending',
          total: totalPrice + 5, // Adicionar taxa de entrega
          endereco_entrega,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;
      
      if (!orderData) {
        throw new Error('Erro ao criar pedido');
      }
      
      // Adicionar os itens do pedido
      const orderItems = items.map(item => ({
        pedido_id: orderData.id,
        produto_id: item.product.id,
        quantidade: item.quantity,
        preco_unitario: item.product.preco,
        observacao: item.observacao || null,
      }));
      
      const { error: itemsError } = await supabase
        .from('itens_pedido')
        .insert(orderItems);
      
      if (itemsError) throw itemsError;
      
      // Limpar o carrinho
      clearCart();
      
      toast.success('Pedido realizado com sucesso!');
      navigate('/orders');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao realizar pedido');
      console.error('Erro ao realizar pedido:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="pb-20">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Finalizar Pedido</h1>
          
          {/* Endereço de entrega */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center mb-4">
              <MapPin className="mr-2 text-red-500" size={20} />
              <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
            </div>
            
            {addressesLoading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
              </div>
            ) : (
              <>
                {addresses.length > 0 && !addingNewAddress && (
                  <div className="space-y-3 mb-4">
                    {addresses.map(address => (
                      <div
                        key={address.id}
                        onClick={() => setSelectedAddressId(address.id)}
                        className={`border ${
                          selectedAddressId === address.id
                            ? 'border-red-500 bg-red-50'
                            : 'border-gray-200'
                        } rounded-lg p-3 cursor-pointer transition-all duration-200`}
                      >
                        <div className="flex items-start">
                          {address.padrao ? (
                            <Home className="text-red-500 mr-2 flex-shrink-0 mt-1" size={18} />
                          ) : (
                            <Building className="text-gray-400 mr-2 flex-shrink-0 mt-1" size={18} />
                          )}
                          
                          <div>
                            <p className="font-medium text-gray-800">
                              {address.padrao && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded mr-2">Padrão</span>}
                              {address.rua}, {address.numero}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.bairro}, {address.cidade} - {address.estado}
                            </p>
                            <p className="text-sm text-gray-600">CEP: {address.cep}</p>
                            {address.complemento && (
                              <p className="text-sm text-gray-600">Complemento: {address.complemento}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {addingNewAddress ? (
                  <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="col-span-2">
                        <Input
                          label="CEP"
                          type="text"
                          placeholder="00000-000"
                          error={errors.cep?.message}
                          {...register('cep', { 
                            required: 'CEP é obrigatório',
                          })}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Input
                          label="Rua"
                          type="text"
                          placeholder="Nome da rua"
                          error={errors.rua?.message}
                          {...register('rua', { required: 'Rua é obrigatória' })}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Input
                          label="Número"
                          type="text"
                          placeholder="123"
                          error={errors.numero?.message}
                          {...register('numero', { required: 'Número é obrigatório' })}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Input
                          label="Complemento"
                          type="text"
                          placeholder="Apto, Bloco, etc."
                          error={errors.complemento?.message}
                          {...register('complemento')}
                        />
                      </div>
                      
                      <div className="col-span-2">
                        <Input
                          label="Bairro"
                          type="text"
                          placeholder="Seu bairro"
                          error={errors.bairro?.message}
                          {...register('bairro', { required: 'Bairro é obrigatório' })}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Input
                          label="Cidade"
                          type="text"
                          placeholder="Sua cidade"
                          error={errors.cidade?.message}
                          {...register('cidade', { required: 'Cidade é obrigatória' })}
                        />
                      </div>
                      
                      <div className="col-span-1">
                        <Input
                          label="Estado"
                          type="text"
                          placeholder="UF"
                          error={errors.estado?.message}
                          {...register('estado', { 
                            required: 'Estado é obrigatório',
                            maxLength: { value: 2, message: 'Use a sigla do estado (UF)' }
                          })}
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3 pt-2">
                      {addresses.length > 0 && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setAddingNewAddress(false)}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                      )}
                      
                      <Button
                        type="submit"
                        className="flex-1"
                        disabled={loading}
                      >
                        {loading ? 'Salvando...' : 'Salvar Endereço'}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setAddingNewAddress(true)}
                    fullWidth
                    className="mt-3"
                  >
                    Adicionar Novo Endereço
                  </Button>
                )}
              </>
            )}
          </div>
          
          {/* Método de pagamento */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <div className="flex items-center mb-4">
              <Wallet className="mr-2 text-red-500" size={20} />
              <h2 className="text-lg font-semibold">Método de Pagamento</h2>
            </div>
            
            <div className="space-y-3">
              <div
                onClick={() => setPaymentMethod(PaymentMethod.CREDIT_CARD)}
                className={`border ${
                  paymentMethod === PaymentMethod.CREDIT_CARD
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200'
                } rounded-lg p-3 cursor-pointer transition-all duration-200`}
              >
                <div className="flex items-center">
                  <CreditCard className="mr-3 text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Cartão de Crédito</p>
                    <p className="text-sm text-gray-600">Pague com seu cartão de crédito</p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => setPaymentMethod(PaymentMethod.PIX)}
                className={`border ${
                  paymentMethod === PaymentMethod.PIX
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200'
                } rounded-lg p-3 cursor-pointer transition-all duration-200`}
              >
                <div className="flex items-center">
                  <QrCode className="mr-3 text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Pix</p>
                    <p className="text-sm text-gray-600">Pague rapidamente usando Pix</p>
                  </div>
                </div>
              </div>
              <div
                onClick={() => setPaymentMethod(PaymentMethod.CASH)}
                className={`border ${
                  paymentMethod === PaymentMethod.CASH
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200'
                } rounded-lg p-3 cursor-pointer transition-all duration-200`}
              >
                <div className="flex items-center">
                  <Truck className="mr-3 text-gray-600" size={20} />
                  <div>
                    <p className="font-medium text-gray-800">Dinheiro na Entrega</p>
                    <p className="text-sm text-gray-600">Pague em dinheiro ao receber</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Resumo do pedido */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
            <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
            
            <div className="space-y-2 mb-4">
              {items.map(item => (
                <div key={item.product.id} className="flex justify-between text-gray-600">
                  <span>{item.quantity}x {item.product.nome}</span>
                  <span>R$ {(item.product.preco * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Subtotal</span>
                <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
              </div>
              
              <div className="flex justify-between text-gray-600 mb-2">
                <span>Taxa de entrega</span>
                <span>R$ 5,00</span>
              </div>
              
              <div className="flex justify-between font-bold text-lg text-gray-800 mt-2">
                <span>Total</span>
                <span>R$ {(totalPrice + 5).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
          
          <Button
            fullWidth
            onClick={createOrder}
            disabled={loading || !selectedAddressId}
            className="py-3"
          >
            {loading ? 'Processando...' : 'Confirmar Pedido'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;