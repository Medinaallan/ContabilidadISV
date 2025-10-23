import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  History, 
  BarChart3, 
  ScrollText, 
  LogOut, 
  User, 
  Users,
  Clock,
  Plus,
  ChevronDown,
  FileText
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

// Importar componentes de secciones
import UploadSection from '@/components/sections/UploadSection';
import HistorySection from '@/components/sections/HistorySection';
import ReportsSection from '@/components/sections/ReportsSection';
import LogsSection from '@/components/sections/LogsSection';
import UsersSection from '@/components/sections/UsersSection';

// Tipos para las secciones
type SectionKey = 'upload' | 'history' | 'reports' | 'logs' | 'users';

interface NavItem {
  key: SectionKey;
  label: string;
  icon: React.ComponentType<any>;
  component: React.ComponentType<any>;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeSection, setActiveSection] = useState<SectionKey>('upload');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isConsolidacionesOpen, setIsConsolidacionesOpen] = useState(false);

  // Items de navegación para consolidaciones
  const consolidacionesItems: NavItem[] = [
    {
      key: 'upload',
      label: 'Crear Consolidación',
      icon: Plus,
      component: UploadSection,
    },
    {
      key: 'history',
      label: 'Historial',
      icon: History,
      component: HistorySection,
    },
    {
      key: 'reports',
      label: 'Reportes',
      icon: BarChart3,
      component: ReportsSection,
    },
  ];

  // Items de navegación independientes
  const independentNavItems: NavItem[] = [
    {
      key: 'logs',
      label: 'Logs del Sistema',
      icon: ScrollText,
      component: LogsSection,
    },
  ];

  // Agregar sección de usuarios solo para administradores
  const adminItems: NavItem[] = user?.role === 'admin' ? [{
    key: 'users' as SectionKey,
    label: 'Gestión de Usuarios',
    icon: Users,
    component: UsersSection,
  }] : [];

  // Todos los items disponibles (para encontrar el componente activo)
  const allNavItems: NavItem[] = [...consolidacionesItems, ...independentNavItems, ...adminItems];

  // Actualizar reloj cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Aquí podrías cargar datos iniciales del dashboard si es necesario
        await new Promise(resolve => setTimeout(resolve, 500)); // Simular carga
      } catch (error) {
        console.error('Error cargando datos iniciales:', error);
        toast.error('Error cargando datos del dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Manejar logout
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error en logout:', error);
    }
  };

  // Obtener el componente de la sección activa
  const ActiveComponent = allNavItems.find(item => item.key === activeSection)?.component || UploadSection;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loading size="lg" text="Cargando dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                SERVICIOS CONTABLES DE OCCIDENTE
              </h1>
            </div>

            {/* Navegación principal */}
            <nav className="flex space-x-1">
              {/* Menú dropdown de Consolidaciones */}
              <div className="relative">
                <button
                  onMouseEnter={() => setIsConsolidacionesOpen(true)}
                  onMouseLeave={() => setIsConsolidacionesOpen(false)}
                  className={`
                    flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${consolidacionesItems.some(item => item.key === activeSection)
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }
                  `}
                >
                  <FileText className="h-4 w-4" />
                  <span>Consolidaciones</span>
                  <ChevronDown className="h-3 w-3" />
                </button>

                {/* Dropdown menu */}
                {isConsolidacionesOpen && (
                  <div
                    className="absolute top-full left-0 mt-1 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                    onMouseEnter={() => setIsConsolidacionesOpen(true)}
                    onMouseLeave={() => setIsConsolidacionesOpen(false)}
                  >
                    {consolidacionesItems.map((item) => {
                      const IconComponent = item.icon;
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            setActiveSection(item.key);
                            setIsConsolidacionesOpen(false);
                          }}
                          className={`
                            w-full flex items-center space-x-3 px-4 py-2 text-sm transition-colors text-left
                            ${activeSection === item.key
                              ? 'bg-primary-50 text-primary-700'
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                          `}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Items de navegación independientes */}
              {independentNavItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${activeSection === item.key
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}

              {/* Items de administrador */}
              {adminItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key)}
                    className={`
                      flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                      ${activeSection === item.key
                        ? 'bg-primary-100 text-primary-700 border border-primary-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    <IconComponent className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Información del usuario y controles */}
            <div className="flex items-center space-x-4">
              {/* Reloj */}
              <div className="flex items-center space-x-1 text-sm text-gray-600">
                <Clock className="h-4 w-4" />
                <span>
                  {format(currentTime, 'HH:mm:ss', { locale: es })}
                </span>
              </div>

              {/* Información del usuario */}
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-600" />
                <div className="text-right">
                  <div className="font-medium text-gray-900">{user?.username}</div>
                  <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                </div>
              </div>

              {/* Botón de logout */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Fecha actual */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {allNavItems.find(item => item.key === activeSection)?.label}
          </h2>
          <p className="text-gray-600">
            {format(currentTime, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {/* Sección activa */}
        <div className="fade-in">
          {activeSection === 'users' ? (
            <UsersSection userRole={user?.role || 'user'} />
          ) : (
            <ActiveComponent />
          )}
        </div>
      </main>

      {/* Footer opcional */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <p>© 2025 Servicios Contables de Occidente - Area de Desarrollo y Gestion Tecnologica</p>
            <p>Usuario: {user?.email}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DashboardPage;