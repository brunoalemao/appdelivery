import React, { useEffect, useState, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';
import { useLayout } from '../contexts/LayoutContext';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useLocalStorage } from '../hooks/useLocalStorage';

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

// Componente de item de produto otimizado com memo
const ProductItem = memo(({ product, index, onProductClick, onAddToCart }: {
  product: Product;
  index: number;
  onProductClick: (id: string) => void;
  onAddToCart: (product: Product) => void;
}) => {
  return (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
    >
      <div 
        className="flex cursor-pointer"
        onClick={() => onProductClick(product.id)}
      >
        <div className="w-24 h-24 flex-shrink-0">
          <img 
            src={product.imagem_url} 
            alt={product.nome}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="%23999">Imagem</text></svg>';
            }}
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
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onAddToCart(product);
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
  );
});

const ProductList: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { setPageTitle } = useLayout();
  
  // Cache para produtos e categorias com tratamento de erros
  const [cachedProducts, setCachedProducts] = useLocalStorage<Record<string, {data: Product[], timestamp: number}>>('cachedProducts', {});
  const [cachedCategory, setCachedCategory] = useLocalStorage<Record<string, {data: Category, timestamp: number}>>('cachedCategory', {});
  
  useEffect(() => {
    let isMounted = true;
    
    if (categoryId) {
      if (isMounted) {
        setProducts([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
      }
      
      const loadData = async () => {
        if (isMounted) {
          await fetchCategory();
          await fetchProducts(1);
        }
      };
      
      loadData();
    }
    
    return () => {
      isMounted = false;
    };
  }, [categoryId]);
  
  const fetchCategory = async () => {
    if (!categoryId) return;
    
    // Verificar cache
    const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos
    const now = Date.now();
    
    try {
      if (cachedCategory && typeof cachedCategory === 'object') {
        const cachedData = cachedCategory[categoryId];
        if (cachedData && cachedData.data && cachedData.timestamp && 
            typeof cachedData.timestamp === 'number' && 
            (now - cachedData.timestamp) < CACHE_DURATION) {
          // Usar dados do cache
          setCategory(cachedData.data);
          setPageTitle(cachedData.data.nome);
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar cache de categoria:', error);
    }
    
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .eq('id', categoryId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setCategory(data);
        setPageTitle(data.nome);
        
        // Atualizar cache
        setCachedCategory({
          ...cachedCategory,
          [categoryId]: {
            data,
            timestamp: now
          }
        });
      }
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
    }
  };
  
  const fetchProducts = async (pageNumber = page) => {
    if (!categoryId) return;
    
    // Verificar cache
    const CACHE_DURATION = 15 * 60 * 1000; // 15 minutos
    const cacheKey = `${categoryId}_page${pageNumber}`;
    const now = Date.now();
    
    if (pageNumber === 1) {
      setLoading(true);
    }
    
    try {
      if (cachedProducts && typeof cachedProducts === 'object') {
        const cachedData = cachedProducts[cacheKey];
        if (cachedData && Array.isArray(cachedData.data) && cachedData.timestamp && 
            typeof cachedData.timestamp === 'number' && 
            (now - cachedData.timestamp) < CACHE_DURATION) {
          // Usar dados do cache
          if (pageNumber === 1) {
            setProducts(cachedData.data);
          } else {
            setProducts(prev => [...prev, ...cachedData.data]);
          }
          setHasMore(cachedData.data.length === 10); // 10 é o limite por página
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Erro ao verificar cache de produtos:', error);
    }
    
    try {
      const PAGE_SIZE = 10;
      const from = (pageNumber - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      const { data, error } = await supabase
        .from('produtos')
        .select('id, nome, descricao, preco, imagem_url') // Selecionando apenas os campos necessários
        .eq('categoria_id', categoryId)
        .eq('disponivel', true)
        .order('nome')
        .range(from, to);
      
      if (error) throw error;
      
      const newProducts = data || [];
      
      if (pageNumber === 1) {
        setProducts(newProducts);
      } else {
        setProducts(prev => [...prev, ...newProducts]);
      }
      
      // Atualizar cache
      setCachedProducts({
        ...cachedProducts,
        [cacheKey]: {
          data: newProducts,
          timestamp: now
        }
      });
      
      // Verificar se há mais produtos para carregar
      setHasMore(newProducts.length === PAGE_SIZE);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleAddToCart = useCallback((product: Product) => {
    addToCart(product, 1);
  }, [addToCart]);
  
  const handleProductClick = useCallback((id: string) => {
    navigate(`/product/${id}`);
  }, [navigate]);
  
  const loadMoreProducts = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage);
    }
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
                    <ProductItem
                      key={product.id}
                      product={product}
                      index={index}
                      onProductClick={handleProductClick}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                  
                  {/* Botão de carregar mais */}
                  {hasMore && (
                    <div className="flex justify-center py-4">
                      <button
                        onClick={loadMoreProducts}
                        disabled={loading}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50"
                      >
                        {loading ? 'Carregando...' : 'Carregar mais produtos'}
                      </button>
                    </div>
                  )}
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