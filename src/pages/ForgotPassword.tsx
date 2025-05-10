import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

interface ForgotPasswordFormData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const { resetPassword, loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>();
  
  const onSubmit = async (data: ForgotPasswordFormData) => {
    await resetPassword(data.email);
  };
  
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
            <h1 className="text-2xl font-bold text-gray-900">Recuperar senha</h1>
            <p className="text-gray-600">Enviaremos instruções para seu email</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              id="email"
              placeholder="Seu email de cadastro"
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
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="py-3"
            >
              {loading ? 'Enviando...' : 'Enviar instruções'}
            </Button>
            
            <div className="text-center mt-4">
              <Link 
                to="/login"
                className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors"
              >
                <ArrowLeft size={16} className="mr-1" />
                Voltar para o login
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ForgotPassword;