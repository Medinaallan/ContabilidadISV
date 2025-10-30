import { ReactNode, ComponentType } from 'react';

// Tipos para la autenticación
export interface User {
  id: number;
  username: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

// Tipos para archivos
export interface UploadedFile {
  id: number;
  original_name: string;
  filename: string;
  filesize: number;
  upload_date: string;
  username: string;
}

export interface FileUploadResponse {
  message: string;
  file: {
    id: number;
    original_name: string;
    filename: string;
    filesize: number;
    upload_date: string;
  };
}

// Tipos para datos consolidados
export interface ConsolidatedData {
  id: number;
  file_id: number;
  sheet_name: string;
  row_data: Record<string, any>[];
  totals: ConsolidationTotals;
  created_at: string;
}

export interface ConsolidationTotals {
  totalRows: number;
  numericColumns: Record<string, {
    sum: number;
    count: number;
    min: number;
    max: number;
    average: number;
  }>;
  summary: {
    headers: string[];
    totalDataRows: number;
    numericColumnsCount: number;
  };
}

// Tipos para reportes
export interface ReportData {
  id: number;
  filename: string;
  username: string;
  created_at: string;
  totals: ConsolidationTotals;
  summary: {
    totalRows: number;
    numericColumns: number;
    mainTotals: Array<{
      column: string;
      sum: number;
      average: number;
      count: number;
    }>;
  };
}

export interface DashboardSummary {
  totalFiles: number;
  totalUsers: number;
  totalConsolidations: number;
  recentActivity: Array<{
    id: number;
    action: string;
    description: string;
    username: string;
    created_at: string;
  }>;
  filesByUser: Record<string, number>;
  recentFiles: Array<{
    id: number;
    original_name: string;
    username: string;
    upload_date: string;
  }>;
}

// Tipos para logs
export interface SystemLog {
  id: number;
  username: string;
  action: string;
  description: string;
  ip_address?: string;
  created_at: string;
  // Campos amigables para bitácora
  formatted_title?: string;
  formatted_message?: string;
  category?: string;
  priority?: 'critico' | 'alerta' | 'importante' | 'normal' | 'bajo';
  category_icon?: string;
  priority_color?: string;
  friendly_date?: string;
  location_info?: string;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: any;
}

// Estados de la aplicación
export interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Props para componentes
export interface BaseComponentProps {
  className?: string;
  children?: ReactNode;
}

export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

// Tipos para formularios
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'file' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

// Tipos para navegación
export interface NavItem {
  key: string;
  label: string;
  icon: ComponentType<any>;
  component?: ComponentType<any>;
  requireAdmin?: boolean;
}