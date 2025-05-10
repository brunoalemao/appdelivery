import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Layout from '../components/Layout';
import { useLocalStorage } from '../hooks/useLocalStorage';

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

interface Sponsor {
  id: string;
  nome: string;
  logo_url: string;
  site?: string;  // Campo opcional
  website?: string; // Campo opcional para compatibilidade
  ativo: boolean;
  ordem: number;
}

export default function Home() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  // Estado para patrocinadores com valores iniciais de fallback caso o banco falhe
  const [sponsors, setSponsors] = useState<Sponsor[]>([
    // Valores de fallback caso o banco não funcione
    {
      id: '1',
      nome: 'Grande Burger',
      logo_url: 'https://cdn-icons-png.flaticon.com/512/5787/5787016.png',
      site: 'https://www.example.com',
      ativo: true,
      ordem: 1
    }
  ]);
  const [loading, setLoading] = useState(true);

  // Usando localStorage para cache com tratamento de erros
  const [cachedCategories, setCachedCategories] = useLocalStorage<Category[]>('categories', []);
  const [cachedFeaturedProducts, setCachedFeaturedProducts] = useLocalStorage<FeaturedProduct[]>('featuredProducts', []);
  // Removida a variável cachedSponsors pois agora carregamos diretamente do banco
  const [lastFetchTime, setLastFetchTime] = useLocalStorage<number>('lastFetchTime', 0);
  
  useEffect(() => {
    let isMounted = true;
    
    // Removida a lógica de carregamento de patrocinadores do localStorage
    
    const loadData = async () => {
      // Definir um tempo de expiração do cache (5 minutos)
      const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos em milissegundos
      const currentTime = Date.now();
      
      try {
        // Usar cache se disponível e não expirado
        if (Array.isArray(cachedCategories) && Array.isArray(cachedFeaturedProducts) && 
            cachedCategories.length > 0 && cachedFeaturedProducts.length > 0 && 
            typeof lastFetchTime === 'number' && 
            (currentTime - lastFetchTime) < CACHE_EXPIRATION) {
          if (isMounted) {
            setCategories(cachedCategories);
            setFeaturedProducts(cachedFeaturedProducts);
            setLoading(false);
          }
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar cache:', error);
      }
      
      // Função para buscar dados otimizada
      try {
        // Buscar categorias e produtos em destaque em uma única transação
        const [categoriesResponse, productsResponse] = await Promise.all([
          supabase
            .from('categorias')
            .select('id, nome, imagem_url'), // Selecionando apenas os campos necessários
          
          supabase
            .from('produtos')
            .select('id, nome, descricao, preco, imagem_url') 
            .eq('destaque', true)
            .limit(10) 
        ]);
        
        // Abordagem robusta para buscar patrocinadores
        try {
          // Query extremamente simples - sem filtros, para maximizar chances de sucesso
          const { data, error } = await supabase
            .from('patrocinadores')
            .select();
          
          // Logs detalhados para depuração
          console.log('=== DEPURAÇÃO DE PATROCINADORES ===');
          console.log('Resposta bruta do banco:', data);
          console.log('Erro (se houver):', error);
          
          if (error) {
            console.error('Erro ao buscar patrocinadores:', error.message);
            console.error('Detalhes do erro:', error);
            // Manter os patrocinadores de fallback definidos no estado inicial
          } else if (data && data.length > 0) {
            console.log('Total de patrocinadores encontrados:', data.length);
            
            // Processar cada patrocinador individualmente para log detalhado
            const processedSponsors = data.map((item: any) => {
              console.log('Processando patrocinador:', item);
              const sponsor: Sponsor = {
                id: item.id?.toString() || '',
                nome: item.nome || 'Patrocinador',
                logo_url: item.logo_url || 'https://cdn-icons-png.flaticon.com/512/5787/5787016.png',
                // Aceitar tanto 'site' quanto 'website' conforme estrutura da tabela
                site: item.site || '',
                website: item.website || '',
                ativo: item.ativo === true,
                ordem: typeof item.ordem === 'number' ? item.ordem : 0
              };
              return sponsor;
            });
            
            // Mostrar dados processados nos logs
            console.log('Patrocinadores processados:', processedSponsors);
            
            // Usar esses dados processados
            setSponsors(processedSponsors);
          } else {
            console.log('Nenhum patrocinador encontrado no banco');
          }
        } catch (error) {
          console.error('Erro não tratado ao buscar patrocinadores:', error);
          // Manter os patrocinadores de fallback definidos no estado inicial
        }
        
        // Verifica se o componente ainda está montado antes de atualizar o estado
        if (!isMounted) return;
        
        if (categoriesResponse.error) {
          console.error('Error fetching categories:', categoriesResponse.error);
        } else {
          const categoriesData = categoriesResponse.data || [];
          setCategories(categoriesData);
          // Evita atualizações desnecessárias do localStorage
          if (JSON.stringify(categoriesData) !== JSON.stringify(cachedCategories)) {
            setCachedCategories(categoriesData);
          }
        }
        
        if (productsResponse.error) {
          console.error('Error fetching featured products:', productsResponse.error);
        } else {
          const productsData = productsResponse.data || [];
          setFeaturedProducts(productsData);
          // Evita atualizações desnecessárias do localStorage
          if (JSON.stringify(productsData) !== JSON.stringify(cachedFeaturedProducts)) {
            setCachedFeaturedProducts(productsData);
          }
        }
        
        // Não precisamos mais atualizar os patrocinadores aqui, pois já foi feito na chamada do Supabase
        
        // Atualizar o timestamp da última busca
        setLastFetchTime(currentTime);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    loadData();
    
    // Cleanup function
    return () => {
      isMounted = false;
    };
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
                      loading="lazy"
                      onError={(e) => {
                        // Fallback para imagem padrão em caso de erro
                        (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="%23999">Imagem</text></svg>';
                      }}
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
        
        {/* Patrocinadores Parceiros - Carrossel */}
        {sponsors.length > 0 && (
          <div className="px-4 mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Patrocinadores Parceiros</h2>
            <div className="bg-white rounded-lg shadow-sm p-4 overflow-hidden">
              {/* CSS para o carrossel na página */}
              <style dangerouslySetInnerHTML={{ __html: `
                .sponsors-wrapper {
                  overflow: hidden;
                  position: relative;
                  width: 100%;
                }
                .sponsors-track {
                  display: flex;
                  width: max-content;
                  animation: marquee 20s linear infinite;
                }
                @keyframes marquee {
                  0% { transform: translateX(0); }
                  100% { transform: translateX(-50%); }
                }
                .sponsor-item {
                  flex-shrink: 0;
                  margin: 0 15px;
                  width: 120px;
                }
              `}} />
              
              {/* Carrossel de patrocinadores */}
              <div className="sponsors-wrapper">
                <div className="sponsors-track">
                  {/* Original + repetido para efeito infinito */}
                  {[...sponsors, ...sponsors].map((sponsor, index) => (
                    <div
                      key={`${sponsor.id}-${index}`}
                      className="sponsor-item flex flex-col items-center justify-center p-2 border border-gray-200 rounded-lg"
                    >
                      <div className="h-16 w-16 mb-2 flex items-center justify-center">
                        <img
                          src={sponsor.logo_url}
                          alt={sponsor.nome}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="%23999">Logo</text></svg>';
                          }}
                        />
                      </div>
                      <span className="text-xs text-center font-medium text-gray-700">
                        {sponsor.nome}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
                      loading="lazy"
                      onError={(e) => {
                        // Fallback para imagem padrão em caso de erro
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200';
                      }}
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
