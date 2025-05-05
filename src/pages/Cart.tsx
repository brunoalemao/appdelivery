import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useLayout } from '../contexts/LayoutContext';
import Layout from '../components/Layout';
import Button from '../components/Button';

const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  
  useEffect(() => {
    setPageTitle('Carrinho');
  }, []);
  
  const handleContinueShopping = () => {
    navigate('/home');
  };
  
  const handleCheckout = () => {
    navigate('/checkout');
  };
  
  return (
    <Layout>
      <div className="pb-20">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Seu Carrinho</h1>
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <ShoppingCart size={64} className="text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg mb-6">Seu carrinho está vazio</p>
              <Button onClick={handleContinueShopping}>
                Explorar cardápio
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4 mb-8">
                {items.map((item, index) => (
                  <motion.div
                    key={item.product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 p-4"
                  >
                    <div className="flex">
                      <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden">
                        <img 
                          src={item.product.imagem_url} 
                          alt={item.product.nome}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <div className="flex-1 ml-4">
                        <div className="flex justify-between">
                          <h3 className="font-semibold text-gray-800">{item.product.nome}</h3>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                        
                        <p className="text-red-600 font-bold mt-1">
                          R$ {item.product.preco.toFixed(2).replace('.', ',')}
                        </p>
                        
                        {item.observacao && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            "{item.observacao}"
                          </p>
                        )}
                        
                        <div className="flex justify-between items-center mt-3">
                          <div className="flex items-center border border-gray-200 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 text-gray-500"
                            >
                              <Minus size={16} />
                            </button>
                            
                            <span className="px-3 py-1 text-center min-w-[30px]">
                              {item.quantity}
                            </span>
                            
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 text-gray-500"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          
                          <p className="font-bold text-gray-800">
                            R$ {(item.product.preco * item.quantity).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Subtotal</span>
                  <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                </div>
                
                <div className="flex justify-between text-gray-600 mb-2">
                  <span>Taxa de entrega</span>
                  <span>R$ 5,00</span>
                </div>
                
                <div className="border-t border-gray-200 my-2 pt-2">
                  <div className="flex justify-between font-bold text-lg text-gray-800">
                    <span>Total</span>
                    <span>R$ {(totalPrice + 5).toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <Button
                  fullWidth
                  onClick={handleCheckout}
                  className="py-3"
                >
                  Finalizar Pedido
                </Button>
                
                <Button
                  fullWidth
                  variant="outline"
                  onClick={handleContinueShopping}
                >
                  Continuar Comprando
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Cart;