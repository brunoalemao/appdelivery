import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

type LayoutContextType = {
  showHeader: boolean;
  showFooter: boolean;
  pageTitle: string;
  setPageTitle: (title: string) => void;
  setHeaderVisible: (visible: boolean) => void;
  setFooterVisible: (visible: boolean) => void;
};

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export const LayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showHeader, setShowHeader] = useState(true);
  const [showFooter, setShowFooter] = useState(true);
  const [pageTitle, setPageTitle] = useState('Food Truck');
  const location = useLocation();

  // Atualiza o título da página quando o título muda
  useEffect(() => {
    document.title = `${pageTitle} | Food Truck`;
  }, [pageTitle]);

  // Determina se deve mostrar header/footer com base na rota
  useEffect(() => {
    const path = location.pathname;
    
    // Rotas onde não queremos mostrar o layout completo
    const fullscreenRoutes = ['/', '/login', '/register', '/forgot-password'];
    const isFullscreenRoute = fullscreenRoutes.includes(path);
    
    setShowHeader(!isFullscreenRoute);
    setShowFooter(!isFullscreenRoute);
    
    // Define o título da página com base na rota atual
    if (path === '/') setPageTitle('Bem-vindo');
    else if (path === '/login') setPageTitle('Login');
    else if (path === '/register') setPageTitle('Cadastro');
    else if (path === '/home') setPageTitle('Cardápio');
    else if (path.includes('/admin')) setPageTitle('Admin');
    else if (path === '/cart') setPageTitle('Carrinho');
    else if (path === '/checkout') setPageTitle('Finalizar Pedido');
    else if (path === '/orders') setPageTitle('Meus Pedidos');
    else if (path === '/profile') setPageTitle('Meu Perfil');
  }, [location]);

  const setHeaderVisible = (visible: boolean) => {
    setShowHeader(visible);
  };

  const setFooterVisible = (visible: boolean) => {
    setShowFooter(visible);
  };

  return (
    <LayoutContext.Provider
      value={{
        showHeader,
        showFooter,
        pageTitle,
        setPageTitle,
        setHeaderVisible,
        setFooterVisible,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (context === undefined) {
    throw new Error('useLayout deve ser usado dentro de um LayoutProvider');
  }
  return context;
};