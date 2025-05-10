import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useLocalStorage } from '../hooks/useLocalStorage';

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
  const [profileLoading, setProfileLoading] = useState(false);
  const [cachedProfile, setCachedProfile] = useLocalStorage<any | null>('userProfile', null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const initializeAuth = async () => {
      if (!isMounted) return;
      setLoading(true);
      
      try {
        // Verifica a sessão atual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // Se temos um usuário logado
        if (currentSession?.user) {
          // Verifica se temos um perfil em cache para este usuário
          if (cachedProfile && typeof cachedProfile === 'object' && 
              cachedProfile.user_id === currentSession.user.id) {
            // Usa o perfil em cache
            setUserProfile(cachedProfile);
            setIsAdmin(cachedProfile?.is_admin || false);
            // Atualiza o perfil em segundo plano
            if (isMounted) {
              fetchUserProfile(currentSession.user.id, false);
            }
          } else {
            // Busca o perfil do usuário se não tiver em cache
            if (isMounted) {
              await fetchUserProfile(currentSession.user.id, true);
            }
          }
        }

        // Configura o listener para mudanças de autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            if (!isMounted) return;
            
            setSession(newSession);
            setUser(newSession?.user ?? null);

            if (newSession?.user) {
              // Se o usuário fez login, busca o perfil
              if (event === 'SIGNED_IN') {
                await fetchUserProfile(newSession.user.id, true);
              }
            } else if (event === 'SIGNED_OUT') {
              // Se o usuário fez logout, limpa o perfil
              setUserProfile(null);
              setIsAdmin(false);
              setCachedProfile(null);
            }
          }
        );

        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro ao inicializar autenticação:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchUserProfile = async (userId: string, blocking = true) => {
    // Se for blocking, indica que estamos aguardando o perfil para continuar
    if (blocking) {
      setProfileLoading(true);
    }
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
      
      // Salva o perfil no cache
      setCachedProfile(data);
    } catch (error) {
      console.error('Erro ao buscar perfil:', error);
    } finally {
      if (blocking) {
        setProfileLoading(false);
      }
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

  // Usando useMemo para evitar re-renderizações desnecessárias
  const value = useMemo(() => ({
    session,
    user,
    userProfile,
    loading: loading || profileLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
    isAdmin,
  }), [session, user, userProfile, loading, profileLoading, isAdmin]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};