// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { useForm } from 'react-hook-form';
// import { Mail, Lock, User, UserPlus } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import Loading from '@/components/Loading';

// interface RegisterFormData {
//   username: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
// }

// const RegisterPage: React.FC = () => {
//   const { register: registerUser, isLoading, error, clearError } = useAuth();
//   const [showPassword, setShowPassword] = useState(false);
  
//   const {
//     register,
//     handleSubmit,
//     watch,
//     formState: { errors, isSubmitting },
//   } = useForm<RegisterFormData>();

//   const password = watch('password');

//   // Limpiar errores al desmontar o cambiar de página
//   useEffect(() => {
//     return () => {
//       clearError();
//     };
//   }, []); // Removido clearError de las dependencias para evitar el bucle infinito

//   const onSubmit = async (data: RegisterFormData) => {
//     try {
//       await registerUser(data.username, data.email, data.password);
//     } catch (error) {
//       // Los errores se manejan en el contexto
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full space-y-8">
//         {/* Header */}
//         <div className="text-center">
//           <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center mb-4">
//             <UserPlus className="h-8 w-8 text-white" />
//           </div>
//           <h2 className="text-3xl font-bold text-gray-900">
//             Crear Cuenta
//           </h2>
//           <p className="mt-2 text-sm text-gray-600">
//             Sistema de Consolidación Contable
//           </p>
//         </div>

//         {/* Formulario */}
//         <div className="card">
//           <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
//             {/* Nombre de usuario */}
//             <div>
//               <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
//                 Nombre de Usuario
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <User className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('username', {
//                     required: 'El nombre de usuario es requerido',
//                     minLength: {
//                       value: 3,
//                       message: 'El nombre debe tener al menos 3 caracteres'
//                     },
//                     maxLength: {
//                       value: 30,
//                       message: 'El nombre no puede tener más de 30 caracteres'
//                     }
//                   })}
//                   type="text"
//                   id="username"
//                   className="input-field pl-10"
//                   placeholder="Tu nombre de usuario"
//                   disabled={isSubmitting || isLoading}
//                 />
//               </div>
//               {errors.username && (
//                 <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
//               )}
//             </div>

//             {/* Email */}
//             <div>
//               <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
//                 Email
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Mail className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('email', {
//                     required: 'El email es requerido',
//                     pattern: {
//                       value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
//                       message: 'Email inválido'
//                     }
//                   })}
//                   type="email"
//                   id="email"
//                   className="input-field pl-10"
//                   placeholder="tu@email.com"
//                   disabled={isSubmitting || isLoading}
//                 />
//               </div>
//               {errors.email && (
//                 <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
//               )}
//             </div>

//             {/* Password */}
//             <div>
//               <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
//                 Contraseña
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('password', {
//                     required: 'La contraseña es requerida',
//                     minLength: {
//                       value: 6,
//                       message: 'La contraseña debe tener al menos 6 caracteres'
//                     }
//                   })}
//                   type={showPassword ? 'text' : 'password'}
//                   id="password"
//                   className="input-field pl-10 pr-10"
//                   placeholder="••••••••"
//                   disabled={isSubmitting || isLoading}
//                 />
//                 <button
//                   type="button"
//                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
//                   onClick={() => setShowPassword(!showPassword)}
//                   disabled={isSubmitting || isLoading}
//                 >
//                   <span className="text-sm text-gray-500 hover:text-gray-700">
//                     {showPassword ? 'Ocultar' : 'Mostrar'}
//                   </span>
//                 </button>
//               </div>
//               {errors.password && (
//                 <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
//               )}
//             </div>

//             {/* Confirmar Password */}
//             <div>
//               <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
//                 Confirmar Contraseña
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <Lock className="h-5 w-5 text-gray-400" />
//                 </div>
//                 <input
//                   {...register('confirmPassword', {
//                     required: 'Confirma tu contraseña',
//                     validate: value => value === password || 'Las contraseñas no coinciden'
//                   })}
//                   type={showPassword ? 'text' : 'password'}
//                   id="confirmPassword"
//                   className="input-field pl-10"
//                   placeholder="••••••••"
//                   disabled={isSubmitting || isLoading}
//                 />
//               </div>
//               {errors.confirmPassword && (
//                 <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
//               )}
//             </div>

//             {/* Error general */}
//             {error && (
//               <div className="bg-red-50 border border-red-200 rounded-md p-3">
//                 <p className="text-sm text-red-600">{error}</p>
//               </div>
//             )}

//             {/* Botón de submit */}
//             <button
//               type="submit"
//               className="btn-primary w-full flex items-center justify-center space-x-2"
//               disabled={isSubmitting || isLoading}
//             >
//               {(isSubmitting || isLoading) ? (
//                 <Loading size="sm" text="" />
//               ) : (
//                 <>
//                   <UserPlus className="h-5 w-5" />
//                   <span>Crear Cuenta</span>
//                 </>
//               )}
//             </button>
//           </form>

//           {/* Enlaces */}
//           <div className="mt-6 text-center">
//             <p className="text-sm text-gray-600">
//               ¿Ya tienes cuenta?{' '}
//               <Link 
//                 to="/login" 
//                 className="font-medium text-primary-600 hover:text-primary-500"
//               >
//                 Inicia sesión aquí
//               </Link>
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RegisterPage;