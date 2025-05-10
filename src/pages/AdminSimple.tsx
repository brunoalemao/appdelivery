import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';

const AdminSimple: React.FC = () => {
  const [nome, setNome] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [website, setWebsite] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nome || !logoUrl || !website) {
      toast.error('Preencha todos os campos');
      return;
    }
    
    setLoading(true);
    setMessage('');
    
    try {
      // Inserir patrocinador diretamente no banco
      const { data, error } = await supabase
        .from('patrocinadores')
        .insert([
          {
            nome,
            logo_url: logoUrl,
            website,
            ativo: true,
            ordem: 1
          }
        ])
        .select();
      
      if (error) {
        console.error('Erro ao adicionar patrocinador:', error);
        setMessage(`Erro: ${error.message}`);
        toast.error('Erro ao adicionar patrocinador');
      } else {
        console.log('Patrocinador adicionado com sucesso:', data);
        setMessage('Patrocinador adicionado com sucesso!');
        toast.success('Patrocinador adicionado com sucesso!');
        
        // Limpar formulário
        setNome('');
        setLogoUrl('');
        setWebsite('');
      }
    } catch (error) {
      console.error('Erro:', error);
      setMessage(`Erro: ${error}`);
      toast.error('Erro ao processar a requisição');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Adicionar Patrocinador (Simples)</h1>
        
        {message && (
          <div className={`p-4 mb-4 rounded-md ${message.includes('Erro') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {message}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="nome">
              Nome do Patrocinador
            </label>
            <input
              type="text"
              id="nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Nome da empresa"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="logoUrl">
              URL do Logo
            </label>
            <input
              type="text"
              id="logoUrl"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://exemplo.com/logo.png"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="website">
              Website
            </label>
            <input
              type="text"
              id="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="https://exemplo.com"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md text-white ${loading ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {loading ? 'Adicionando...' : 'Adicionar Patrocinador'}
          </button>
        </form>
        
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Verificar Banco de Dados</h2>
          <button
            onClick={async () => {
              try {
                const { data, error } = await supabase
                  .from('patrocinadores')
                  .select('*');
                
                if (error) {
                  console.error('Erro ao buscar patrocinadores:', error);
                  setMessage(`Erro ao verificar: ${error.message}`);
                } else {
                  console.log('Patrocinadores no banco:', data);
                  setMessage(`Patrocinadores encontrados: ${data.length}`);
                  
                  // Mostrar detalhes dos patrocinadores
                  if (data.length > 0) {
                    setMessage(`Patrocinadores encontrados: ${data.length}\n\n${JSON.stringify(data, null, 2)}`);
                  }
                }
              } catch (error) {
                console.error('Erro:', error);
                setMessage(`Erro ao verificar: ${error}`);
              }
            }}
            className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md"
          >
            Verificar Patrocinadores
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSimple;
