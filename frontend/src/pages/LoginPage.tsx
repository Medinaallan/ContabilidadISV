import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, User, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';

interface LoginFormData {
  username: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  // Limpiar errores al desmontar o cambiar de página
  useEffect(() => {
    return () => {
      clearError();
    };
  }, []); // Removido clearError de las dependencias para evitar el bucle infinito

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
    } catch (error) {
      // Los errores se manejan en el contexto
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          {/* Logo */}
            <div className="flex items-center">
              <img 
                src="/logo-home.png" 
                alt="Servicios Contables de Occidente" 
                className="h-300 w-300"
              />
            </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Iniciar Sesión
          </h2>
          
        </div>

        {/* Formulario */}
        <div className="card">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Usuario
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('username', {
                    required: 'El nombre de usuario es requerido',
                    minLength: {
                      value: 3,
                      message: 'El nombre de usuario debe tener al menos 3 caracteres'
                    }
                  })}
                  type="text"
                  id="username"
                  className="input-field pl-10"
                  placeholder="tu_usuario"
                  disabled={isSubmitting || isLoading}
                />
              </div>
              {errors.username && (
                <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('password', {
                    required: 'La contraseña es requerida',
                    minLength: {
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres'
                    }
                  })}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isSubmitting || isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting || isLoading}
                >
                  <span className="text-sm text-gray-500 hover:text-gray-700">
                    {showPassword ? 'Ocultar' : 'Mostrar'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            {/* Error general */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Botón de submit */}
            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center space-x-2"
              disabled={isSubmitting || isLoading}
            >
              {(isSubmitting || isLoading) ? (
                <Loading size="sm" text="" />
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Iniciar Sesión</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Información adicional */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Proporciona el ususario y contraseña que te asignaron para acceder al sistema.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;