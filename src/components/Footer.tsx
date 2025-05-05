import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Clock, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { totalItems } = useCart();
  
  const isActive = (path: string) => location.pathname === path;
  
  return (
    <footer className="sticky bottom-0 z-10 bg-white border-t border-gray-200 shadow-lg">
      <div className="container mx-auto px-2">
        <div className="flex items-center justify-around py-2">
          <button
            onClick={() => navigate('/home')}
            className={`flex flex-col items-center p-2 ${
              isActive('/home') ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button
            onClick={() => navigate('/orders')}
            className={`flex flex-col items-center p-2 ${
              isActive('/orders') ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <Clock size={24} />
            <span className="text-xs mt-1">Pedidos</span>
          </button>
          
          <button
            onClick={() => navigate('/cart')}
            className={`flex flex-col items-center p-2 relative ${
              isActive('/cart') ? 'text-red-500' : 'text-gray-600'
            }`}
          >
            <ShoppingCart size={24} />
            {totalItems > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs h-5 w-5 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
            <span className="text-xs mt-1">Carrinho</span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;