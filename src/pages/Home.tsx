import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
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

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categorias')
        .select('*');

      if (categoriesError) {
        console.error('Error fetching categories:', categoriesError);
        return;
      }

      setCategories(categoriesData || []);
    };

    const fetchFeaturedProducts = async () => {
      const { data: productsData, error: productsError } = await supabase
        .from('produtos')
        .select('*')
        .eq('destaque', true);

      if (productsError) {
        console.error('Error fetching featured products:', productsError);
        return;
      }

      setFeaturedProducts(productsData || []);
    };

    Promise.all([fetchCategories(), fetchFeaturedProducts()])
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
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

          <div className="px-4 py-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Queridinhos da galera</h2>
            <div className="grid grid-cols-1 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className="relative h-40 sm:h-48 md:h-56 lg:h-64">
                    <div className="w-full h-full bg-gray-200 animate-pulse absolute inset-0" />
                  </div>
                  <div className="p-2 sm:p-3 md:p-4">
                    <div className="h-4 w-24 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-6 w-32 bg-gray-200 rounded mb-2 animate-pulse" />
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        {/* Categorias em um slider horizontal */}
        <div className="px-4 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Categorias</h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex space-x-4">
              {categories.map(category => (
                <div
                  key={category.id}
                  onClick={() => navigate(`/category/${category.id}`)}
                  className="min-w-[100px] cursor-pointer group transition-transform duration-200 hover:scale-105"
                >
                  <div className="h-20 w-20 rounded-full overflow-hidden flex items-center justify-center mb-2 border-2 border-gray-200 group-hover:border-primary transition-all duration-200"
                    style={{ backgroundColor: 'var(--cor-primaria)' }}
                  >
                    <img
                      src={category.imagem_url}
                      alt={category.nome}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs text-center font-semibold text-gray-800 truncate w-20">
                    {category.nome}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Produtos em Destaque */}
        {featuredProducts.length > 0 && (
          <div className="px-4">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Queridinhos da galera</h2>
            <div className="grid grid-cols-1 gap-4">
              {featuredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <div className="relative h-40 sm:h-48 md:h-56 lg:h-64">
                    <img 
                      src={product.imagem_url} 
                      alt={product.nome}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 mb-1">{product.nome}</h3>
                    <p className="text-sm text-gray-500 h-12 overflow-hidden">{product.descricao}</p>
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
}
