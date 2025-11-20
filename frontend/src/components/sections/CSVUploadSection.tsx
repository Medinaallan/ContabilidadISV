import React, { useState } from 'react';
import toast from 'react-hot-toast';

const CSVUploadSection: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Selecciona un archivo CSV primero');
      return;
    }
    setIsLoading(true);
    setResult('');
    try {
      const formData = new FormData();
      formData.append('csv', file);
      const response = await fetch('/api/clientes/upload-csv', {
        method: 'POST',
        body: formData,
        headers: {
          // El token se debe agregar si tu backend lo requiere
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Clientes cargados exitosamente');
        setResult(`Clientes cargados: ${data.inserted || 0}`);
      } else {
        toast.error(data.message || 'Error al cargar clientes');
        setResult(data.message || 'Error al cargar clientes');
      }
    } catch (error: any) {
      toast.error('Error al cargar el archivo');
      setResult(error.message || 'Error al cargar el archivo');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card max-w-xl mx-auto p-6 mt-8">
      <h2 className="text-xl font-bold mb-4">Cargar clientes desde archivo CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
        disabled={isLoading}
      />
      <button
        onClick={handleUpload}
        disabled={!file || isLoading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Cargando...' : 'Subir archivo'}
      </button>
      {result && <div className="mt-4 text-green-700">{result}</div>}
      <div className="mt-6 text-sm text-gray-600">
        <p>El archivo debe tener el siguiente formato de columnas:</p>
        <code className="block bg-gray-100 p-2 rounded mt-2">
          nombre_empresa;rtn;rubro;representante;telefono;email;direccion;logo_url;activo;fecha_registro;fecha_actualizacion;usuario_creacion
        </code>
        <p className="mt-2">Puedes descargar un ejemplo: <a href="/cargar_clientes.csv" className="text-blue-600 underline">cargar_clientes.csv</a></p>
      </div>
    </div>
  );
};

export default CSVUploadSection;
