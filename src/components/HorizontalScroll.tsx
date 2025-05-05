import React from 'react';

interface HorizontalScrollProps {
  children: React.ReactNode;
  className?: string;
}

const HorizontalScroll: React.FC<HorizontalScrollProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-2 overflow-x-auto pb-2 ${className}`} style={{ minWidth: 'max-content' }}>
      {children}
    </div>
  );
};

export default HorizontalScroll;
