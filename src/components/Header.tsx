import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, MapPin, LogOut } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import Logo from './Logo';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { userProfile, signOut } = useAuth();
  const { config } = useConfig();
  console.log('Header config:', config);
  
  // Verifica se é admin
  const isAdmin = userProfile?.email === 'adm@gmail.com';
  
  return (
    <header className="sticky top-0 z-10 bg-primary shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/home')}
              className="flex items-center"
            >
              {config?.logo_url ? (
                <img src={config.logo_url} alt="Logo" className="h-8 w-auto mr-2" />
              ) : (
                <Logo className="h-8 w-auto mr-2" />
              )}
              <span className="font-bold text-secondary text-lg hidden sm:block">
                {config?.nome_app || 'Food Truck'}
              </span>
            </button>
          </div>
          
          <div className="flex items-center space-x-1 sm:space-x-3">
            <div className="flex items-center text-secondary text-sm">
              <MapPin size={16} className="text-secondary mr-1" />
              <span className="truncate max-w-[120px] md:max-w-[200px]">
                {userProfile?.endereco_entrega || 'Selecione um endereço'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => navigate('/search')}
              className="p-2 text-secondary hover:text-primary transition-colors"
            >
              <Search size={20} />
            </button>
            
            <button 
              onClick={() => navigate('/profile')}
              className="p-2 text-secondary hover:text-primary transition-colors"
            >
              <User size={20} />
            </button>
            
            <button 
              onClick={() => navigate('/cart')}
              className="p-2 text-secondary hover:text-primary transition-colors relative"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-secondary text-primary text-xs h-5 w-5 flex items-center justify-center rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
            
            {isAdmin && (
              <button
                onClick={signOut}
                className="p-2 text-secondary hover:text-primary transition-colors flex items-center"
                title="Sair"
              >
                <LogOut size={20} />
                <span className="ml-1 hidden sm:inline">Sair</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;