import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Lock, User, LogIn, Eye, EyeOff, Building2 } from 'lucide-react';
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Background con gradiente y patrones */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        {/* Patrones geométricos de fondo */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse animation-delay-4000"></div>
        </div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-8 lg:gap-16">
          
          {/* Panel izquierdo - Información */}
          <div className="hidden lg:flex flex-col justify-center text-white space-y-8">
            {/* <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">ContabilidadISV</h1>
                  <p className="text-lg text-white/80">Sistema de Consolidaciones</p>
                </div>
              </div>
            </div> */}
            
            {/* Logo/Imagen */}
            <div className="flex justify-center opacity-60">
              <img 
                src="/logo-home.png" 
                alt="Servicios Contables de Occidente" 
                className="h-48 w-auto object-contain filter brightness-0 invert"
              />
            </div>
          </div>

          {/* Panel derecho - Formulario */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md">
              {/* Header móvil */}
              <div className="lg:hidden text-center mb-8">
                <div className="flex justify-center mb-4">
                  <img 
                    src="/logo-home.png" 
                    alt="Servicios Contables de Occidente" 
                    className="h-16 w-auto object-contain filter brightness-0 invert"
                  />
                </div>
              </div>

              {/* Card del formulario */}
              <div className="bg-white/95 backdrop-blur-sm shadow-2xl rounded-2xl p-8 border border-white/20">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Bienvenido
                  </h2>
                  <p className="text-gray-600">
                    Ingresa tus credenciales para acceder
                  </p>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Username */}
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre de Usuario
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-800" />
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
                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        placeholder="Ingresa tu usuario"
                        disabled={isSubmitting || isLoading}
                      />
                    </div>
                    {errors.username && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                        {errors.username.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Contraseña
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
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
                        className="w-full pl-12 pr-16 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm"
                        placeholder="Ingresa tu contraseña"
                        disabled={isSubmitting || isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isSubmitting || isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <span className="inline-block w-4 h-4 mr-1">⚠️</span>
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Error general */}
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="text-red-500">⚠️</span>
                      </div>
                      <p className="text-sm text-red-700">{error}</p>
                    </div>
                  )}

                  {/* Botón de submit */}
                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isSubmitting || isLoading}
                  >
                    {(isSubmitting || isLoading) ? (
                      <>
                        <Loading size="sm" text="" />
                        <span>Iniciando sesión...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="h-5 w-5" />
                        <span>Iniciar Sesión</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Footer del card */}
                <div className="mt-8 pt-6 border-t border-gray-200 text-center">
                  <p className="text-xs text-gray-500">
                     Departamento de Desarrollo Tecnológico
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Acceso restringido
                  </p>
                  <p className="text-xs text-gray-500">
                    Servicios Contables de Occidente
                  </p>
                </div>
              </div>

              {/* Info adicional móvil */}
              <div className="lg:hidden mt-6 text-center">
                <p className="text-xs text-white/70">
                  Desarrollo a medida para empresas por Allan Medina
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;