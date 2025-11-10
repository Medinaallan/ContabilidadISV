import React, { createContext, useContext, useReducer, useEffect, ReactNode, useCallback } from 'react';
import { User, AppState } from '@/types';
import { authService, tokenUtils } from '@/services/api';
import toast from 'react-hot-toast';

// Tipos para las acciones del reducer
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

// Estado inicial
const initialState: AppState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

// Reducer para manejar el estado
const authReducer = (state: AppState, action: AuthAction): AppState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

// Interfaz del contexto
interface AuthContextType extends AppState {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider del contexto
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Verificar token al montar el componente
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenUtils.getToken();
      const userData = tokenUtils.getUserData();

      if (token && userData) {
        try {
          // Validar token con el servidor
          const response = await authService.validateToken();
          if (response.valid) {
            dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
          } else {
            // Token inválido, limpiar datos
            tokenUtils.removeToken();
            tokenUtils.removeUserData();
            dispatch({ type: 'LOGOUT' });
          }
        } catch (error) {
          console.error('Error validando token:', error);
          tokenUtils.removeToken();
          tokenUtils.removeUserData();
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Función de login
  const login = async (username: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.login({ username, password });
      
      // Guardar token y datos del usuario
      tokenUtils.setToken(response.token);
      tokenUtils.setUserData(response.user);

      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      
      toast.success(`¡Bienvenido, ${response.user.username}!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Función de registro
  const register = async (username: string, email: string, password: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await authService.register({ username, email, password });
      
      // Guardar token y datos del usuario
      tokenUtils.setToken(response.token);
      tokenUtils.setUserData(response.user);

      dispatch({ type: 'LOGIN_SUCCESS', payload: response.user });
      
      toast.success(`¡Registro exitoso! Bienvenido, ${response.user.username}!`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrarse';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Función de logout
  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      tokenUtils.removeToken();
      tokenUtils.removeUserData();
      dispatch({ type: 'LOGOUT' });
      toast.success('Sesión cerrada correctamente');
    }
  };

  // Función para limpiar errores
  const clearError = useCallback((): void => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};