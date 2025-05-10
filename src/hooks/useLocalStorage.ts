import { useState, useEffect } from 'react';

// Hook personalizado para gerenciar valores no localStorage com tipagem
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  // Estado para armazenar o valor
  // Inicializa o estado verificando se já existe um valor no localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Tenta obter o valor do localStorage
      const item = localStorage.getItem(key);
      // Retorna o valor parseado ou o valor inicial se não existir
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // Se ocorrer um erro, retorna o valor inicial
      console.error(`Erro ao recuperar ${key} do localStorage:`, error);
      return initialValue;
    }
  });

  // Função para atualizar o valor no localStorage e no estado
  const setValue = (value: T) => {
    try {
      // Verifica se o valor é diferente do atual para evitar atualizações desnecessárias
      if (JSON.stringify(value) !== JSON.stringify(storedValue)) {
        // Salva o estado
        setStoredValue(value);
        
        // Verifica se estamos no navegador
        if (typeof window !== 'undefined') {
          // Salva no localStorage
          localStorage.setItem(key, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.error(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  // Efeito para sincronizar o valor com outros componentes que usam o mesmo hook
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    
    // Evita adicionar múltiplos listeners
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue) {
        try {
          const newValue = JSON.parse(event.newValue);
          // Verifica se o valor é diferente do atual para evitar atualizações desnecessárias
          if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
            setStoredValue(newValue);
          }
        } catch (e) {
          console.error(`Erro ao processar alteração do localStorage para ${key}:`, e);
        }
      }
    };

    // Adiciona o listener para eventos de alteração no localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Remove o listener quando o componente é desmontado
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, storedValue]);

  return [storedValue, setValue];
}
