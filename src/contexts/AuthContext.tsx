import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, nome: string, telefone: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      
      // Verifica a sessão atual
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        await fetchUserProfile(currentSession.user.id);
      }

      const { data: authListener } = supabase.auth.onAuthStateChange(
        async (event, newSession) => {
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            await fetchUserProfile(newSession.user.id);
          } else {
            setUserProfile(null);
            setIsAdmin(false);
          }
        }
      );

      setLoading(false);
      
      return () => {
        authListener.subscription.unsubscribe();
      };
    };

    initializeAuth();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Perfil não existe, criar automaticamente
        const { data: newProfile, error: insertError } = await supabase
          .from('perfis')
          .insert({
            user_id: userId,
            nome: '',
            telefone: '',
            is_admin: false,
          })
          .select()
          .single();
        if (insertError) {
          console.error('Erro ao criar perfil do usuário:', insertError);
          return;
        }
        setUserProfile(newProfile);
        setIsAdmin(false);
        return;
      }

      if (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
        return;
      }

      setUserProfile(data);
      setIsAdmin(data?.is_admin || false);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data?.user) {
        await fetchUserProfile(data.user.id);
        toast.success('Login realizado com sucesso!');
        console.log('Email logado:', email);
        if (email.toLowerCase() === 'adm@gmail.com') {
          navigate('/admin');
        } else {
          navigate('/home');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
      console.error('Erro ao fazer login:', error);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, nome: string, telefone: string) => {
    try {
      setLoading(true);
      
      // Criar o usuário com autenticação
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      
      if (authData?.user) {
        // Criar o perfil do usuário
        const { error: profileError } = await supabase
          .from('perfis')
          .insert({
            user_id: authData.user.id,
            nome,
            telefone,
            is_admin: false,
          });

        if (profileError) throw profileError;
        
        toast.success('Cadastro realizado com sucesso!');
        navigate('/login');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta');
      console.error('Erro ao criar conta:', error);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      toast.success('Logout realizado com sucesso');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer logout');
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      toast.success('Email de recuperação enviado');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar email de recuperação');
      console.error('Erro ao enviar email de recuperação:', error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    session,
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};