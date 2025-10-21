import React, { useState, useEffect } from 'react';
import { ScrollText, User, Clock, Activity, Filter } from 'lucide-react';
import { logsService } from '@/services/api';
import { SystemLog } from '@/types';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

const LogsSection: React.FC = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);

  // Cargar logs
  useEffect(() => {
    const loadLogs = async () => {
      try {
        setIsLoading(true);
        const response = await logsService.getLogs({ limit: 100 });
        setLogs(response.logs);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error cargando logs';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();
  }, []);

  // Filtrar logs por acción
  useEffect(() => {
    const filtered = logs.filter(log =>
      actionFilter === '' || log.action.toLowerCase().includes(actionFilter.toLowerCase())
    );
    setFilteredLogs(filtered);
  }, [logs, actionFilter]);

  // Formatear fecha y hora
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    };
  };

  // Obtener color según el tipo de acción
  const getActionColor = (action: string) => {
    if (action.includes('LOGIN') || action.includes('REGISTER')) {
      return 'text-green-600 bg-green-50';
    } else if (action.includes('LOGOUT')) {
      return 'text-gray-600 bg-gray-50';
    } else if (action.includes('UPLOAD')) {
      return 'text-blue-600 bg-blue-50';
    } else if (action.includes('DOWNLOAD')) {
      return 'text-purple-600 bg-purple-50';
    } else if (action.includes('ERROR') || action.includes('FAIL')) {
      return 'text-red-600 bg-red-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  // Obtener ícono según el tipo de acción
  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN') || action.includes('LOGOUT')) {
      return <User className="h-4 w-4" />;
    } else if (action.includes('UPLOAD') || action.includes('DOWNLOAD')) {
      return <ScrollText className="h-4 w-4" />;
    }
    return <Activity className="h-4 w-4" />;
  };

  // Obtener acciones únicas para el filtro
  const uniqueActions = Array.from(new Set(logs.map(log => log.action))).sort();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" text="Cargando logs del sistema..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controles y estadísticas */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Logs del Sistema
            </h3>
            <p className="text-sm text-gray-500">
              {logs.length} evento{logs.length !== 1 ? 's' : ''} registrado{logs.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="input-field pl-10 pr-8"
              >
                <option value="">Todas las acciones</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>
                    {action}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              onClick={() => {
                // Recargar logs
                setIsLoading(true);
                logsService.getLogs({ limit: 100 })
                  .then(response => setLogs(response.logs))
                  .catch(error => toast.error('Error recargando logs'))
                  .finally(() => setIsLoading(false));
              }}
              className="btn-outline"
              disabled={isLoading}
            >
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Timeline de logs */}
      {filteredLogs.length === 0 ? (
        <div className="card text-center py-12">
          <ScrollText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {actionFilter ? 'No se encontraron logs' : 'No hay logs disponibles'}
          </h3>
          <p className="text-gray-500">
            {actionFilter 
              ? 'Intenta con otros filtros de acción' 
              : 'Los eventos del sistema aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="max-h-96 overflow-y-auto">
            <div className="divide-y divide-gray-200">
              {filteredLogs.map((log, index) => {
                const dateTime = formatDateTime(log.created_at);
                const actionColor = getActionColor(log.action);
                const actionIcon = getActionIcon(log.action);
                
                return (
                  <div key={log.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start space-x-3">
                      {/* Ícono de acción */}
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${actionColor}`}>
                        {actionIcon}
                      </div>
                      
                      {/* Contenido del log */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900">
                              {log.username || 'Sistema'}
                            </p>
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${actionColor}`}>
                              {log.action}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            <span>{dateTime.time}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline">{dateTime.date}</span>
                          </div>
                        </div>
                        
                        <p className="text-sm text-gray-600 mt-1">
                          {log.description}
                        </p>
                        
                        {log.ip_address && (
                          <p className="text-xs text-gray-400 mt-1">
                            IP: {log.ip_address}
                          </p>
                        )}
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
      <div className="card bg-yellow-50 border-yellow-200">
        <h4 className="text-sm font-semibold text-yellow-900 mb-2">
          Información de Logs
        </h4>
        <div className="text-xs text-yellow-800 space-y-1">
          <p>• Los logs se registran automáticamente para todas las acciones del sistema.</p>
          <p>• Se incluye información de usuario, IP y timestamp para auditoría.</p>
          <p>• Los logs se mantienen por tiempo indefinido para trazabilidad completa.</p>
          <p>• Usa los filtros para encontrar eventos específicos rápidamente.</p>
        </div>
      </div>
    </div>
  );
};

export default LogsSection;