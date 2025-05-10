import React, { memo } from 'react';
import { useLayout } from '../contexts/LayoutContext';
import Header from './Header';
import Footer from './Footer';

// Componente Header otimizado com memo para evitar re-renderizações desnecessárias
const MemoizedHeader = memo(Header);

// Componente Footer otimizado com memo para evitar re-renderizações desnecessárias
const MemoizedFooter = memo(Footer);

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showHeader, showFooter, pageTitle } = useLayout();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {showHeader && <MemoizedHeader title={pageTitle} />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <MemoizedFooter />}
    </div>
  );
};

// Exportando o componente Layout com memo para evitar re-renderizações desnecessárias
export default memo(Layout);