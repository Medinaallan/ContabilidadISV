import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Calendar, FileText, DollarSign, TrendingUp, Eye } from 'lucide-react';
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

interface ServicioContratado {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  estado: 'activo' | 'pausado' | 'finalizado';
  monto: number;
}

interface HistorialTransaccion {
  id: number;
  fecha: string;
  descripcion: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  estado: 'pagado' | 'pendiente' | 'vencido';
}

const ClientsProfileSection: React.FC = () => {
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [servicios, setServicios] = useState<ServicioContratado[]>([]);
  const [historial, setHistorial] = useState<HistorialTransaccion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'servicios' | 'historial'>('info');

  // Datos de ejemplo
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
    }
  ];

  const serviciosEjemplo: ServicioContratado[] = [
    {
      id: 1,
      nombre: 'Consolidación Mensual',
      descripcion: 'Servicio de consolidación contable mensual',
      fechaInicio: '2024-01-15',
      estado: 'activo',
      monto: 500
    },
    {
      id: 2,
      nombre: 'Asesoría Tributaria',
      descripcion: 'Consultoría en temas tributarios',
      fechaInicio: '2024-02-01',
      estado: 'activo',
      monto: 300
    }
  ];

  const historialEjemplo: HistorialTransaccion[] = [
    {
      id: 1,
      fecha: '2024-03-01',
      descripcion: 'Consolidación Febrero 2024',
      monto: 500,
      tipo: 'ingreso',
      estado: 'pagado'
    },
    {
      id: 2,
      fecha: '2024-02-28',
      descripcion: 'Asesoría Tributaria',
      monto: 300,
      tipo: 'ingreso',
      estado: 'pagado'
    },
    {
      id: 3,
      fecha: '2024-03-15',
      descripcion: 'Consolidación Marzo 2024',
      monto: 500,
      tipo: 'ingreso',
      estado: 'pendiente'
    }
  ];

  // Cargar datos del cliente seleccionado
  useEffect(() => {
    if (selectedClientId) {
      setIsLoading(true);
      // Simular carga de API
      setTimeout(() => {
        const clienteEncontrado = clientesEjemplo.find(c => c.id === selectedClientId);
        setCliente(clienteEncontrado || null);
        setServicios(serviciosEjemplo);
        setHistorial(historialEjemplo);
        setIsLoading(false);
      }, 1000);
    }
  }, [selectedClientId]);

  const getTotalIngresos = () => {
    return historial
      .filter(h => h.tipo === 'ingreso' && h.estado === 'pagado')
      .reduce((sum, h) => sum + h.monto, 0);
  };

  const getTotalPendiente = () => {
    return historial
      .filter(h => h.estado === 'pendiente')
      .reduce((sum, h) => sum + h.monto, 0);
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
      case 'pagado':
        return 'bg-green-100 text-green-800';
      case 'pausado':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'finalizado':
      case 'vencido':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Selector de cliente */}
      <div className="card">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Perfil de Cliente</span>
          </h3>
          
          <div className="w-80">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Seleccionar Cliente
            </label>
            <select
              className="input-field"
              value={selectedClientId || ''}
              onChange={(e) => setSelectedClientId(Number(e.target.value) || null)}
            >
              <option value="">-- Selecciona un cliente --</option>
              {clientesEjemplo.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nombre} {cliente.apellido} - {cliente.empresa || 'Sin empresa'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedClientId && isLoading && (
        <div className="flex justify-center items-center py-12">
          <Loading size="lg" text="Cargando perfil del cliente..." />
        </div>
      )}

      {selectedClientId && !isLoading && cliente && (
        <>
          {/* Información general del cliente */}
          <div className="card">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {cliente.nombre} {cliente.apellido}
                  </h2>
                  {cliente.empresa && (
                    <p className="text-lg text-gray-600 flex items-center space-x-1">
                      <Building className="h-4 w-4" />
                      <span>{cliente.empresa}</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                    <Calendar className="h-4 w-4" />
                    <span>Cliente desde: {new Date(cliente.fechaRegistro).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  cliente.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {cliente.activo ? 'Cliente Activo' : 'Cliente Inactivo'}
                </div>
              </div>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Facturado</p>
                  <p className="text-2xl font-bold text-gray-900">${getTotalIngresos().toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pendiente de Pago</p>
                  <p className="text-2xl font-bold text-gray-900">${getTotalPendiente().toLocaleString()}</p>
                </div>
              </div>
            </div>
            
            <div className="card">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Servicios Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {servicios.filter(s => s.estado === 'activo').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs de navegación */}
          <div className="card p-0">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {[
                  { key: 'info', label: 'Información de Contacto', icon: User },
                  { key: 'servicios', label: 'Servicios Contratados', icon: FileText },
                  { key: 'historial', label: 'Historial de Transacciones', icon: TrendingUp }
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as any)}
                    className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm ${
                      activeTab === key
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'info' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{cliente.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Teléfono</p>
                        <p className="font-medium">{cliente.telefono}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Dirección</p>
                        <p className="font-medium">{cliente.direccion}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Fecha de Registro</p>
                        <p className="font-medium">{new Date(cliente.fechaRegistro).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'servicios' && (
                <div className="space-y-4">
                  {servicios.map((servicio) => (
                    <div key={servicio.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{servicio.nombre}</h4>
                          <p className="text-sm text-gray-600">{servicio.descripcion}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            Inicio: {new Date(servicio.fechaInicio).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getEstadoColor(servicio.estado)}`}>
                            {servicio.estado}
                          </div>
                          <p className="text-lg font-bold text-gray-900">${servicio.monto}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'historial' && (
                <div className="space-y-4">
                  {historial.map((transaccion) => (
                    <div key={transaccion.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{transaccion.descripcion}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(transaccion.fecha).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${getEstadoColor(transaccion.estado)}`}>
                            {transaccion.estado}
                          </div>
                          <p className={`text-lg font-bold ${transaccion.tipo === 'ingreso' ? 'text-green-600' : 'text-red-600'}`}>
                            {transaccion.tipo === 'ingreso' ? '+' : '-'}${transaccion.monto}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {selectedClientId && !isLoading && !cliente && (
        <div className="card text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Cliente no encontrado</h3>
          <p className="text-gray-500">
            No se pudo cargar la información del cliente seleccionado
          </p>
        </div>
      )}

      {!selectedClientId && (
        <div className="card text-center py-12">
          <Eye className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Selecciona un Cliente</h3>
          <p className="text-gray-500">
            Elige un cliente del menú desplegable para ver su perfil completo
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientsProfileSection;