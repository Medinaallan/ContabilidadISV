import React, { useState, useEffect } from 'react';
import { Download, Eye, User, Calendar, FileText, Search } from 'lucide-react';
import { fileService } from '@/services/api';
import { UploadedFile } from '@/types';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

const HistorySection: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFiles, setFilteredFiles] = useState<UploadedFile[]>([]);

  // Cargar historial de archivos
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setIsLoading(true);
        const response = await fileService.getFileHistory();
        setFiles(response.files);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error cargando historial';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadFiles();
  }, []);

  // Filtrar archivos por búsqueda
  useEffect(() => {
    const filtered = files.filter(file =>
      file.original_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      file.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredFiles(filtered);
  }, [files, searchTerm]);

  // Manejar descarga de archivo
  const handleDownload = async (file: UploadedFile) => {
    try {
      const blob = await fileService.downloadFile(file.id);
      
      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.original_name;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success(`Descargando ${file.original_name}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error descargando archivo';
      toast.error(errorMessage);
    }
  };

  // Formatear tamaño de archivo
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" text="Cargando historial de archivos..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y estadísticas */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Archivos
            </h3>
            <p className="text-sm text-gray-500">
              {files.length} archivo{files.length !== 1 ? 's' : ''} subido{files.length !== 1 ? 's' : ''} en total
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o usuario..."
              className="input-field pl-10 w-full sm:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de archivos */}
      {filteredFiles.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron archivos' : 'No hay archivos subidos'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Los archivos subidos aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Archivo</span>
                    </div>
                  </th>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Usuario</span>
                    </div>
                  </th>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Fecha</span>
                    </div>
                  </th>
                  <th className="table-header">Tamaño</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {file.original_name}
                          </div>
                          {file.filename !== file.original_name && (
                            <div className="text-xs text-gray-500">
                              {file.filename}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm font-medium text-gray-900">
                        {file.username}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {formatDate(file.upload_date)}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {formatFileSize(file.filesize)}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(file)}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
                          title="Descargar archivo"
                        >
                          <Download className="h-4 w-4" />
                          <span>Descargar</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            // Implementar vista de datos consolidados
                            toast.info('Vista de datos próximamente disponible');
                          }}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
                          title="Ver datos procesados"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="card bg-gray-50 border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Información de Archivos
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Los archivos se almacenan de forma segura en el servidor.</p>
          <p>• Puedes descargar los archivos originales en cualquier momento.</p>
          <p>• Los datos procesados están disponibles en la sección de Reportes.</p>
        </div>
      </div>
    </div>
  );
};

export default HistorySection;