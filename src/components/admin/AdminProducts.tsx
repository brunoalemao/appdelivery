import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';
import Input from '../Input';
import toast from 'react-hot-toast';

interface Product {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  imagem_url: string;
  categoria_id: string;
  categoria?: {
    nome: string;
  };
  disponivel: boolean;
  destaque: boolean;
}

interface Category {
  id: string;
  nome: string;
}

const AdminProducts: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductsList />} />
      <Route path="/new" element={<ProductForm />} />
      <Route path="/edit/:id" element={<ProductForm />} />
    </Routes>
  );
};

const ProductsList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);
  
  const fetchProducts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('produtos')
        .select(`
          *,
          categorias (nome)
        `)
        .order('nome');
      
      if (error) throw error;
      
      // Transformar os dados para o formato esperado
      const formattedProducts = data.map(product => ({
        ...product,
        categoria: product.categorias,
      }));
      
      setProducts(formattedProducts || []);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
    }
  };
  
  const handleToggleStatus = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ disponivel: !product.disponivel })
        .eq('id', product.id);
      
      if (error) throw error;
      
      // Atualizar a lista local
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, disponivel: !p.disponivel } : p
      ));
      
      toast.success(`Produto ${!product.disponivel ? 'ativado' : 'desativado'} com sucesso`);
    } catch (error) {
      console.error('Erro ao atualizar status do produto:', error);
      toast.error('Erro ao atualizar status do produto');
    }
  };
  
  const handleToggleFeature = async (product: Product) => {
    try {
      const { error } = await supabase
        .from('produtos')
        .update({ destaque: !product.destaque })
        .eq('id', product.id);
      
      if (error) throw error;
      
      // Atualizar a lista local
      setProducts(products.map(p => 
        p.id === product.id ? { ...p, destaque: !p.destaque } : p
      ));
      
      toast.success(`Produto ${!product.destaque ? 'destacado' : 'removido dos destaques'} com sucesso`);
    } catch (error) {
      console.error('Erro ao atualizar destaque do produto:', error);
      toast.error('Erro ao atualizar destaque do produto');
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('produtos')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Atualizar a lista local
      setProducts(products.filter(p => p.id !== id));
      
      toast.success('Produto excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
    }
  };
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.nome.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !filterCategory || product.categoria_id === filterCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <Button
          onClick={() => navigate('/admin/products/new')}
          icon={<Plus size={18} />}
        >
          Novo Produto
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-48">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-red-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoria
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destaque
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {product.imagem_url ? (
                              <img
                                src={product.imagem_url}
                                alt={product.nome}
                                className="h-10 w-10 rounded-md object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
                                <Package className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.nome}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.categoria?.nome || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        R$ {product.preco.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          product.disponivel 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.disponivel ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {product.destaque ? 'Sim' : 'Não'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleStatus(product)}
                            className="text-gray-600 hover:text-indigo-600"
                            title={product.disponivel ? 'Desativar' : 'Ativar'}
                          >
                            {product.disponivel ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                          
                          <button
                            onClick={() => handleToggleFeature(product)}
                            className={`${product.destaque ? 'text-yellow-500' : 'text-gray-600'} hover:text-yellow-600`}
                            title={product.destaque ? 'Remover destaque' : 'Destacar'}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={product.destaque ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                            className="text-gray-600 hover:text-blue-600"
                            title="Editar"
                          >
                            <Edit size={18} />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-gray-600 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

interface ProductFormProps {
  id?: string;
}

const ProductForm: React.FC<ProductFormProps> = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [product, setProduct] = useState<Partial<Product>>({
    nome: '',
    descricao: '',
    preco: 0,
    imagem_url: '',
    categoria_id: '',
    disponivel: true,
    destaque: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  
  // Extrair o ID do produto da URL para edição
  const productId = window.location.pathname.split('/').pop();
  
  useEffect(() => {
    fetchCategories();
    
    if (productId && productId !== 'new') {
      setIsEdit(true);
      fetchProduct(productId);
    }
  }, [productId]);
  
  // Preview da imagem
  useEffect(() => {
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(product.imagem_url || '');
    }
  }, [file, product.imagem_url]);
  
  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categorias')
        .select('id, nome')
        .order('nome');
      
      if (error) throw error;
      
      setCategories(data || []);
      
      // Definir a categoria padrão se não estiver em modo de edição
      if (!isEdit && data && data.length > 0 && !product.categoria_id) {
        setProduct(prev => ({ ...prev, categoria_id: data[0].id }));
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
    }
  };
  
  const fetchProduct = async (id: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProduct(data);
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast.error('Erro ao carregar dados do produto');
      navigate('/admin/products');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Converter valores numéricos
    if (type === 'number') {
      setProduct({ ...product, [name]: parseFloat(value) });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProduct({ ...product, [name]: checked });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Validar campos obrigatórios
      if (!product.nome || !product.descricao || !product.preco || !product.categoria_id) {
        toast.error('Preencha todos os campos obrigatórios');
        setLoading(false);
        return;
      }
      let imageUrl = product.imagem_url;
      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        
        // Create the full path
        const filePath = `produtos/${fileName}`;
        
        // Upload the file
        const { error: uploadError } = await supabase.storage
          .from('imagens')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (uploadError) {
          console.error('Upload error:', uploadError);
          toast.error(`Erro ao fazer upload da imagem: ${uploadError.message}`);
          setLoading(false);
          return;
        }
        
        // Get the public URL
        const { data: publicUrlData } = await supabase.storage
          .from('imagens')
          .getPublicUrl(filePath);
        
        if (!publicUrlData || !publicUrlData.publicUrl) {
          console.error('Could not get public URL');
          toast.error('Erro ao obter URL pública da imagem');
          setLoading(false);
          return;
        }
        
        imageUrl = publicUrlData.publicUrl;
      }
      if (isEdit) {
        const { error } = await supabase
          .from('produtos')
          .update({
            nome: product.nome,
            descricao: product.descricao,
            preco: product.preco,
            imagem_url: imageUrl,
            categoria_id: product.categoria_id,
            disponivel: product.disponivel,
            destaque: product.destaque,
          })
          .eq('id', productId);
        if (error) throw error;
        toast.success('Produto atualizado com sucesso');
      } else {
        const { error } = await supabase
          .from('produtos')
          .insert({
            nome: product.nome,
            descricao: product.descricao,
            preco: product.preco,
            imagem_url: imageUrl,
            categoria_id: product.categoria_id,
            disponivel: product.disponivel,
            destaque: product.destaque,
          });
        if (error) throw error;
        toast.success('Produto criado com sucesso');
      }
      navigate('/admin/products');
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error('Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading && isEdit) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate('/admin/products')}
          className="mr-4 p-1 rounded-full hover:bg-gray-200"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">
          {isEdit ? 'Editar Produto' : 'Novo Produto'}
        </h1>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Nome do Produto *"
                name="nome"
                value={product.nome}
                onChange={handleChange}
                placeholder="Nome do produto"
                required
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descrição *
              </label>
              <textarea
                name="descricao"
                value={product.descricao}
                onChange={handleChange}
                placeholder="Descrição do produto"
                rows={4}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              />
            </div>
            
            <div>
              <Input
                type="number"
                label="Preço (R$) *"
                name="preco"
                value={product.preco?.toString()}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoria *
              </label>
              <select
                name="categoria_id"
                value={product.categoria_id}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-4 py-2 text-gray-900 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
                required
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.nome}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Imagem *</label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files?.[0] || null)}
                className="mb-2"
                required={!isEdit}
              />
              {preview && (
                <div className="mt-2 max-w-xs">
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-24 w-auto object-cover rounded-md"
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="disponivel"
                name="disponivel"
                checked={product.disponivel}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="disponivel" className="ml-2 block text-sm text-gray-900">
                Produto disponível
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="destaque"
                name="destaque"
                checked={product.destaque}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="destaque" className="ml-2 block text-sm text-gray-900">
                Produto em destaque
              </label>
            </div>
          </div>
          
          <div className="mt-8 flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/admin/products')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Salvando...' : isEdit ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminProducts;