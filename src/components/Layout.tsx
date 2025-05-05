import React from 'react';
import { useLayout } from '../contexts/LayoutContext';
import Header from './Header';
import Footer from './Footer';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { showHeader, showFooter, pageTitle } = useLayout();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {showHeader && <Header title={pageTitle} />}
      <main className="flex-1">
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;