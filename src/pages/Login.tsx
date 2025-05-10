import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, Lock, Facebook } from 'lucide-react';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { signIn, loading } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  
  const onSubmit = async (data: LoginFormData) => {
    await signIn(data.email, data.password);
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
            <h1 className="text-2xl font-bold text-gray-900">Olá!</h1>
            <p className="text-gray-600">Bem vindo de volta</p>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              label="Senha"
              type="password"
              id="password"
              placeholder="Sua senha"
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
            
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-sm text-red-600 hover:text-red-800 transition-colors">
                Esqueci a senha
              </Link>
            </div>
            
            <Button
              type="submit"
              fullWidth
              disabled={loading}
              className="py-3"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">ou continue com</p>
            <div className="flex justify-center mt-3 space-x-4">
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </button>
              
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <Facebook size={20} className="text-blue-600" />
              </button>
              
              <button className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" fill="#FFC107"/> 
                  <path d="M2.543,7.151l3.473,2.855c0.958-2.791,3.596-4.805,6.73-4.805c1.498,0,2.866,0.549,3.921,1.453 l2.814-2.814C17.503,2.988,15.139,2,12.545,2C8.089,2,4.311,4.107,2.543,7.151z" fill="#FF3D00"/> 
                  <path d="M12.545,22c2.518,0,4.826-0.945,6.594-2.522l-3.045-2.442c-0.995,0.85-2.385,1.381-3.949,1.381 c-2.756,0-5.091-1.611-6.203-3.864l-3.198,2.481C4.416,19.654,8.136,22,12.545,22z" fill="#4CAF50"/> 
                  <path d="M22.001,12.248c0-0.753-0.08-1.478-0.22-2.196h-9.236v3.821h5.445c-0.293,0.958-0.94,1.872-1.896,2.518 l3.045,2.442C20.959,17.156,22.001,14.564,22.001,12.248z" fill="#1976D2"/>
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{' '}
              <Link to="/register" className="text-red-600 hover:text-red-800 font-medium transition-colors">
                Registre-se aqui.
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;