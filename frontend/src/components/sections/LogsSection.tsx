import React, { useState, useEffect } from 'react';
import { ScrollText, User, Clock, Activity, Filter, AlertTriangle, Info, CheckCircle, XCircle, Archive, RefreshCw } from 'lucide-react';
import { logsService } from '@/services/api';
import { SystemLog } from '@/types';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

interface LogStatistics {
  total: number;
  today: number;
  thisWeek: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

interface LogsResponse {
  logs: SystemLog[];
  total: number;
  statistics?: LogStatistics;
}

const LogsSection: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [statistics, setStatistics] = useState<LogStatistics | null>(null);

  // Cargar logs
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const response = await logsService.getLogs({ limit: 100 }) as LogsResponse;
        setLogs(response.logs);
        if (response.statistics) {
          setStatistics(response.statistics);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error cargando logs';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Filtrar logs por categoría y prioridad
  useEffect(() => {
    const filtered = logs.filter(log => {
      const categoryMatch = categoryFilter === '' || log.category === categoryFilter;
      const priorityMatch = priorityFilter === '' || log.priority === priorityFilter;
      return categoryMatch && priorityMatch;
    });
    setFilteredLogs(filtered);
  }, [logs, categoryFilter, priorityFilter]);

  // Obtener categorías y prioridades únicas para filtros
  const uniqueCategories = [...new Set(logs.map(log => log.category).filter(Boolean))].sort();
  const uniquePriorities = [...new Set(logs.map(log => log.priority).filter(Boolean))].sort();

  // Función para obtener ícono de prioridad
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critico': return <XCircle className="h-4 w-4" />;
      case 'alerta': return <AlertTriangle className="h-4 w-4" />;
      case 'importante': return <Info className="h-4 w-4" />;
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      default: return <Archive className="h-4 w-4" />;
    }
  };

  // Función para obtener color de prioridad
  const getPriorityColorClass = (priority: string) => {
    switch (priority) {
      case 'critico': return 'bg-red-100 text-red-800 border-red-200';
      case 'alerta': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'importante': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Función para recargar logs
  const reloadLogs = async () => {
    setIsLoading(true);
    try {
      const response = await logsService.getLogs({ limit: 100 }) as LogsResponse;
      setLogs(response.logs);
      if (response.statistics) {
        setStatistics(response.statistics);
      }
      toast.success('Bitácora actualizada');
    } catch (error) {
      toast.error('Error recargando bitácora');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" text="Cargando bitácora del sistema..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <ScrollText className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Bitácora del Sistema
              </h2>
            </div>
            <p className="text-gray-600 mt-1">
              Registro completo de actividades y eventos del sistema de contabilidad
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Sistema Activo
            </span>
          </div>
        </div>
      </div>

      {/* Estadísticas rápidas */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="card bg-blue-50 border-blue-200">
            <div className="flex items-center">
              <ScrollText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-900">Total</p>
                <p className="text-2xl font-bold text-blue-600">{statistics.total}</p>
              </div>
            </div>
          </div>
          <div className="card bg-green-50 border-green-200">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-900">Hoy</p>
                <p className="text-2xl font-bold text-green-600">{statistics.today}</p>
              </div>
            </div>
          </div>
          <div className="card bg-yellow-50 border-yellow-200">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-900">Esta Semana</p>
                <p className="text-2xl font-bold text-yellow-600">{statistics.thisWeek}</p>
              </div>
            </div>
          </div>
          <div className="card bg-purple-50 border-purple-200">
            <div className="flex items-center">
              <User className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-900">Categorías</p>
                <p className="text-2xl font-bold text-purple-600">{Object.keys(statistics.byCategory || {}).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Controles y filtros */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Registros de Bitácora
            </h3>
            <p className="text-sm text-gray-500">
              {filteredLogs.length} de {logs.length} evento{logs.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtro por categoría */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-4 w-4 text-gray-400" />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="input-field pl-9 pr-8 text-sm"
              >
                <option value="">Todas las categorías</option>
                {uniqueCategories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtro por prioridad */}
            <div className="relative">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="input-field pr-8 text-sm"
              >
                <option value="">Todas las prioridades</option>
                {uniquePriorities.map(priority => (
                  <option key={priority} value={priority}>
                    {priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Sin prioridad'}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={reloadLogs}
              className="btn-outline flex items-center space-x-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Timeline de logs */}
      {filteredLogs.length === 0 ? (
        <div className="card text-center py-12">
          <ScrollText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {(categoryFilter || priorityFilter) ? 'No se encontraron registros' : 'No hay registros disponibles'}
          </h3>
          <p className="text-gray-500">
            {(categoryFilter || priorityFilter) 
              ? 'Intenta con otros filtros de categoría o prioridad' 
              : 'Los eventos del sistema aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log) => {
                return (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-3">
                      {/* Ícono de categoría */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                        {log.category_icon || '📝'}
                      </div>
                      
                      {/* Contenido del log */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="text-sm font-semibold text-gray-900">
                                {log.formatted_title || log.action}
                              </h4>
                              {log.priority && (
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColorClass(log.priority)}`}>
                                  {getPriorityIcon(log.priority)}
                                  <span className="ml-1">{log.priority}</span>
                                </span>
                              )}
                              {log.category && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {log.category}
                                </span>
                              )}
                            </div>
                            
                            <p className="text-sm text-gray-700 mb-2">
                              {log.formatted_message || log.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{log.username || 'Sistema'}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="h-3 w-3" />
                                <span>{log.friendly_date || new Date(log.created_at).toLocaleString('es-ES')}</span>
                              </div>
                              {log.location_info && (
                                <span className="text-gray-400">
                                  {log.location_info}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="card bg-blue-50 border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center">
          <Info className="h-4 w-4 mr-1" />
          Información de la Bitácora
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• Esta bitácora registra automáticamente todas las actividades importantes del sistema.</p>
          <p>• Los eventos se clasifican por categoría y prioridad para facilitar su revisión.</p>
          <p>• Use los filtros para encontrar eventos específicos por tipo o importancia.</p>
          <p>• Los registros incluyen información del usuario, fecha, hora y origen para auditoría completa.</p>
        </div>
      </div>
    </div>
  );
};

export default LogsSection;