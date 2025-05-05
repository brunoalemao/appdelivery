import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle, AlertTriangle, XCircle, ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../contexts/LayoutContext';
import Layout from '../components/Layout';
import Button from '../components/Button';

interface OrderItem {
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  preco_unitario: number;
}

interface Order {
  id: string;
  status: string;
  total: number;
  endereco_entrega: string;
  created_at: string;
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

const OrderStatusIcon = {
  [OrderStatus.PENDING]: <Clock className="text-yellow-500" />,
  [OrderStatus.PREPARING]: <Clock className="text-blue-500" />,
  [OrderStatus.DELIVERY]: <Clock className="text-purple-500" />,
  [OrderStatus.COMPLETED]: <CheckCircle className="text-green-500" />,
  [OrderStatus.CANCELLED]: <XCircle className="text-red-500" />,
};

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  
  useEffect(() => {
    setPageTitle('Meus Pedidos');
    fetchOrders();
  }, []);
  
  const fetchOrders = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Buscar pedidos do usuário
      const { data: ordersData, error: ordersError } = await supabase
        .from('pedidos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Buscar itens de cada pedido
      const ordersWithItems = await Promise.all(
        (ordersData || []).map(async (order) => {
          const { data: itemsData, error: itemsError } = await supabase
            .from('itens_pedido')
            .select(`
              quantidade,
              preco_unitario,
              produto_id,
              produtos (
                nome
              )
            `)
            .eq('pedido_id', order.id);
          
          if (itemsError) throw itemsError;
          
          const items = (itemsData || []).map(item => ({
            produto_id: item.produto_id,
            produto_nome: item.produtos.nome,
            quantidade: item.quantidade,
            preco_unitario: item.preco_unitario,
          }));
          
          return {
            ...order,
            items,
          };
        })
      );
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
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
  
  return (
    <Layout>
      <div className="pb-20">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Meus Pedidos</h1>
          
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertTriangle size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-6">Você ainda não fez nenhum pedido</p>
              <Button onClick={() => navigate('/home')}>
                Explorar cardápio
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(order => (
                <div
                  key={order.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                >
                  <div className="p-4">
                    {/* Cabeçalho do pedido */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="text-sm text-gray-500">
                          Pedido #{order.id.substring(0, 8)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        {OrderStatusIcon[order.status]}
                        <span className="ml-1 text-sm font-medium">
                          {OrderStatusLabel[order.status]}
                        </span>
                      </div>
                    </div>
                    
                    {/* Itens do pedido */}
                    <div className="border-t border-gray-100 pt-3 mb-3">
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span>{item.quantidade}x {item.produto_nome}</span>
                            <span>R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                        
                        {order.items.length > 2 && (
                          <div className="text-sm text-gray-500">
                            + {order.items.length - 2} outros itens
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Rodapé do pedido */}
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <div className="font-bold">
                        Total: R$ {order.total.toFixed(2).replace('.', ',')}
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/order/${order.id}`)}
                        className="text-red-600 flex items-center text-sm"
                      >
                        Detalhes
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderHistory;