import React, { useEffect, useState } from 'react';

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
      console.log('Iniciando busca de dados...');
      
      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categorias')
        .select('id, nome, imagem_url')
        .order('ordem');
      
      if (categoriesError) {
        console.error('Erro ao buscar categorias:', categoriesError);
        throw categoriesError;
      }
      console.log('Categorias encontradas:', categoriesData?.length);
      
      // Buscar produtos em destaque
      const { data: productsData, error: productsError } = await supabase
        .from('produtos')
        .select('id, nome, descricao, preco, imagem_url')
        .eq('destaque', true)
        .eq('disponivel', true)
        .limit(5);
      
      if (productsError) {
        console.error('Erro ao buscar produtos:', productsError);
        throw productsError;
      }
      console.log('Produtos encontrados:', productsData?.length);
      
      // Processando os dados
      if (categoriesData) {
        setCategories(categoriesData);
      }
      
      if (productsData) {
        setFeaturedProducts(productsData);
      }
    } catch (error) {
      console.error('Erro detalhado:', error);
      if (error instanceof Error) {
        console.error('Mensagem de erro:', error.message);
        console.error('Stack trace:', error.stack);
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="pb-16 px-4 sm:px-6 md:px-8">
        {/* Header com saudação */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6">
          <div
            className="opacity-100 transform translate-y-0"
          >
            <h1 className="text-2xl font-bold mb-2">Hummm!</h1>
            <p className="text-white/90">Qual vai ser a boa de hoje?</p>
          </div>
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
            <div className="flex space-x-2 overflow-x-auto pb-2 sm:space-x-4" style={{ minWidth: 'max-content' }}>
              {categories.map(category => (
                <div
                  key={category.id}
                  onClick={() => navigate(`/category/${category.id}`)}
                  className="flex flex-col items-center w-20 flex-shrink-0 cursor-pointer group sm:w-24 md:w-32 transition-transform duration-200 hover:scale-105"
                >
                  <div className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center mb-2 border-2 border-gray-200 group-hover:border-primary transition-all duration-200 md:h-24 md:w-24"
                        style={{ backgroundColor: 'var(--cor-primaria)' }}>
                    <img
                      src={category.imagem_url}
                      alt={category.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-center font-semibold text-gray-800 truncate w-full md:text-sm">
                    {category.nome}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Produtos em destaque */}
        {featuredProducts.length > 0 && (
          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Queridinhos da galera</h2>
            
            <div className="overflow-x-auto pb-4">
              <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2 sm:space-x-3 md:space-x-4" style={{ minWidth: 'max-content' }}>
                {featuredProducts.map(product => (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white rounded-lg shadow-md overflow-hidden w-36 max-w-sm cursor-pointer hover:shadow-lg transition-all duration-200 sm:w-48 md:w-56 transform hover:scale-105"
                  >
                    <div className="h-28 overflow-hidden md:h-32">
                      <img 
                        src={product.imagem_url} 
                        alt={product.nome}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-2">
                      <h3 className="font-semibold text-gray-800 truncate">{product.nome}</h3>
                      <p className="text-sm text-gray-500 h-10 overflow-hidden md:text-base md:h-12">{product.descricao}</p>
                      <p className="text-red-600 font-bold mt-2">
                        R$ {product.preco.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
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