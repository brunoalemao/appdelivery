import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLayout } from '../contexts/LayoutContext';
import Layout from '../components/Layout';

interface Category {
  id: string;
  nome: string;
  imagem_url: string;
}

interface FeaturedProduct {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
}

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const { setPageTitle } = useLayout();
  
  useEffect(() => {
    setPageTitle('Cardápio');
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categorias')
        .select('*')
        .order('ordem');
      
      if (categoriesError) throw categoriesError;
      
      // Buscar produtos em destaque
      const { data: productsData, error: productsError } = await supabase
        .from('produtos')
        .select('*')
        .eq('destaque', true)
        .eq('disponivel', true)
        .limit(5);
      
      if (productsError) throw productsError;
      
      setCategories(categoriesData || []);
      setFeaturedProducts(productsData || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="pb-16 px-2 sm:px-4 md:px-6 lg:px-8">
        {/* Header com saudação */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold mb-2">Hummm!</h1>
            <p className="text-white/90">Qual vai ser a boa de hoje?</p>
          </motion.div>
        </div>
        
        {/* Categorias */}
        <div className="px-4 py-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Categorias</h2>
          {loading ? (
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {[1, 2, 3, 4].map(i => (
                <div 
                  key={i}
                  className="flex flex-col items-center w-24 flex-shrink-0"
                >
                  <div className="h-20 w-20 bg-gray-200 rounded-full animate-pulse mb-2" />
                  <div className="h-4 w-12 bg-gray-200 rounded mb-1 animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex space-x-4 overflow-x-auto pb-2" style={{ minWidth: 'max-content' }}>
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  onClick={() => navigate(`/category/${category.id}`)}
                  className="flex flex-col items-center w-20 flex-shrink-0 cursor-pointer group sm:w-24"
                >
                  <div className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center mb-2 border-2 border-gray-200 group-hover:border-primary transition-all duration-200"
                        style={{ backgroundColor: 'var(--cor-primaria)' }}>
                    <img
                      src={category.imagem_url}
                      alt={category.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-center font-semibold text-gray-800 truncate w-full">
                    {category.nome}
                  </span>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        
        {/* Produtos em destaque */}
        {featuredProducts.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Queridinhos da galera</h2>
            
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center justify-center space-x-1 overflow-x-auto pb-2 sm:space-x-2 md:space-x-3 lg:space-x-4" style={{ minWidth: 'max-content' }}>
                {featuredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white rounded-lg shadow-md overflow-hidden w-36 max-w-sm cursor-pointer hover:shadow-lg transition-all duration-200 sm:w-48"
                  >
                    <div className="h-28 overflow-hidden">
                      <img 
                        src={product.imagem_url} 
                        alt={product.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-800 truncate">{product.nome}</h3>
                      <p className="text-sm text-gray-500 h-10 overflow-hidden">{product.descricao}</p>
                      <p className="text-red-600 font-bold mt-2">
                        R$ {product.preco.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;