import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Clock, Truck, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';
import Input from '../Input';
import toast from 'react-hot-toast';

interface OrderItem {
  id: string;
  produto_id: string;
  produto: {
    nome: string;
  };
  quantidade: number;
  preco_unitario: number;
  observacao: string | null;
}

interface Order {
  id: string;
  user_id: string;
  usuario: {
    nome: string;
    telefone: string;
  };
  status: string;
  total: number;
  endereco_entrega: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

const OrderStatus = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  DELIVERY: 'delivery',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const OrderStatusLabel = {
  [OrderStatus.PENDING]: 'Pendente',
  [OrderStatus.PREPARING]: 'Preparando',
  [OrderStatus.DELIVERY]: 'Em entrega',
  [OrderStatus.COMPLETED]: 'Entregue',
  [OrderStatus.CANCELLED]: 'Cancelado',
};

const AdminOrders: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<OrdersList />} />
      <Route path="/:id" element={<OrderDetail />} />
    </Routes>
  );
};

const OrdersList: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('pedidos')
        .select(`
          *,
          perfis (nome, telefone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      const formattedOrders = (data || []).map((order: any) => ({
        ...order,
        usuario: order.perfis,
      }));
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      toast.error('Erro ao carregar pedidos');
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING: return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PREPARING: return 'bg-blue-100 text-blue-800';
      case OrderStatus.DELIVERY: return 'bg-purple-100 text-purple-800';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case OrderStatus.PENDING: return <Clock size={16} />;
      case OrderStatus.PREPARING: return <Clock size={16} />;
      case OrderStatus.DELIVERY: return <Truck size={16} />;
      case OrderStatus.COMPLETED: return <CheckCircle size={16} />;
      case OrderStatus.CANCELLED: return <X size={16} />;
      default: return null;
    }
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) || 
                         (order.usuario?.nome?.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Pedidos</h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar por ID ou cliente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Todos os status</option>
                <option value={OrderStatus.PENDING}>Pendentes</option>
                <option value={OrderStatus.PREPARING}>Preparando</option>
                <option value={OrderStatus.DELIVERY}>Em entrega</option>
                <option value={OrderStatus.COMPLETED}>Entregues</option>
                <option value={OrderStatus.CANCELLED}>Cancelados</option>
              </select>
            </div>
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
                    Pedido ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Nenhum pedido encontrado
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.usuario?.nome || 'Cliente'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {order.total.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          <span className="mr-1">{getStatusIcon(order.status)}</span>
                          {OrderStatusLabel[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                          variant="outline"
                          className="py-1 text-xs"
                        >
                          Ver detalhes
                        </Button>
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

const OrderDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id]);
  
  const fetchOrderDetails = async (orderId: string) => {
    try {
      setLoading(true);
      
      // Buscar informações do pedido
      const { data: orderData, error: orderError } = await supabase
        .from('pedidos')
        .select(`
          *,
          perfis (nome, telefone)
        `)
        .eq('id', orderId)
        .single();
      
      if (orderError) throw orderError;
      
      // Buscar itens do pedido
      const { data: itemsData, error: itemsError } = await supabase
        .from('itens_pedido')
        .select(`
          *,
          produtos (nome)
        `)
        .eq('pedido_id', orderId);
      
      if (itemsError) throw itemsError;
      
      // Transformar os dados para o formato esperado
      const orderWithItems = {
        ...orderData,
        usuario: orderData.perfis,
        items: itemsData.map((item: any) => ({
          ...item,
          produto: item.produtos,
        })),
      };
      
      setOrder(orderWithItems);
    } catch (error) {
      console.error('Erro ao buscar detalhes do pedido:', error);
      toast.error('Erro ao carregar detalhes do pedido');
      navigate('/admin/orders');
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
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const handleUpdateStatus = async (newStatus: string) => {
    if (!order) return;
    
    try {
      setUpdatingStatus(true);
      
      const { error } = await supabase
        .from('pedidos')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', order.id);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setOrder({
        ...order,
        status: newStatus,
        updated_at: new Date().toISOString(),
      });
      
      toast.success(`Status atualizado para ${OrderStatusLabel[newStatus]}`);
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      toast.error('Erro ao atualizar status do pedido');
    } finally {
      setUpdatingStatus(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  if (!order) {
    return (
      <div className="text-center py-10">
        <p>Pedido não encontrado</p>
        <Button onClick={() => navigate('/admin/orders')} className="mt-4">
          Voltar para a lista de pedidos
        </Button>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/orders')}
          className="mr-4 p-1 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          Detalhes do Pedido #{order.id.substring(0, 8)}
        </h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Informações gerais */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Pedido</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">ID do Pedido</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Data do Pedido</p>
              <p className="font-medium">{formatDate(order.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.status === OrderStatus.PENDING ? 'bg-yellow-100 text-yellow-800' :
                  order.status === OrderStatus.PREPARING ? 'bg-blue-100 text-blue-800' :
                  order.status === OrderStatus.DELIVERY ? 'bg-purple-100 text-purple-800' :
                  order.status === OrderStatus.COMPLETED ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {OrderStatusLabel[order.status]}
                </span>
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="font-medium">R$ {order.total.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>
        
        {/* Informações do cliente */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Informações do Cliente</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Nome</p>
              <p className="font-medium">{order.usuario?.nome || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Telefone</p>
              <p className="font-medium">{order.usuario?.telefone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">ID do Cliente</p>
              <p className="font-medium">{order.user_id}</p>
            </div>
          </div>
        </div>
        
        {/* Endereço de entrega */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Endereço de Entrega</h2>
          <p className="text-gray-700 whitespace-pre-line">{order.endereco_entrega}</p>
        </div>
      </div>
      
      {/* Atualizar status */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Atualizar Status</h2>
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={() => handleUpdateStatus(OrderStatus.PENDING)}
            variant={order.status === OrderStatus.PENDING ? 'primary' : 'outline'}
            disabled={updatingStatus || order.status === OrderStatus.PENDING}
          >
            Pendente
          </Button>
          <Button
            onClick={() => handleUpdateStatus(OrderStatus.PREPARING)}
            variant={order.status === OrderStatus.PREPARING ? 'primary' : 'outline'}
            disabled={updatingStatus || order.status === OrderStatus.PREPARING}
          >
            Preparando
          </Button>
          <Button
            onClick={() => handleUpdateStatus(OrderStatus.DELIVERY)}
            variant={order.status === OrderStatus.DELIVERY ? 'primary' : 'outline'}
            disabled={updatingStatus || order.status === OrderStatus.DELIVERY}
          >
            Em Entrega
          </Button>
          <Button
            onClick={() => handleUpdateStatus(OrderStatus.COMPLETED)}
            variant={order.status === OrderStatus.COMPLETED ? 'primary' : 'outline'}
            disabled={updatingStatus || order.status === OrderStatus.COMPLETED}
          >
            Entregue
          </Button>
          <Button
            onClick={() => handleUpdateStatus(OrderStatus.CANCELLED)}
            variant={order.status === OrderStatus.CANCELLED ? 'danger' : 'outline'}
            disabled={updatingStatus || order.status === OrderStatus.CANCELLED}
          >
            Cancelar
          </Button>
        </div>
      </div>
      
      {/* Itens do pedido */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Itens do Pedido</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Produto
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Observação
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantidade
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preço Unit.
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum item encontrado
                  </td>
                </tr>
              ) : (
                order.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.produto?.nome || 'Produto'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {item.observacao || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                      {item.quantidade}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      R$ {item.preco_unitario.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                      R$ {(item.quantidade * item.preco_unitario).toFixed(2).replace('.', ',')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-900">
                  Total:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-gray-900">
                  R$ {order.total.toFixed(2).replace('.', ',')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;