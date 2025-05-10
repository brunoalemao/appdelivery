import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Minus, Plus, ShoppingCart } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useLayout } from '../contexts/LayoutContext';
import Layout from '../components/Layout';
import Button from '../components/Button';

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  categoria_id: string;
}

const ProductDetail: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [observacao, setObservacao] = useState('');
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const { setPageTitle } = useLayout();
  
  useEffect(() => {
    fetchProduct();
  }, [productId]);
  
  const fetchProduct = async () => {
    if (!productId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (error) throw error;
      
      setProduct(data);
      if (data) {
        setPageTitle(data.nome);
        // Inicializa com a quantidade atual no carrinho (se houver)
        const cartQuantity = getItemQuantity(data.id);
        if (cartQuantity > 0) {
          setQuantity(cartQuantity);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDecrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  const handleIncrementQuantity = () => {
    setQuantity(quantity + 1);
  };
  
  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, observacao);
      navigate('/cart');
    }
  };
  
  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      </Layout>
    );
  }
  
  if (!product) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-screen p-4">
          <p className="text-gray-500 mb-4">Produto não encontrado</p>
          <Button onClick={() => navigate('/home')}>Voltar para o cardápio</Button>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="pb-16">
        {/* Imagem do produto */}
        <div className="relative">
          <div className="h-64 w-full bg-gray-200">
            <img 
              src={product.imagem_url}
              alt={product.nome}
              className="w-full h-full object-cover"
            />
          </div>
          
          <button 
            onClick={() => navigate(-1)}
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md"
          >
            <ArrowLeft size={20} />
          </button>
        </div>
        
        {/* Detalhes do produto */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-t-3xl -mt-6 relative z-10 px-4 pt-6 pb-24"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">{product.nome}</h1>
          
          <p className="text-red-600 text-xl font-bold mb-4">
            R$ {product.preco.toFixed(2).replace('.', ',')}
          </p>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Descrição</h2>
            <p className="text-gray-600">{product.descricao}</p>
          </div>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Observações</h2>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Sem cebola, molho à parte, etc."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={3}
            />
          </div>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Quantidade</h2>
            <div className="flex items-center">
              <button
                onClick={handleDecrementQuantity}
                className="bg-gray-200 p-2 rounded-l-md"
              >
                <Minus size={20} />
              </button>
              
              <div className="bg-gray-100 px-6 py-2 text-center min-w-[50px]">
                {quantity}
              </div>
              
              <button
                onClick={handleIncrementQuantity}
                className="bg-gray-200 p-2 rounded-r-md"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
          
          <Button
            fullWidth
            onClick={handleAddToCart}
            icon={<ShoppingCart size={20} />}
            className="py-4"
          >
            Adicionar ao carrinho • R$ {(product.preco * quantity).toFixed(2).replace('.', ',')}
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
};

export default ProductDetail;