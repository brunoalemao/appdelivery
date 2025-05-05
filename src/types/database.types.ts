export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      produtos: {
        Row: {
          id: string
          nome: string
          descricao: string
          preco: number
          imagem_url: string
          categoria_id: string
          disponivel: boolean
          destaque: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao: string
          preco: number
          imagem_url: string
          categoria_id: string
          disponivel?: boolean
          destaque?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string
          preco?: number
          imagem_url?: string
          categoria_id?: string
          disponivel?: boolean
          destaque?: boolean
          created_at?: string
        }
      }
      categorias: {
        Row: {
          id: string
          nome: string
          imagem_url: string
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          imagem_url: string
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          imagem_url?: string
          ordem?: number
          created_at?: string
        }
      }
      pedidos: {
        Row: {
          id: string
          user_id: string
          status: string
          total: number
          endereco_entrega: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          status?: string
          total: number
          endereco_entrega: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          status?: string
          total?: number
          endereco_entrega?: string
          created_at?: string
          updated_at?: string
        }
      }
      itens_pedido: {
        Row: {
          id: string
          pedido_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          observacao: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pedido_id: string
          produto_id: string
          quantidade: number
          preco_unitario: number
          observacao?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pedido_id?: string
          produto_id?: string
          quantidade?: number
          preco_unitario?: number
          observacao?: string | null
          created_at?: string
        }
      }
      enderecos: {
        Row: {
          id: string
          user_id: string
          rua: string
          numero: string
          complemento: string | null
          bairro: string
          cidade: string
          estado: string
          cep: string
          padrao: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          rua: string
          numero: string
          complemento?: string | null
          bairro: string
          cidade: string
          estado: string
          cep: string
          padrao?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          rua?: string
          numero?: string
          complemento?: string | null
          bairro?: string
          cidade?: string
          estado?: string
          cep?: string
          padrao?: boolean
          created_at?: string
        }
      }
      perfis: {
        Row: {
          id: string
          user_id: string
          nome: string
          telefone: string
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          telefone: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          telefone?: string
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}