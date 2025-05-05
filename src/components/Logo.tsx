import React from 'react';
import { Truck } from 'lucide-react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 40 }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <Truck 
        size={size} 
        className="text-red-600 transform -rotate-6"
      />
      <div className="absolute top-0 right-0 bg-yellow-400 h-2 w-2 rounded-full" />
    </div>
  );
};

export default Logo;