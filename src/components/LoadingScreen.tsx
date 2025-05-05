import React from 'react';
import { Truck } from 'lucide-react';

const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-50">
      <div className="animate-bounce mb-4">
        <Truck size={64} className="text-red-600" />
      </div>
      <div className="text-xl font-semibold text-gray-700">Carregando...</div>
    </div>
  );
};

export default LoadingScreen;