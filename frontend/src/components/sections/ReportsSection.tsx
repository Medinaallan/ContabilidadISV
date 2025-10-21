import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calculator, FileSpreadsheet } from 'lucide-react';
import { reportsService } from '@/services/api';
import { ReportData } from '@/types';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

const ReportsSection: React.FC = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState<{
    totalReports: number;
    totalDataRows: number;
  }>({ totalReports: 0, totalDataRows: 0 });

  // Cargar reportes
  useEffect(() => {
    const loadReports = async () => {
      try {
        setIsLoading(true);
        const response = await reportsService.getAllTotals();
        setReports(response.reports);
        setSummary(response.summary);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error cargando reportes';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  // Formatear números
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" text="Cargando reportes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen general */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileSpreadsheet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Reportes</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalReports}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Filas</p>
              <p className="text-2xl font-semibold text-gray-900">{summary.totalDataRows.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calculator className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Promedio por Reporte</p>
              <p className="text-2xl font-semibold text-gray-900">
                {summary.totalReports > 0 
                  ? Math.round(summary.totalDataRows / summary.totalReports).toLocaleString()
                  : '0'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de reportes */}
      {reports.length === 0 ? (
        <div className="card text-center py-12">
          <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay reportes disponibles
          </h3>
          <p className="text-gray-500">
            Los reportes aparecerán aquí una vez que subas archivos Excel
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Totales por Consolidación
          </h3>
          
          {reports.map((report) => (
            <div key={report.id} className="card">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">{report.filename}</h4>
                  <p className="text-sm text-gray-500">
                    Por {report.username} • {formatDate(report.created_at)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {report.summary.totalRows} filas
                  </div>
                  <div className="text-xs text-gray-500">
                    {report.summary.numericColumns} columnas numéricas
                  </div>
                </div>
              </div>

              {/* Totales principales */}
              {report.summary.mainTotals.length > 0 && (
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-700 mb-2">
                    Totales Calculados
                  </h5>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {report.summary.mainTotals.slice(0, 6).map((total, index) => (
                      <div 
                        key={`${report.id}-${index}`}
                        className="bg-gray-50 rounded-lg p-3"
                      >
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                          {total.column}
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Suma:</span>
                            <span className="font-medium text-gray-900">
                              {formatNumber(total.sum)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Promedio:</span>
                            <span className="font-medium text-gray-900">
                              {formatNumber(total.average)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>Registros:</span>
                            <span>{total.count}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {report.summary.mainTotals.length > 6 && (
                    <div className="text-center">
                      <button
                        onClick={() => {
                          toast.info('Vista detallada próximamente disponible');
                        }}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                      >
                        Ver {report.summary.mainTotals.length - 6} columna{report.summary.mainTotals.length - 6 !== 1 ? 's' : ''} más
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Información adicional si no hay totales */}
              {report.summary.mainTotals.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    No se encontraron columnas numéricas en este archivo para calcular totales.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Información adicional */}
      <div className="card bg-blue-50 border-blue-200">
        <h4 className="text-sm font-semibold text-blue-900 mb-2">
          Acerca de los Reportes
        </h4>
        <div className="text-xs text-blue-800 space-y-1">
          <p>• Los totales se calculan automáticamente para todas las columnas numéricas.</p>
          <p>• Se incluyen suma, promedio, cantidad de registros, valores mínimos y máximos.</p>
          <p>• Los datos se actualizan en tiempo real al subir nuevos archivos.</p>
        </div>
      </div>
    </div>
  );
};

export default ReportsSection;