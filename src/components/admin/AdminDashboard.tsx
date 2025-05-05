import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { DollarSign, ShoppingBag, Users, Clock } from 'lucide-react';

interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalUsers: number;
  pendingOrders: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Obter estatísticas
      const [salesData, ordersData, usersData, pendingOrdersData, recentOrdersData] = await Promise.all([
        // Total de vendas
        supabase
          .from('pedidos')
          .select('total')
          .not('status', 'eq', 'cancelled'),
        
        // Total de pedidos
        supabase
          .from('pedidos')
          .select('count', { count: 'exact' }),
        
        // Total de usuários
        supabase
          .from('perfis')
          .select('count', { count: 'exact' }),
        
        // Pedidos pendentes
        supabase
          .from('pedidos')
          .select('count', { count: 'exact' })
          .eq('status', 'pending'),
        
        // Pedidos recentes
        supabase
          .from('pedidos')
          .select(`
            id,
            total,
            status,
            created_at,
            perfis (nome)
          `)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);
      
      const totalSales = salesData.data
        ? salesData.data.reduce((sum, order) => sum + order.total, 0)
        : 0;
      
      setStats({
        totalSales,
        totalOrders: ordersData.count || 0,
        totalUsers: usersData.count || 0,
        pendingOrders: pendingOrdersData.count || 0,
      });
      
      setRecentOrders(recentOrdersData.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
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
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'delivery': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'preparing': return 'Preparando';
      case 'delivery': return 'Em entrega';
      case 'completed': return 'Entregue';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 mr-4">
              <DollarSign className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Vendas Totais</p>
              <h3 className="text-2xl font-bold text-gray-800">
                R$ {stats.totalSales.toFixed(2).replace('.', ',')}
              </h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 mr-4">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total de Pedidos</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalOrders}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 mr-4">
              <Users className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total de Usuários</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.totalUsers}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 mr-4">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Pedidos Pendentes</p>
              <h3 className="text-2xl font-bold text-gray-800">{stats.pendingOrders}</h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tabela de pedidos recentes */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Pedidos Recentes</h2>
        </div>
        
        <div className="overflow-x-auto">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum pedido encontrado
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{order.id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.perfis?.nome || 'Cliente'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;