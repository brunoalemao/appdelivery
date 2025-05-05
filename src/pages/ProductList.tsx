import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
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
}

interface Category {
  id: string;
  nome: string;
}

const ProductList: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setPageTitle } = useLayout();
  
  useEffect(() => {
    fetchCategory();
    fetchProducts();
  }, [categoryId]);
  
  const fetchCategory = async () => {
    if (!categoryId) return;
    
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .eq('id', categoryId)
        .single();
      
      if (error) throw error;
      
      setCategory(data);
      if (data) {
        setPageTitle(data.nome);
      }
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
    }
  };
  
  const fetchProducts = async () => {
    if (!categoryId) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('categoria_id', categoryId)
        .eq('disponivel', true)
        .order('nome');
      
      if (error) throw error;
      
      setProducts(data || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };
  
  return (
    <Layout>
      <div className="pb-16">
        {/* Header da categoria */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/home')}
              className="mr-4 p-1"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold">{category?.nome || 'Produtos'}</h1>
          </div>
        </div>
        
        {/* Lista de produtos */}
        <div className="p-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i}
                  className="h-24 bg-gray-200 rounded-lg animate-pulse"
                ></div>
              ))}
            </div>
          ) : (
            <>
              {products.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum produto encontrado nesta categoria.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
                    >
                      <div 
                        className="flex cursor-pointer"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        <div className="w-24 h-24 flex-shrink-0">
                          <img 
                            src={product.imagem_url} 
                            alt={product.nome}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        
                        <div className="flex-1 p-3">
                          <h3 className="font-semibold text-gray-800">{product.nome}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{product.descricao}</p>
                          <div className="flex justify-between items-center mt-2">
                            <p className="text-red-600 font-bold">
                              R$ {product.preco.toFixed(2).replace('.', ',')}
                            </p>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddToCart(product);
                              }}
                              className="py-1 px-2 text-sm"
                              icon={<Plus size={16} />}
                            >
                              Adicionar
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProductList;