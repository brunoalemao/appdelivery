import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, User, Phone } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

interface RegisterFormData {
  nome: string;
  email: string;
  telefone: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const { signUp, loading } = useAuth();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormData>();
  const [telefone, setTelefone] = useState('');
  
  const onSubmit = async (data: RegisterFormData) => {
    await signUp(data.email, data.password, data.nome, data.telefone);
  };
  
  const password = watch('password');
  
  // Função para aplicar máscara
  function formatTelefone(value: string) {
    value = value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length > 6) {
      return `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      return `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      return `(${value}`;
    }
    return '';
  }
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <Logo size={60} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900">Cadastre-se</h1>
            <p className="text-gray-600">Crie sua conta para continuar</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Nome completo"
              type="text"
              id="nome"
              placeholder="Seu nome completo"
              icon={<User size={18} className="text-gray-400" />}
              error={errors.nome?.message}
              {...register('nome', { 
                required: 'Nome é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Nome deve ter pelo menos 3 caracteres'
                }
              })}
            />
            
            <Input
              label="Email"
              type="email"
              id="email"
              placeholder="Seu email"
              icon={<Mail size={18} className="text-gray-400" />}
              error={errors.email?.message}
              {...register('email', { 
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido'
                }
              })}
            />
            
            <Input
              label="Telefone"
              type="tel"
              id="telefone"
              placeholder="(00) 00000-0000"
              icon={<Phone size={18} className="text-gray-400" />}
              error={errors.telefone?.message}
              value={telefone}
              onChange={e => {
                const masked = formatTelefone(e.target.value);
                setTelefone(masked);
                setValue('telefone', masked);
              }}
              name="telefone"
              ref={register('telefone', { 
                required: 'Telefone é obrigatório',
                pattern: {
                  value: /^\(\d{2}\) \d{5}-\d{4}$/,
                  message: 'Telefone deve estar no formato (00) 00000-0000'
                }
              }).ref}
            />
            
            <Input
              label="Senha"
              type="password"
              id="password"
              placeholder="Crie uma senha"
              icon={<Lock size={18} className="text-gray-400" />}
              error={errors.password?.message}
              {...register('password', { 
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'A senha deve ter pelo menos 6 caracteres'
                }
              })}
            />
            
            <Input
              label="Confirme a senha"
              type="password"
              id="confirmPassword"
              placeholder="Confirme sua senha"
              icon={<Lock size={18} className="text-gray-400" />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', { 
                required: 'Confirmação de senha é obrigatória',
                validate: value => value === password || 'As senhas não coincidem'
              })}
            />
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="py-3"
            >
              {loading ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-red-600 hover:text-red-800 font-medium transition-colors">
                Faça login
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;