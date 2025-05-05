import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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
      <div className="pb-16 px-2 sm:px-4 md:px-6 lg:px-8">
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
            <div className="flex flex-wrap justify-center gap-4 p-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  onClick={() => navigate(`/category/${category.id}`)}
                  className="flex flex-col items-center w-24 cursor-pointer group sm:w-28 md:w-32 lg:w-36 transition-transform duration-200 hover:scale-105"
                >
                  <div className="h-24 w-24 rounded-full overflow-hidden flex items-center justify-center mb-2 border-2 border-gray-200 group-hover:border-primary transition-all duration-200 md:h-28 md:w-28"
                        style={{ backgroundColor: 'var(--cor-primaria)' }}>
                    <img
                      src={category.imagem_url}
                      alt={category.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-center font-semibold text-gray-800 truncate w-full md:text-base">
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
            <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2 sm:space-x-3 md:space-x-4 lg:space-x-6 -mx-2 pl-2 pr-4 sm:pl-3 sm:pr-5 md:pl-4 md:pr-6 lg:pl-5 lg:pr-7" style={{
              WebkitOverflowScrolling: 'touch'
            }}>
              {featuredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden w-36 max-w-sm cursor-pointer hover:shadow-lg transition-all duration-200 sm:w-44 md:w-52 lg:w-60 transform hover:scale-105"
                >
                  <div className="h-32 overflow-hidden md:h-36 lg:h-40">
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-2 sm:p-3 md:p-4">
                    <h3 className="font-semibold text-gray-800 truncate">{product.nome}</h3>
                    <p className="text-sm text-gray-500 h-12 overflow-hidden sm:text-base sm:h-14 md:text-lg md:h-16">{product.descricao}</p>
                    <p className="text-red-600 font-bold mt-2">
                      R$ {product.preco.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Home;