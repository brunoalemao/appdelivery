/*
  # Estrutura inicial do banco de dados para o aplicativo de Food Truck

  1. New Tables
    - `categorias`: Armazena as categorias de produtos
      - `id` (uuid, primary key)
      - `nome` (text): Nome da categoria
      - `imagem_url` (text): URL da imagem da categoria
      - `ordem` (integer): Ordem de exibição da categoria
      - `created_at` (timestamp)
    
    - `produtos`: Armazena os produtos disponíveis
      - `id` (uuid, primary key)
      - `nome` (text): Nome do produto
      - `descricao` (text): Descrição do produto
      - `preco` (numeric): Preço do produto
      - `imagem_url` (text): URL da imagem do produto
      - `categoria_id` (uuid): Referência à categoria do produto
      - `disponivel` (boolean): Indica se o produto está disponível
      - `destaque` (boolean): Indica se o produto está em destaque
      - `created_at` (timestamp)
    
    - `pedidos`: Armazena os pedidos realizados
      - `id` (uuid, primary key)
      - `user_id` (uuid): Referência ao usuário que fez o pedido
      - `status` (text): Status do pedido (pending, preparing, delivery, completed, cancelled)
      - `total` (numeric): Valor total do pedido
      - `endereco_entrega` (text): Endereço de entrega
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `itens_pedido`: Armazena os itens de cada pedido
      - `id` (uuid, primary key)
      - `pedido_id` (uuid): Referência ao pedido
      - `produto_id` (uuid): Referência ao produto
      - `quantidade` (integer): Quantidade do produto
      - `preco_unitario` (numeric): Preço unitário do produto
      - `observacao` (text): Observações sobre o item
      - `created_at` (timestamp)
    
    - `enderecos`: Armazena os endereços dos usuários
      - `id` (uuid, primary key)
      - `user_id` (uuid): Referência ao usuário
      - `rua` (text): Nome da rua
      - `numero` (text): Número do endereço
      - `complemento` (text): Complemento do endereço
      - `bairro` (text): Bairro
      - `cidade` (text): Cidade
      - `estado` (text): Estado (UF)
      - `cep` (text): CEP
      - `padrao` (boolean): Indica se é o endereço padrão
      - `created_at` (timestamp)
    
    - `perfis`: Armazena os perfis dos usuários
      - `id` (uuid, primary key)
      - `user_id` (uuid): Referência ao usuário na tabela auth.users
      - `nome` (text): Nome completo do usuário
      - `telefone` (text): Telefone do usuário
      - `is_admin` (boolean): Indica se o usuário é administrador
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Habilitar RLS (Row Level Security) em todas as tabelas
    - Definir políticas de acesso para cada tabela
*/

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categorias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    imagem_url text NOT NULL,
    ordem integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nome text NOT NULL,
    descricao text NOT NULL,
    preco numeric NOT NULL CHECK (preco >= 0),
    imagem_url text NOT NULL,
    categoria_id uuid REFERENCES categorias(id),
    disponivel boolean DEFAULT true,
    destaque boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Tabela de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    status text DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'delivery', 'completed', 'cancelled')),
    total numeric NOT NULL CHECK (total >= 0),
    endereco_entrega text NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Tabela de itens do pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id uuid REFERENCES pedidos(id) ON DELETE CASCADE,
    produto_id uuid REFERENCES produtos(id),
    quantidade integer NOT NULL CHECK (quantidade > 0),
    preco_unitario numeric NOT NULL CHECK (preco_unitario >= 0),
    observacao text,
    created_at timestamptz DEFAULT now()
);

-- Tabela de endereços
CREATE TABLE IF NOT EXISTS enderecos (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    rua text NOT NULL,
    numero text NOT NULL,
    complemento text,
    bairro text NOT NULL,
    cidade text NOT NULL,
    estado text NOT NULL,
    cep text NOT NULL,
    padrao boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- Tabela de perfis
CREATE TABLE IF NOT EXISTS perfis (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    nome text NOT NULL,
    telefone text NOT NULL,
    is_admin boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE enderecos ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfis ENABLE ROW LEVEL SECURITY;

-- Políticas para categorias (todos podem ver)
CREATE POLICY "Qualquer pessoa pode visualizar categorias" 
ON categorias FOR SELECT USING (true);

-- Apenas admins podem modificar categorias
CREATE POLICY "Admins podem inserir categorias" 
ON categorias FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

CREATE POLICY "Admins podem atualizar categorias" 
ON categorias FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

CREATE POLICY "Admins podem excluir categorias" 
ON categorias FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

-- Políticas para produtos (todos podem ver)
CREATE POLICY "Qualquer pessoa pode visualizar produtos" 
ON produtos FOR SELECT USING (true);

-- Apenas admins podem modificar produtos
CREATE POLICY "Admins podem inserir produtos" 
ON produtos FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

CREATE POLICY "Admins podem atualizar produtos" 
ON produtos FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

CREATE POLICY "Admins podem excluir produtos" 
ON produtos FOR DELETE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

-- Políticas para pedidos
CREATE POLICY "Usuários podem visualizar seus próprios pedidos" 
ON pedidos FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem visualizar todos os pedidos" 
ON pedidos FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

CREATE POLICY "Usuários podem criar seus próprios pedidos" 
ON pedidos FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar pedidos" 
ON pedidos FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

-- Políticas para itens do pedido
CREATE POLICY "Usuários podem visualizar itens dos seus próprios pedidos" 
ON itens_pedido FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM pedidos 
    WHERE id = pedido_id AND user_id = auth.uid()
));

CREATE POLICY "Admins podem visualizar todos os itens de pedidos" 
ON itens_pedido FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

CREATE POLICY "Usuários podem inserir itens nos seus próprios pedidos" 
ON itens_pedido FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
    SELECT 1 FROM pedidos 
    WHERE id = pedido_id AND user_id = auth.uid()
));

-- Políticas para endereços
CREATE POLICY "Usuários podem visualizar seus próprios endereços" 
ON enderecos FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem inserir seus próprios endereços" 
ON enderecos FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios endereços" 
ON enderecos FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem excluir seus próprios endereços" 
ON enderecos FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- Políticas para perfis
CREATE POLICY "Usuários podem visualizar seus próprios perfis" 
ON perfis FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem visualizar todos os perfis" 
ON perfis FOR SELECT 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

CREATE POLICY "Usuários podem criar seus próprios perfis" 
ON perfis FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios perfis" 
ON perfis FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Admins podem atualizar todos os perfis" 
ON perfis FOR UPDATE 
TO authenticated 
USING (EXISTS (
    SELECT 1 FROM perfis 
    WHERE user_id = auth.uid() AND is_admin = true
));

-- Trigger para garantir apenas um endereço padrão por usuário
CREATE OR REPLACE FUNCTION update_endereco_padrao()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.padrao = true THEN
    UPDATE enderecos
    SET padrao = false
    WHERE user_id = NEW.user_id AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_endereco_padrao
BEFORE INSERT OR UPDATE ON enderecos
FOR EACH ROW
EXECUTE FUNCTION update_endereco_padrao();