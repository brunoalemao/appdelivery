import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  observacao?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number, observacao?: string) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'foodtruck_cart';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  
  // Inicializar o carrinho do localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erro ao carregar carrinho do localStorage:', e);
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
  }, []);
  
  // Salvar o carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);
  
  // Limpar o carrinho quando o usuário muda
  useEffect(() => {
    if (user === null) {
      clearCart();
    }
  }, [user]);

  const addToCart = (product: Product, quantity: number, observacao?: string) => {
    setItems(currentItems => {
      // Verifica se o produto já está no carrinho
      const existingItemIndex = currentItems.findIndex(item => item.product.id === product.id);
      
      if (existingItemIndex >= 0) {
        // Atualiza a quantidade se o produto já estiver no carrinho
        const updatedItems = [...currentItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
          observacao: observacao || updatedItems[existingItemIndex].observacao
        };
        toast.success('Produto atualizado no carrinho!');
        return updatedItems;
      } else {
        // Adiciona um novo item ao carrinho
        toast.success('Produto adicionado ao carrinho!');
        return [...currentItems, { product, quantity, observacao }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(currentItems => {
      const updatedItems = currentItems.filter(item => item.product.id !== productId);
      toast.success('Produto removido do carrinho!');
      return updatedItems;
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(currentItems => {
      return currentItems.map(item => {
        if (item.product.id === productId) {
          return { ...item, quantity };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  
  const totalPrice = items.reduce(
    (total, item) => total + item.product.preco * item.quantity, 
    0
  );

  const getItemQuantity = (productId: string) => {
    const item = items.find(item => item.product.id === productId);
    return item ? item.quantity : 0;
  };

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};