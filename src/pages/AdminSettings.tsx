import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Input from '../components/Input';
import Button from '../components/Button';
import { useConfig } from '../contexts/ConfigContext';

const CONFIG_ID = 'config-unica'; // Use um id fixo para configuração única

const AdminSettings: React.FC = () => {
  const [nomeApp, setNomeApp] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [corPrimaria, setCorPrimaria] = useState('#ff0000');
  const [corSecundaria, setCorSecundaria] = useState('#ffffff');
  const [loading, setLoading] = useState(false);
  const { config, fetchConfig } = useConfig();

  useEffect(() => {
    fetchConfig();
  }, []);

  // Atualiza os campos quando o config carregar
  useEffect(() => {
    if (config) {
      setNomeApp(config.nome_app || '');
      setLogoUrl(config.logo_url || '');
      setCorPrimaria(config.cor_primaria || '#ff0000');
      setCorSecundaria(config.cor_secundaria || '#ffffff');
    }
  }, [config]);

  const salvar = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('configuracoes').upsert({
      id: CONFIG_ID,
      nome_app: nomeApp,
      logo_url: logoUrl,
      cor_primaria: corPrimaria,
      cor_secundaria: corSecundaria,
    });
    if (!error) {
      await fetchConfig(); // Aguarda atualizar o contexto antes do alerta
      alert('Configurações salvas!');
    } else {
      alert('Erro ao salvar: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Configurações do App</h2>
      <Input label="Nome do App" value={nomeApp} onChange={e => setNomeApp(e.target.value)} />
      <Input label="Logo (URL)" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} />
      {logoUrl && <img src={logoUrl} alt="Logo" className="h-16 my-2" />}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cor Primária</label>
          <input type="color" value={corPrimaria} onChange={e => setCorPrimaria(e.target.value)} className="w-10 h-10 p-0 border-0" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cor Secundária</label>
          <input type="color" value={corSecundaria} onChange={e => setCorSecundaria(e.target.value)} className="w-10 h-10 p-0 border-0" />
        </div>
      </div>
      <Button onClick={salvar} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
    </div>
  );
};

export default AdminSettings; 