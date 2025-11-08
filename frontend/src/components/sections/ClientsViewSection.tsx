import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Edit, Eye, Trash2, Phone, Mail, MapPin, Upload } from 'lucide-react';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';
import { clientesApi, Cliente, ClienteCreateData, ClienteUpdateData } from '@/services/api';

const ClientsViewSection: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Cargar clientes desde la API
  const loadClientes = async () => {
    try {
      setIsLoading(true);
      const response = await clientesApi.getAll();
      setClientes(response.clientes || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      toast.error('Error cargando clientes');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  // Filtrar clientes
  useEffect(() => {
    const filtered = clientes.filter(cliente => 
      cliente.nombre_empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.rtn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.rubro.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.representante.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  }, [clientes, searchTerm]);

  const handleAddClient = () => {
    setEditingClient(null);
    setLogoFile(null);
    setLogoPreview(null);
    setShowAddModal(true);
  };

  const handleEditClient = (cliente: Cliente) => {
    setEditingClient(cliente);
    setLogoFile(null);
    setLogoPreview(cliente.logo_url || null);
    setShowAddModal(true);
  };

  const handleDeleteClient = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres desactivar este cliente?')) {
      try {
        await clientesApi.delete(id);
        await loadClientes(); // Recargar la lista
        toast.success('Cliente desactivado correctamente');
      } catch (error) {
        console.error('Error eliminando cliente:', error);
        toast.error('Error eliminando cliente');
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await clientesApi.toggleStatus(id);
      await loadClientes(); // Recargar la lista
      toast.success('Estado del cliente actualizado');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      toast.error('Error actualizando estado del cliente');
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB
        toast.error('El archivo no debe superar 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        toast.error('Solo se permiten archivos de imagen');
        return;
      }

      setLogoFile(file);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitClient = async (formData: FormData) => {
    try {
      const isEditing = editingClient !== null;
      
      const clienteData: ClienteCreateData = {
        nombre_empresa: formData.get('nombre_empresa') as string,
        rtn: formData.get('rtn') as string,
        rubro: formData.get('rubro') as string,
        representante: formData.get('representante') as string,
        telefono: formData.get('telefono') as string,
        email: formData.get('email') as string,
        direccion: formData.get('direccion') as string,
      };

      if (logoFile) {
        clienteData.logo = logoFile;
      }

      if (isEditing) {
        await clientesApi.update(editingClient.id, clienteData as ClienteUpdateData);
      } else {
        await clientesApi.create(clienteData);
      }

      await loadClientes(); // Recargar la lista
      setShowAddModal(false);
      setLogoFile(null);
      setLogoPreview(null);
      toast.success(`Cliente ${isEditing ? 'actualizado' : 'creado'} correctamente`);
    } catch (error) {
      console.error('Error guardando cliente:', error);
      toast.error(error instanceof Error ? error.message : 'Error guardando cliente');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loading size="lg" text="Cargando clientes..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con búsqueda y botón agregar */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Gestión de Clientes</span>
            </h3>
            <p className="text-sm text-gray-500">
              {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} registrado{clientes.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar clientes..."
                className="input-field pl-10 w-full sm:w-80"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleAddClient}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Cliente</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista de clientes */}
      {filteredClientes.length === 0 ? (
        <div className="card text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Comienza agregando tu primer cliente'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={handleAddClient}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Agregar Primer Cliente</span>
            </button>
          )}
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Empresa</span>
                    </div>
                  </th>
                  <th className="table-header">RTN / Rubro</th>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Contacto</span>
                    </div>
                  </th>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>Ubicación</span>
                    </div>
                  </th>
                  <th className="table-header">Estado</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredClientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        {cliente.logo_url ? (
                          <img 
                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:3002'}${cliente.logo_url}`}
                            alt={`Logo de ${cliente.nombre_empresa}`}
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                            <User className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-gray-900">
                            {cliente.nombre_empresa}
                          </div>
                          <div className="text-sm text-gray-500">
                            {cliente.representante}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {cliente.rtn}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cliente.rubro}
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-1 text-sm">
                          <Mail className="h-3 w-3 text-gray-400" />
                          <span>{cliente.email}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3 text-gray-400" />
                          <span>{cliente.telefono}</span>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {cliente.direccion}
                      </div>
                    </td>
                    <td className="table-cell">
                      <button
                        onClick={() => handleToggleStatus(cliente.id)}
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          cliente.activo
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                        }`}
                      >
                        {cliente.activo ? 'Activo' : 'Inactivo'}
                      </button>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditClient(cliente)}
                          className="text-indigo-600 hover:text-indigo-900 p-1"
                          title="Editar cliente"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {/* Ver perfil */}}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Ver perfil"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClient(cliente.id)}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Eliminar cliente"
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Modal para agregar/editar cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingClient ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
            </h3>
            
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                if (logoFile) {
                  formData.append('logo', logoFile);
                }
                handleSubmitClient(formData);
              }}
              className="space-y-4"
            >
              {/* Logo del negocio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo del Negocio
                </label>
                <div className="flex items-center space-x-4">
                  {logoPreview && (
                    <img 
                      src={logoPreview}
                      alt="Preview del logo"
                      className="h-16 w-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label 
                      htmlFor="logo-upload"
                      className="btn-secondary cursor-pointer inline-flex items-center space-x-2"
                    >
                      <Upload className="h-4 w-4" />
                      <span>Seleccionar Logo</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Máximo 5MB. Formatos: JPG, PNG, GIF
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la Empresa *
                  </label>
                  <input
                    type="text"
                    name="nombre_empresa"
                    required
                    className="input-field"
                    defaultValue={editingClient?.nombre_empresa || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    R.T.N. *
                  </label>
                  <input
                    type="text"
                    name="rtn"
                    required
                    placeholder="Ej: 08019999999999"
                    className="input-field"
                    defaultValue={editingClient?.rtn || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rubro *
                  </label>
                  <input
                    type="text"
                    name="rubro"
                    required
                    placeholder="Ej: Comercio, Servicios, Industria"
                    className="input-field"
                    defaultValue={editingClient?.rubro || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Representante *
                  </label>
                  <input
                    type="text"
                    name="representante"
                    required
                    className="input-field"
                    defaultValue={editingClient?.representante || ''}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono *
                  </label>
                  <input
                    type="tel"
                    name="telefono"
                    required
                    placeholder="Ej: 2234-5678"
                    className="input-field"
                    defaultValue={editingClient?.telefono || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo Electrónico *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="input-field"
                    defaultValue={editingClient?.email || ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección *
                </label>
                <textarea
                  name="direccion"
                  required
                  className="input-field"
                  rows={3}
                  placeholder="Dirección completa del negocio"
                  defaultValue={editingClient?.direccion || ''}
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {editingClient ? 'Actualizar' : 'Crear Cliente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsViewSection;