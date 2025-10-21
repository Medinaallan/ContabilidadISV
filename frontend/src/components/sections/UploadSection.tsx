import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle } from 'lucide-react';
import { fileService } from '@/services/api';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

const UploadSection: React.FC = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{
    id: number;
    name: string;
    size: number;
    status: 'success' | 'error';
    message?: string;
  }>>([]);

  // Configurar dropzone
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const excelFiles = acceptedFiles.filter(file => 
      file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.type === 'application/vnd.ms-excel' ||
      file.name.endsWith('.xlsx') ||
      file.name.endsWith('.xls')
    );

    if (excelFiles.length === 0) {
      toast.error('Solo se permiten archivos Excel (.xlsx, .xls)');
      return;
    }

    // Procesar archivos uno por uno
    for (const file of excelFiles) {
      await handleFileUpload(file);
    }
  }, []);

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragReject
  } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  // Manejar subida de archivo
  const handleFileUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Simular progreso de subida
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      const response = await fileService.uploadFile(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Agregar a la lista de archivos subidos
      setUploadedFiles(prev => [...prev, {
        id: response.file.id,
        name: response.file.original_name,
        size: response.file.filesize,
        status: 'success'
      }]);

      toast.success(`Archivo "${file.name}" subido exitosamente`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error subiendo archivo';
      
      setUploadedFiles(prev => [...prev, {
        id: Date.now(), // ID temporal para archivos con error
        name: file.name,
        size: file.size,
        status: 'error',
        message: errorMessage
      }]);

      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
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

  return (
    <div className="space-y-6">
      {/* Zona de subida */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Subir Archivo de Consolidación
        </h3>
        
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive && !isDragReject ? 'border-primary-400 bg-primary-50' : ''}
            ${isDragReject ? 'border-red-400 bg-red-50' : ''}
            ${!isDragActive ? 'border-gray-300 hover:border-gray-400' : ''}
          `}
        >
          <input {...getInputProps()} />
          
          <div className="space-y-4">
            <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center
              ${isDragActive && !isDragReject ? 'bg-primary-100' : ''}
              ${isDragReject ? 'bg-red-100' : ''}
              ${!isDragActive ? 'bg-gray-100' : ''}
            `}>
              {isDragReject ? (
                <AlertCircle className="h-8 w-8 text-red-600" />
              ) : (
                <Upload className={`h-8 w-8 ${isDragActive ? 'text-primary-600' : 'text-gray-600'}`} />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                {isDragActive
                  ? isDragReject
                    ? 'Archivo no válido'
                    : 'Suelta los archivos aquí'
                  : 'Arrastra archivos Excel aquí'
                }
              </p>
              <p className="text-sm text-gray-500 mt-1">
                o <span className="text-primary-600 font-medium">haz clic para seleccionar</span>
              </p>
              <p className="text-xs text-gray-400 mt-2">
                Formatos soportados: .xlsx, .xls (máximo 10MB por archivo)
              </p>
            </div>
          </div>
        </div>

        {/* Barra de progreso */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-700">Subiendo archivo...</span>
              <span className="text-sm text-gray-500">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Lista de archivos subidos en esta sesión */}
      {uploadedFiles.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Archivos Procesados en esta Sesión
          </h3>
          
          <div className="space-y-2">
            {uploadedFiles.map((file, index) => (
              <div 
                key={`${file.id}-${index}`}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {file.status === 'success' ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="text-sm text-green-700 font-medium">Subido</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-700 font-medium" title={file.message}>
                        Error
                      </span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="card bg-blue-50 border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Instrucciones de Uso
        </h3>
        
        <div className="space-y-3 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Los archivos Excel deben contener datos de consolidación contable en formato tabular.</p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>El sistema procesará automáticamente los datos y calculará totales por columnas numéricas.</p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Una vez procesados, los archivos aparecerán en el historial y sus datos en los reportes.</p>
          </div>
          
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
            <p>Puedes descargar los archivos originales desde la sección de historial.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadSection;