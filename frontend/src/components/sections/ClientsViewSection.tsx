import React, { useState, useEffect } from 'react';
import { User, Search, Plus, Edit, Eye, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import Loading from '@/components/Loading';
import toast from 'react-hot-toast';

interface Cliente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  empresa?: string;
  fechaRegistro: string;
  activo: boolean;
}

const ClientsViewSection: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<Cliente | null>(null);

  // Datos de ejemplo (más tarde conectar con API)
  const clientesEjemplo: Cliente[] = [
    {
      id: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan.perez@example.com',
      telefono: '555-0123',
      direccion: 'Calle Principal 123, Ciudad',
      empresa: 'Empresa ABC',
      fechaRegistro: '2024-01-15',
      activo: true
    },
    {
      id: 2,
      nombre: 'María',
      apellido: 'González',
      email: 'maria.gonzalez@example.com',
      telefono: '555-0456',
      direccion: 'Avenida Central 456, Ciudad',
      empresa: 'Servicios XYZ',
      fechaRegistro: '2024-02-20',
      activo: true
    },
    {
      id: 3,
      nombre: 'Carlos',
      apellido: 'Rodriguez',
      email: 'carlos.rodriguez@example.com',
      telefono: '555-0789',
      direccion: 'Boulevard Norte 789, Ciudad',
      fechaRegistro: '2024-03-10',
      activo: false
    }
  ];

  // Cargar clientes
  useEffect(() => {
    const loadClientes = async () => {
      try {
        setIsLoading(true);
        // Simular carga de API
        await new Promise(resolve => setTimeout(resolve, 1000));
        setClientes(clientesEjemplo);
      } catch (error) {
        toast.error('Error cargando clientes');
      } finally {
        setIsLoading(false);
      }
    };

    loadClientes();
  }, []);

  // Filtrar clientes
  useEffect(() => {
    const filtered = clientes.filter(cliente => 
      cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.empresa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClientes(filtered);
  }, [clientes, searchTerm]);

  const handleAddClient = () => {
    setEditingClient(null);
    setShowAddModal(true);
  };

  const handleEditClient = (cliente: Cliente) => {
    setEditingClient(cliente);
    setShowAddModal(true);
  };

  const handleDeleteClient = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
      try {
        // Aquí iría la llamada a la API
        setClientes(clientes.filter(c => c.id !== id));
        toast.success('Cliente eliminado correctamente');
      } catch (error) {
        toast.error('Error eliminando cliente');
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      // Aquí iría la llamada a la API
      setClientes(clientes.map(c => 
        c.id === id ? { ...c, activo: !c.activo } : c
      ));
      toast.success('Estado del cliente actualizado');
    } catch (error) {
      toast.error('Error actualizando estado del cliente');
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
                      <span>Cliente</span>
                    </div>
                  </th>
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
                      <div>
                        <div className="font-medium text-gray-900">
                          {cliente.nombre} {cliente.apellido}
                        </div>
                        {cliente.empresa && (
                          <div className="text-sm text-gray-500">{cliente.empresa}</div>
                        )}
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
                      <div className="text-sm text-gray-600">
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
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingClient ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
            </h3>
            
            <form className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    defaultValue={editingClient?.nombre || ''}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    defaultValue={editingClient?.apellido || ''}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  defaultValue={editingClient?.email || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  className="input-field"
                  defaultValue={editingClient?.telefono || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Empresa (Opcional)
                </label>
                <input
                  type="text"
                  className="input-field"
                  defaultValue={editingClient?.empresa || ''}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <textarea
                  className="input-field"
                  rows={2}
                  defaultValue={editingClient?.direccion || ''}
                />
              </div>
            </form>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  // Aquí iría la lógica para guardar
                  toast.success(`Cliente ${editingClient ? 'actualizado' : 'creado'} correctamente`);
                  setShowAddModal(false);
                }}
                className="btn-primary"
              >
                {editingClient ? 'Actualizar' : 'Agregar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientsViewSection;