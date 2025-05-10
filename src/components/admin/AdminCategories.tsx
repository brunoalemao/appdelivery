import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import Button from '../Button';
import Input from '../Input';
import { Trash2, Edit } from 'lucide-react';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categorias').select('*').order('ordem');
    setCategories(data || []);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let imageUrl = '';
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(`categorias/${fileName}`, file);
      if (uploadError) {
        alert('Erro ao fazer upload da imagem');
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(`categorias/${fileName}`);
      imageUrl = publicUrlData.publicUrl;
    } else {
      alert('Selecione uma imagem!');
      setLoading(false);
      return;
    }
    await supabase.from('categorias').insert({ nome, imagem_url: imageUrl });
    setNome('');
    setFile(null);
    await fetchCategories();
    setLoading(false);
  };

  const handleEdit = async (cat: any) => {
    setEditingId(cat.id);
    setNome(cat.nome);
    setFile(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!editingId) return;

    let imageUrl = '';
    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('imagens')
        .upload(`categorias/${fileName}`, file);
      if (uploadError) {
        alert('Erro ao fazer upload da imagem');
        setLoading(false);
        return;
      }
      const { data: publicUrlData } = supabase.storage
        .from('imagens')
        .getPublicUrl(`categorias/${fileName}`);
      imageUrl = publicUrlData.publicUrl;
    }

    await supabase
      .from('categorias')
      .update({ 
        nome,
        imagem_url: file ? imageUrl : undefined
      })
      .eq('id', editingId);

    setEditingId(null);
    setNome('');
    setFile(null);
    await fetchCategories();
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta categoria?')) return;

    await supabase
      .from('categorias')
      .delete()
      .eq('id', id);

    await fetchCategories();
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Categorias</h2>
      <form onSubmit={editingId ? handleUpdate : handleAdd} className="flex flex-col gap-2 mb-6">
        <h3 className="text-lg font-medium mb-2">{editingId ? 'Editar Categoria' : 'Nova Categoria'}</h3>
        <Input
          label="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
          required
        />
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-medium text-gray-700">Imagem</label>
          {file && (
            <div className="flex items-center gap-2 mb-2">
              <img
                src={URL.createObjectURL(file)}
                alt="Prévia"
                className="w-20 h-20 object-cover rounded"
              />
              <span className="text-sm text-gray-500">{file.name}</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={e => {
              const selectedFile = e.target.files?.[0];
              if (selectedFile) {
                setFile(selectedFile);
              }
            }}
            className="mb-2"
            required
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? 'Salvando...' : editingId ? 'Atualizar' : 'Adicionar'}
        </Button>
      </form>
      <ul className="space-y-3">
        {categories.map((cat: any) => (
          <li key={cat.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded">
            <img src={cat.imagem_url} alt={cat.nome} className="w-12 h-12 rounded object-cover" />
            <div className="flex-1">
              <span className="font-medium">{cat.nome}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(cat)}
                className="p-1 text-blue-500 hover:text-blue-600"
                title="Editar"
              >
                <Edit size={20} />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1 text-red-500 hover:text-red-600"
                title="Excluir"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminCategories; 