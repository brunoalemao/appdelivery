import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Package, Users, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../contexts/LayoutContext';
import Layout from '../components/Layout';

// Componentes do Admin
import AdminDashboard from '../components/admin/AdminDashboard';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminUsers from '../components/admin/AdminUsers';
import AdminSettings from './AdminSettings';
import AdminCategories from '../components/admin/AdminCategories';

const Admin: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setPageTitle } = useLayout();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  useEffect(() => {
    setPageTitle('Painel Administrativo');
  }, []);
  
  const getActiveLink = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };
  
  const handleSignOut = async () => {
    await signOut();
  };
  
  return (
    <Layout>
      <div className="flex min-h-screen bg-gray-100">
        {/* Sidebar para desktop */}
        <div className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 bg-white shadow-md">
            <div className="flex flex-col flex-1 pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              </div>
              
              <nav className="mt-5 flex-1 px-2 space-y-1">
                <Link
                  to="/admin"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    getActiveLink('/admin') && location.pathname === '/admin'
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <Home className="mr-3 h-6 w-6" />
                  Dashboard
                </Link>
                
                <Link
                  to="/admin/products"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    getActiveLink('/admin/products')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <Package className="mr-3 h-6 w-6" />
                  Produtos
                </Link>
                
                <Link
                  to="/admin/orders"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    getActiveLink('/admin/orders')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <FileText className="mr-3 h-6 w-6" />
                  Pedidos
                </Link>
                
                <Link
                  to="/admin/users"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    getActiveLink('/admin/users')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <Users className="mr-3 h-6 w-6" />
                  Usuários
                </Link>
                
                <Link
                  to="/admin/settings"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    getActiveLink('/admin/settings')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <FileText className="mr-3 h-6 w-6" />
                  Configurações
                </Link>
                
                <Link
                  to="/admin/categories"
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    getActiveLink('/admin/categories')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <Package className="mr-3 h-6 w-6" />
                  Categorias
                </Link>
              </nav>
              
              <div className="px-3 mt-6">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center px-2 py-2 text-base font-medium text-primary rounded-md hover:bg-secondary hover:text-secondary"
                >
                  <LogOut className="mr-3 h-6 w-6" />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="flex flex-col flex-1 w-0 overflow-hidden">
          {/* Barra superior móvel */}
          <div className="md:hidden bg-white shadow-sm py-2 px-4">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold text-primary">Admin Panel</h1>
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-600 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
            
            {/* Menu móvel */}
            {sidebarOpen && (
              <div className="mt-3 space-y-1">
                <Link
                  to="/admin"
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    getActiveLink('/admin') && location.pathname === '/admin'
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <div className="flex items-center">
                    <Home className="mr-2 h-5 w-5" />
                    Dashboard
                  </div>
                </Link>
                
                <Link
                  to="/admin/products"
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    getActiveLink('/admin/products')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <div className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Produtos
                  </div>
                </Link>
                
                <Link
                  to="/admin/orders"
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    getActiveLink('/admin/orders')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Pedidos
                  </div>
                </Link>
                
                <Link
                  to="/admin/users"
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    getActiveLink('/admin/users')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <div className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Usuários
                  </div>
                </Link>
                
                <Link
                  to="/admin/settings"
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    getActiveLink('/admin/settings')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <div className="flex items-center">
                    <FileText className="mr-2 h-5 w-5" />
                    Configurações
                  </div>
                </Link>
                
                <Link
                  to="/admin/categories"
                  onClick={() => setSidebarOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    getActiveLink('/admin/categories')
                      ? 'bg-primary text-white'
                      : 'text-primary hover:bg-secondary hover:text-secondary'
                  }`}
                >
                  <div className="flex items-center">
                    <Package className="mr-2 h-5 w-5" />
                    Categorias
                  </div>
                </Link>
                
                <button
                  onClick={() => {
                    setSidebarOpen(false);
                    handleSignOut();
                  }}
                  className="w-full flex items-center px-3 py-2 text-base font-medium text-primary rounded-md hover:bg-secondary hover:text-secondary"
                >
                  <LogOut className="mr-2 h-5 w-5" />
                  Sair
                </button>
              </div>
            )}
          </div>
          
          {/* Conteúdo da página */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-100 p-4">
            <Routes>
              <Route path="/" element={<AdminDashboard />} />
              <Route path="/products/*" element={<AdminProducts />} />
              <Route path="/orders/*" element={<AdminOrders />} />
              <Route path="/users/*" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="/categories" element={<AdminCategories />} />
            </Routes>
          </main>
        </div>
      </div>
    </Layout>
  );
};

export default Admin;