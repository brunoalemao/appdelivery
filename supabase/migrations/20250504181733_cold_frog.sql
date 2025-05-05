/*
  # Dados iniciais para o aplicativo Food Truck
  
  1. Seed de dados
    - Insere categorias padrão (Combos, Lanches, Porções, Bebidas)
    - Insere produtos de exemplo para cada categoria
    - Cria um usuário administrador de exemplo
  
  2. Observações
    - O id do usuário admin precisa ser substituído após o cadastro real
    - As URLs das imagens são exemplos e devem ser substituídas
*/

-- Inserir categorias
INSERT INTO categorias (nome, imagem_url, ordem)
VALUES 
  ('Combos', 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', 1),
  ('Lanches', 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg', 2),
  ('Porções', 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg', 3),
  ('Bebidas', 'https://images.pexels.com/photos/2531188/pexels-photo-2531188.jpeg', 4);

-- Buscar IDs das categorias
DO $$
DECLARE
  combos_id uuid;
  lanches_id uuid;
  porcoes_id uuid;
  bebidas_id uuid;
BEGIN
  SELECT id INTO combos_id FROM categorias WHERE nome = 'Combos' LIMIT 1;
  SELECT id INTO lanches_id FROM categorias WHERE nome = 'Lanches' LIMIT 1;
  SELECT id INTO porcoes_id FROM categorias WHERE nome = 'Porções' LIMIT 1;
  SELECT id INTO bebidas_id FROM categorias WHERE nome = 'Bebidas' LIMIT 1;

  -- Inserir produtos
  -- Combos
  INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria_id, disponivel, destaque)
  VALUES 
    ('Combo X-Bacon', 'Hambúrguer com bacon, queijo, alface, tomate e maionese especial. Acompanha batata frita e refrigerante.', 32.90, 'https://images.pexels.com/photos/3219483/pexels-photo-3219483.jpeg', combos_id, true, true),
    ('Combo X-Salada', 'Hambúrguer com queijo, alface, tomate, cebola e maionese. Acompanha batata frita e refrigerante.', 28.90, 'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg', combos_id, true, false),
    ('Combo X-Burger', 'Hambúrguer tradicional com queijo e maionese. Acompanha batata frita e refrigerante.', 25.90, 'https://images.pexels.com/photos/2983098/pexels-photo-2983098.jpeg', combos_id, true, false),
    ('Combo Chicken', 'Hambúrguer de frango empanado com alface, tomate e maionese. Acompanha batata frita e refrigerante.', 29.90, 'https://images.pexels.com/photos/5474835/pexels-photo-5474835.jpeg', combos_id, true, true);

  -- Lanches
  INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria_id, disponivel, destaque)
  VALUES 
    ('X-Bacon', 'Hambúrguer com bacon, queijo, alface, tomate e maionese especial.', 22.90, 'https://images.pexels.com/photos/1639562/pexels-photo-1639562.jpeg', lanches_id, true, true),
    ('X-Salada', 'Hambúrguer com queijo, alface, tomate, cebola e maionese.', 18.90, 'https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg', lanches_id, true, false),
    ('X-Burger', 'Hambúrguer tradicional com queijo e maionese.', 15.90, 'https://images.pexels.com/photos/2983098/pexels-photo-2983098.jpeg', lanches_id, true, false),
    ('Chicken Burger', 'Hambúrguer de frango empanado com alface, tomate e maionese.', 19.90, 'https://images.pexels.com/photos/5474835/pexels-photo-5474835.jpeg', lanches_id, true, false),
    ('Vegetariano', 'Hambúrguer vegetariano com alface, tomate, cebola roxa e maionese vegana.', 23.90, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg', lanches_id, true, false);

  -- Porções
  INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria_id, disponivel, destaque)
  VALUES 
    ('Batata Frita P', 'Porção pequena de batata frita crocante.', 12.90, 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg', porcoes_id, true, true),
    ('Batata Frita M', 'Porção média de batata frita crocante.', 18.90, 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg', porcoes_id, true, false),
    ('Batata Frita G', 'Porção grande de batata frita crocante.', 25.90, 'https://images.pexels.com/photos/1583884/pexels-photo-1583884.jpeg', porcoes_id, true, false),
    ('Onion Rings', 'Anéis de cebola empanados e fritos.', 19.90, 'https://images.pexels.com/photos/5175537/pexels-photo-5175537.jpeg', porcoes_id, true, false),
    ('Nuggets', 'Porção de nuggets de frango.', 16.90, 'https://images.pexels.com/photos/6941031/pexels-photo-6941031.jpeg', porcoes_id, true, false);

  -- Bebidas
  INSERT INTO produtos (nome, descricao, preco, imagem_url, categoria_id, disponivel, destaque)
  VALUES 
    ('Refrigerante Lata', 'Lata de 350ml. Sabores: Cola, Guaraná, Laranja ou Lima Limão.', 5.90, 'https://images.pexels.com/photos/2531188/pexels-photo-2531188.jpeg', bebidas_id, true, false),
    ('Água Mineral', 'Garrafa de 500ml sem gás.', 3.90, 'https://images.pexels.com/photos/327090/pexels-photo-327090.jpeg', bebidas_id, true, false),
    ('Suco Natural', 'Copo de 300ml. Sabores: Laranja, Limão ou Abacaxi.', 8.90, 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg', bebidas_id, true, true),
    ('Milkshake', 'Copo de 400ml. Sabores: Chocolate, Morango ou Baunilha.', 12.90, 'https://images.pexels.com/photos/103566/pexels-photo-103566.jpeg', bebidas_id, true, false);
END $$;