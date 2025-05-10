import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface Sponsor {
  id: string;
  nome: string;
  logo_url: string;
  website: string;
  ativo: boolean;
  ordem: number;
}

const AdminSponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [newSponsor, setNewSponsor] = useState<Partial<Sponsor>>({
    nome: '',
    logo_url: '',
    website: '',
    ativo: true,
    ordem: 0
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  // Removida a lógica de localStorage

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patrocinadores')
        .select('*')
        .order('ordem');

      if (error) {
        throw error;
      }

      setSponsors(data || []);
    } catch (error) {
      console.error('Erro ao buscar patrocinadores:', error);
      toast.error('Não foi possível carregar os patrocinadores');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
    setNewSponsor({
      nome: '',
      logo_url: '',
      website: '',
      ativo: true,
      ordem: sponsors.length > 0 ? Math.max(...sponsors.map(s => s.ordem || 0)) + 1 : 1
    });
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
    setNewSponsor({
      nome: '',
      logo_url: '',
      website: '',
      ativo: true,
      ordem: 0
    });
  };

  const handleSaveNew = async () => {
    if (!newSponsor.nome || !newSponsor.logo_url || !newSponsor.website) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    
    // Log para depuração
    console.log('Adicionando patrocinador:', newSponsor);

    // Definir a ordem como a maior ordem existente + 1
    const ordem = sponsors.length > 0 ? Math.max(...sponsors.map(s => s.ordem || 0)) + 1 : 1;
    const sponsorToAdd = {
      ...newSponsor,
      ordem
    };
        ordem
      };

      const { error } = await supabase
        .from('patrocinadores')
        .insert([sponsorToAdd]);

      if (error) {
        throw error;
      }

      toast.success('Patrocinador adicionado com sucesso!');
      fetchSponsors();
      
      setIsAddingNew(false);
      setNewSponsor({
        nome: '',
        logo_url: '',
        website: '',
        ativo: true,
        ordem: 0
      });
    } catch (error) {
      console.error('Erro ao adicionar patrocinador:', error);
      toast.error('Não foi possível adicionar o patrocinador');
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor({ ...sponsor });
  };

  const handleCancelEdit = () => {
    setEditingSponsor(null);
  };

  const handleSaveEdit = async () => {
    try {
      if (!editingSponsor) return;

      if (!editingSponsor.nome || !editingSponsor.logo_url || !editingSponsor.website) {
        toast.error('Preencha todos os campos obrigatórios');
        return;
      }

      const { error } = await supabase
        .from('patrocinadores')
        .update({
          nome: editingSponsor.nome,
          logo_url: editingSponsor.logo_url,
          website: editingSponsor.website,
          ativo: editingSponsor.ativo,
          ordem: editingSponsor.ordem
        })
        .eq('id', editingSponsor.id);

      if (error) {
        throw error;
      }

      toast.success('Patrocinador atualizado com sucesso!');
      fetchSponsors();
      setEditingSponsor(null);
    } catch (error) {
      console.error('Erro ao atualizar patrocinador:', error);
      toast.error('Não foi possível atualizar o patrocinador');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      if (!window.confirm('Tem certeza que deseja excluir este patrocinador?')) {
        return;
      }

      const { error } = await supabase
        .from('patrocinadores')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast.success('Patrocinador excluído com sucesso!');
      fetchSponsors();
    } catch (error) {
      console.error('Erro ao excluir patrocinador:', error);
      toast.error('Não foi possível excluir o patrocinador');
    }
  };

  const handleToggleActive = async (sponsor: Sponsor) => {
    try {
      const { error } = await supabase
        .from('patrocinadores')
        .update({ ativo: !sponsor.ativo })
        .eq('id', sponsor.id);

      if (error) {
        throw error;
      }

      toast.success(`Patrocinador ${!sponsor.ativo ? 'ativado' : 'desativado'} com sucesso!`);
      fetchSponsors();
    } catch (error) {
      console.error('Erro ao atualizar status do patrocinador:', error);
      toast.error('Não foi possível atualizar o status do patrocinador');
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index <= 0) return;
    
    try {
      const currentSponsor = sponsors[index];
      const previousSponsor = sponsors[index - 1];
      
      // Troca as ordens
      const tempOrdem = currentSponsor.ordem;
      currentSponsor.ordem = previousSponsor.ordem;
      previousSponsor.ordem = tempOrdem;
      
      // Atualiza no banco de dados
      const updates = [
        { id: currentSponsor.id, ordem: currentSponsor.ordem },
        { id: previousSponsor.id, ordem: previousSponsor.ordem }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('patrocinadores')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      fetchSponsors();
    } catch (error) {
      console.error('Erro ao reordenar patrocinadores:', error);
      toast.error('Não foi possível reordenar os patrocinadores');
    }
  };
  
  const handleMoveDown = async (index: number) => {
    if (index >= sponsors.length - 1) return;
    
    try {
      const currentSponsor = sponsors[index];
      const nextSponsor = sponsors[index + 1];
      
      // Troca as ordens
      const tempOrdem = currentSponsor.ordem;
      currentSponsor.ordem = nextSponsor.ordem;
      nextSponsor.ordem = tempOrdem;
      
      // Atualiza no banco de dados
      const updates = [
        { id: currentSponsor.id, ordem: currentSponsor.ordem },
        { id: nextSponsor.id, ordem: nextSponsor.ordem }
      ];
      
      for (const update of updates) {
        const { error } = await supabase
          .from('patrocinadores')
          .update({ ordem: update.ordem })
          .eq('id', update.id);
          
        if (error) throw error;
      }
      
      fetchSponsors();
    } catch (error) {
      console.error('Erro ao reordenar patrocinadores:', error);
      toast.error('Não foi possível reordenar os patrocinadores');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Gerenciar Patrocinadores</h2>
        </div>
        <button
          onClick={handleAddNew}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
          disabled={isAddingNew}
        >
          <Plus className="mr-2 h-5 w-5" />
          Adicionar Patrocinador
        </button>
      </div>

      {isAddingNew && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Novo Patrocinador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome*</label>
              <input
                type="text"
                value={newSponsor.nome || ''}
                onChange={(e) => setNewSponsor({ ...newSponsor, nome: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="Nome do patrocinador"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL do Logo*</label>
              <input
                type="text"
                value={newSponsor.logo_url || ''}
                onChange={(e) => setNewSponsor({ ...newSponsor, logo_url: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://exemplo.com/logo.png"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website*</label>
              <input
                type="text"
                value={newSponsor.website || ''}
                onChange={(e) => setNewSponsor({ ...newSponsor, website: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="https://exemplo.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ativo</label>
              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  checked={newSponsor.ativo || false}
                  onChange={(e) => setNewSponsor({ ...newSponsor, ativo: e.target.checked })}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Mostrar no aplicativo</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4 space-x-2">
            <button
              onClick={handleCancelAdd}
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md flex items-center"
            >
              <X className="mr-2 h-5 w-5" />
              Cancelar
            </button>
            <button
              onClick={handleSaveNew}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center"
            >
              <Save className="mr-2 h-5 w-5" />
              Salvar
            </button>
          </div>
        </div>
      )}

      {sponsors.length === 0 && !isAddingNew ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600">Nenhum patrocinador cadastrado. Adicione seu primeiro patrocinador!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Logo
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Website
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ordem
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sponsors.map((sponsor, index) => (
                <tr key={sponsor.id}>
                  {editingSponsor && editingSponsor.id === sponsor.id ? (
                    // Modo de edição
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editingSponsor.logo_url}
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, logo_url: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="URL do logo"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editingSponsor.nome}
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, nome: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Nome"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="text"
                          value={editingSponsor.website}
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, website: e.target.value })}
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Website"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={editingSponsor.ativo}
                            onChange={(e) => setEditingSponsor({ ...editingSponsor, ativo: e.target.checked })}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Ativo</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          value={editingSponsor.ordem}
                          onChange={(e) => setEditingSponsor({ ...editingSponsor, ordem: parseInt(e.target.value) || 0 })}
                          className="w-16 p-2 border border-gray-300 rounded-md"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={handleCancelEdit}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <X className="h-5 w-5" />
                          </button>
                          <button
                            onClick={handleSaveEdit}
                            className="text-green-600 hover:text-green-900"
                          >
                            <Save className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  ) : (
                    // Modo de visualização
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex-shrink-0 h-10 w-10">
                          <img
                            className="h-10 w-10 object-contain"
                            src={sponsor.logo_url}
                            alt={sponsor.nome}
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f0f0f0"/><text x="50%" y="50%" font-family="Arial" font-size="10" text-anchor="middle" dominant-baseline="middle" fill="%23999">Imagem</text></svg>';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{sponsor.nome}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <a
                          href={sponsor.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-900 underline"
                        >
                          {sponsor.website}
                        </a>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            sponsor.ativo
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sponsor.ativo ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-900">{sponsor.ordem}</span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0}
                              className={`text-gray-500 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-900'}`}
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => handleMoveDown(index)}
                              disabled={index === sponsors.length - 1}
                              className={`text-gray-500 ${index === sponsors.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:text-gray-900'}`}
                            >
                              ▼
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleToggleActive(sponsor)}
                            className={`${
                              sponsor.ativo ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                            }`}
                            title={sponsor.ativo ? 'Desativar' : 'Ativar'}
                          >
                            {sponsor.ativo ? '🔴' : '🟢'}
                          </button>
                          <button
                            onClick={() => handleEdit(sponsor)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sponsor.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminSponsors;
