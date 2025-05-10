import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { ConfigProvider } from './contexts/ConfigContext';

// Importar componentes essenciais diretamente para evitar problemas de carregamento
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Componente de carregamento
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-600">Carregando...</p>
    </div>
  </div>
);

// Lazy loading das páginas para melhorar o desempenho
// Usando dynamic import com tratamento de erro
const Welcome = lazy(() => import('./pages/Welcome').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Login = lazy(() => import('./pages/Login').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Register = lazy(() => import('./pages/Register').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Home = lazy(() => import('./pages/Home').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ProductList = lazy(() => import('./pages/ProductList').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ProductDetail = lazy(() => import('./pages/ProductDetail').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Cart = lazy(() => import('./pages/Cart').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Checkout = lazy(() => import('./pages/Checkout').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const OrderHistory = lazy(() => import('./pages/OrderHistory').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Profile = lazy(() => import('./pages/Profile').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Admin = lazy(() => import('./pages/Admin'));
// AdminSettings foi removido pois não está sendo utilizado
const AdminSimple = lazy(() => import('./pages/AdminSimple').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const Addresses = lazy(() => import('./pages/Addresses').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));
const OrderDetail = lazy(() => import('./pages/OrderDetail').catch(() => ({ default: () => <div>Erro ao carregar página</div> })));

function AdminAutoRedirect() {
  const { user, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (
      user &&
      (user.email === 'adm@gmail.com' || userProfile?.is_admin) &&
      !location.pathname.startsWith('/admin')
    ) {
      navigate('/admin', { replace: true });
    }
  }, [user, userProfile, location.pathname, navigate]);
  return null;
}

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <ConfigProvider>
          <LayoutProvider>
            <CartProvider>
              <AdminAutoRedirect />
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 3000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  <Route path="/" element={<Welcome />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  
                  <Route path="/home" element={
                    <ProtectedRoute>
                      <Home />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/category/:categoryId" element={
                    <ProtectedRoute>
                      <ProductList />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/product/:productId" element={
                    <ProtectedRoute>
                      <ProductDetail />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/checkout" element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/addresses" element={
                    <ProtectedRoute>
                      <Addresses />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/order/:id" element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } />
                  
                  <Route path="/admin/*" element={
                    <AdminRoute>
                      <Admin />
                    </AdminRoute>
                  } />
                  
                  <Route path="/admin-simple" element={
                    <AdminRoute>
                      <AdminSimple />
                    </AdminRoute>
                  } />
                  
                  <Route path="*" element={<Navigate to="/home" replace />} />
                </Routes>
              </Suspense>
            </CartProvider>
          </LayoutProvider>
        </ConfigProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;