import axios, { AxiosResponse, AxiosError } from 'axios';
import {
  User,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  UploadedFile,
  FileUploadResponse,
  ReportData,
  DashboardSummary,
  SystemLog,
  ConsolidatedData,
  ApiError
} from '@/types';

// Configuración base de axios
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Si estamos accediendo desde una IP de red, usar la misma IP para el backend
  const currentHost = window.location.hostname;
  if (currentHost !== 'localhost' && currentHost !== '127.0.0.1') {
    return `http://${currentHost}:3002/api`;
  }
  
  return 'http://localhost:3002/api';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 segundos
});

// Interceptor para agregar token de autorización
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/auth/register', userData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  getProfile: async (): Promise<{ user: User }> => {
    try {
      const response = await api.get<{ user: User }>('/auth/profile');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  validateToken: async (): Promise<{ valid: boolean; user: User }> => {
    try {
      const response = await api.get<{ valid: boolean; user: User }>('/auth/validate');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Servicios de archivos
export const fileService = {
  uploadFile: async (file: File): Promise<FileUploadResponse> => {
    try {
      const formData = new FormData();
      formData.append('excelFile', file);

      const response = await api.post<FileUploadResponse>('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getFileHistory: async (userId?: number): Promise<{ files: UploadedFile[] }> => {
    try {
      const params = userId ? { userId } : {};
      const response = await api.get<{ files: UploadedFile[] }>('/files/history', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  downloadFile: async (fileId: number): Promise<Blob> => {
    try {
      const response = await api.get(`/files/download/${fileId}`, {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getConsolidatedData: async (fileId: number): Promise<{
    file: { id: number; original_name: string; upload_date: string };
    data: ConsolidatedData[];
  }> => {
    try {
      const response = await api.get(`/files/data/${fileId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Servicios de reportes
export const reportsService = {
  getAllTotals: async (): Promise<{
    reports: ReportData[];
    summary: { totalReports: number; totalDataRows: number };
  }> => {
    try {
      const response = await api.get('/reports/totals');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getDashboardSummary: async (): Promise<DashboardSummary> => {
    try {
      const response = await api.get<DashboardSummary>('/reports/dashboard');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Servicios de logs
export const logsService = {
  getLogs: async (params?: {
    limit?: number;
    userId?: number;
    action?: string;
  }): Promise<{ logs: SystemLog[]; total: number }> => {
    try {
      const response = await api.get('/logs', { params });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createLog: async (logData: {
    action: string;
    description: string;
  }): Promise<{ message: string; log: SystemLog }> => {
    try {
      const response = await api.post('/logs', logData);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Servicio de salud del servidor
export const healthService = {
  checkHealth: async (): Promise<{
    status: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }> => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Función auxiliar para manejar errores de API
function handleApiError(error: any): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    
    if (axiosError.response?.data) {
      return new Error(axiosError.response.data.error || axiosError.response.data.message || 'Error de API');
    }
    
    if (axiosError.request) {
      return new Error('No se pudo conectar con el servidor');
    }
  }
  
  return new Error('Error inesperado');
}

// Token management utilities
export const tokenUtils = {
  getToken: (): string | null => {
    return localStorage.getItem('token');
  },

  setToken: (token: string): void => {
    localStorage.setItem('token', token);
  },

  removeToken: (): void => {
    localStorage.removeItem('token');
  },

  getUserData: (): User | null => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  setUserData: (user: User): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUserData: (): void => {
    localStorage.removeItem('user');
  }
};

// Exportar la instancia de axios para uso directo
export { api };