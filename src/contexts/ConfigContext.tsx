import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const CONFIG_ID = 'config-unica';

const ConfigContext = createContext<any>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<any>(null);

  const fetchConfig = async () => {
    console.log('fetchConfig chamado');
    const { data } = await supabase.from('configuracoes').select('*').eq('id', CONFIG_ID).maybeSingle();
    setConfig(data);
    console.log('Config carregada:', data);
    if (data) {
      document.documentElement.style.setProperty('--cor-primaria', data.cor_primaria || '#ff0000');
      document.documentElement.style.setProperty('--cor-secundaria', data.cor_secundaria || '#ffffff');
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <ConfigContext.Provider value={{ config, fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig deve ser usado dentro de ConfigProvider');
  return context;
}; 