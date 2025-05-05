import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { LayoutProvider } from './contexts/LayoutContext';
import { ConfigProvider } from './contexts/ConfigContext';

// Páginas
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import Admin from './pages/Admin';
import ForgotPassword from './pages/ForgotPassword';
import Welcome from './pages/Welcome';
import Addresses from './pages/Addresses';
import OrderDetail from './pages/OrderDetail';

// Componentes
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

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
                
                <Route path="*" element={<Navigate to="/home" replace />} />
              </Routes>
            </CartProvider>
          </LayoutProvider>
        </ConfigProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;