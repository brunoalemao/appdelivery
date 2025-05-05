import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

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

const OrderDetail: React.FC = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line
  }, [id]);

  const fetchOrder = async () => {
    if (!user || !id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pedidos')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();
      if (error) throw error;
      // Buscar itens do pedido
      const { data: itemsData, error: itemsError } = await supabase
        .from('itens_pedido')
        .select(`quantidade, preco_unitario, produto_id, produtos (nome)`)
        .eq('pedido_id', id);
      if (itemsError) throw itemsError;
      const items = (itemsData || []).map(item => ({
        produto_id: item.produto_id,
        produto_nome: item.produtos.nome,
        quantidade: item.quantidade,
        preco_unitario: item.preco_unitario,
      }));
      setOrder({ ...data, items });
    } catch (error) {
      setOrder(null);
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

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-gray-500 text-lg mb-6">Pedido não encontrado ou você não tem permissão para vê-lo.</p>
          <Button onClick={() => navigate('/orders')}>
            Voltar para pedidos
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto p-4">
        <div className="flex items-center mb-4">
          <button onClick={() => navigate('/orders')} className="mr-2 p-2 rounded-full hover:bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Detalhes do Pedido</h1>
        </div>
        <div className="mb-2 text-sm text-gray-500">Pedido #{order.id.substring(0, 8)} - {formatDate(order.created_at)}</div>
        <div className="mb-4 text-gray-700">
          <div className="font-semibold">Endereço de entrega:</div>
          <div>{order.endereco_entrega}</div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-2">Itens do pedido:</div>
          <div className="space-y-2">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span>{item.quantidade}x {item.produto_nome}</span>
                <span>R$ {(item.preco_unitario * item.quantidade).toFixed(2).replace('.', ',')}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="font-bold text-lg text-gray-800 mb-2">Total: R$ {order.total.toFixed(2).replace('.', ',')}</div>
        <Button onClick={() => navigate('/orders')} fullWidth>Voltar para pedidos</Button>
      </div>
    </Layout>
  );
};

export default OrderDetail; 