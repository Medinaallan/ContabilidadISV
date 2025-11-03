import React, { useState, useEffect, useCallback } from 'react';
import { Save, Download, RefreshCw, Database, Plus, X, User } from 'lucide-react';
import toast from 'react-hot-toast';

interface CuentaContable {
  cuenta: string;
  debe: number | string;
  haber: number | string;
  formulaDebe?: boolean;
  formulaHaber?: boolean;
}

interface Cliente {
  id: number;
  nombre_empresa: string;
  rtn: string;
  rubro?: string;
  representante?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  logo_url?: string;
  activo?: boolean;
  fecha_registro?: string;
  fecha_actualizacion?: string;
}

const UploadSection: React.FC = () => {
  // Datos iniciales de la tabla contable
  const datosIniciales: CuentaContable[] = [
    { cuenta: "Caja y Bancos", debe: "", haber: "", formulaDebe: true, formulaHaber: true }, // DEBE=suma HABER de todas las cuentas, HABER=suma DEBE de todas las cuentas
    { cuenta: "Ventas Gravadas 15%", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "I.S.V. 15%", debe: "", haber: "", formulaDebe: false, formulaHaber: true }, // =C8*15%
    { cuenta: "Ventas Gravadas 18%", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "I.S.V. 18%", debe: "", haber: "", formulaDebe: false, formulaHaber: true }, // =C10*18%
    { cuenta: "I.S.T. 4%", debe: "", haber: "", formulaDebe: false, formulaHaber: true }, // =C2*4% (4% de Ventas Gravadas 15%)
    { cuenta: "Ventas Exentas", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Compras Gravadas 15%", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "I.S.V. 15%", debe: "", haber: "", formulaDebe: true, formulaHaber: false }, // =B13*15%
    { cuenta: "Compras Gravadas 18%", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "I.S.V. 18%", debe: "", haber: "", formulaDebe: true, formulaHaber: false }, // =B15*18%
    { cuenta: "Compras Exentas", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Ingresos por Honorarios", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Sueldos y Salarios", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "13 Avo mes", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "14 Avo mes", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Prestaciones laborales", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Energía Eléctrica", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Suministro de Agua", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Hondutel", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Servicio de Internet", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "IHSS Instituto Hondureño de Seguridad Social", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Aportaciones INFOP", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Aportaciones RAP", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Papelería y Útiles", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Alquileres", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Combustibles y Lubricantes", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Seguros", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Viáticos / Gastos de viaje", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Impuestos Municipales", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Impuestos Estatales", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Honorarios Profesionales", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Mantenimiento de Vehículos", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Reparación y Mantenimiento varios", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Fletes y encomiendas", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Limpieza y Aseo", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Seguridad y Vigilancia", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Materiales, Suministros y Accesorios", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Publicidad y Propaganda", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Gastos Bancarios", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Intereses Financieros", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Tasa de Seguridad Poblacional", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "Gastos Varios", debe: "", haber: "", formulaDebe: false, formulaHaber: false }
  ];

  const [datos, setDatos] = useState<CuentaContable[]>(datosIniciales);
  const [totales, setTotales] = useState({ debe: 0, haber: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Cambiar a false para que no se abra automáticamente
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', rtn: '' });
  const [periodo, setPeriodo] = useState({ 
    fechaInicio: '', 
    fechaFin: '' 
  });
  const [clientesExistentes, setClientesExistentes] = useState<Cliente[]>([]);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [clienteSeleccionadoId, setClienteSeleccionadoId] = useState<string>('');
  const [tipoRubro, setTipoRubro] = useState<'GENERALES' | 'HOTELES' | ''>('');

  // Función helper para convertir valores a número
  const getNumericValue = (value: number | string): number => {
    if (value === '' || value === null || value === undefined) return 0;
    return typeof value === 'string' ? parseFloat(value) || 0 : value;
  };

  // Calcular valores de fórmulas en tiempo real
  const getValueForDisplay = (fila: CuentaContable, index: number, field: 'debe' | 'haber'): number => {
    // Si es una celda de fórmula, calcular el valor dinámicamente
    if (field === 'debe' && fila.formulaDebe) {
      switch (index) {
        case 0: // Caja y Bancos DEBE = suma TODA la columna HABER (Ventas Gravadas 15%, I.S.V. 15%, Ventas Gravadas 18%, I.S.V. 18%, I.S.T. 4%, Ventas Exentas, etc. hasta Gastos Varios)
          return datos.slice(1, 44).reduce((sum, item, idx) => {
            const realIndex = idx + 1; // Ajustar índice porque slice empieza en 1
            // Excluir I.S.T. 4% si es GENERALES
            if (tipoRubro === 'GENERALES' && realIndex === 5) {
              return sum;
            }
            // Usar getValueForDisplay para incluir valores calculados por fórmulas
            return sum + getValueForDisplay(item, realIndex, 'haber');
          }, 0);
        case 8: // I.S.V. 15% Compras
          return getNumericValue(datos[7].debe) * 0.15;
        case 10: // I.S.V. 18% Compras
          return getNumericValue(datos[9].debe) * 0.18;
        default:
          return getNumericValue(fila.debe);
      }
    }
    
    if (field === 'haber' && fila.formulaHaber) {
      switch (index) {
        case 0: // Caja y Bancos HABER = suma TODA la columna DEBE (Ventas Gravadas 15%, I.S.V. 15%, Ventas Gravadas 18%, I.S.V. 18%, I.S.T. 4%, Ventas Exentas, etc. hasta Gastos Varios)
          return datos.slice(1, 44).reduce((sum, item, idx) => {
            const realIndex = idx + 1; // Ajustar índice porque slice empieza en 1
            // Excluir I.S.T. 4% si es GENERALES
            if (tipoRubro === 'GENERALES' && realIndex === 5) {
              return sum;
            }
            // Usar getValueForDisplay para incluir valores calculados por fórmulas
            return sum + getValueForDisplay(item, realIndex, 'debe');
          }, 0);
        case 2: // I.S.V. 15% Venta
          return getNumericValue(datos[1].haber) * 0.15;
        case 4: // I.S.V. 18% Ventas
          return getNumericValue(datos[3].haber) * 0.18;
        case 5: // I.S.T. 4% Hoteles - Se calcula sobre Ventas Gravadas 15%
          return getNumericValue(datos[1].haber) * 0.04;
        default:
          return getNumericValue(fila.haber);
      }
    }

    return getNumericValue(fila[field]);
  };

  // Calcular totales automáticamente
  useEffect(() => {
    const totalDebe = datos.reduce((sum, item, index) => {
      return sum + getValueForDisplay(item, index, 'debe');
    }, 0);

    const totalHaber = datos.reduce((sum, item, index) => {
      return sum + getValueForDisplay(item, index, 'haber');
    }, 0);

    setTotales({ debe: totalDebe, haber: totalHaber });
  }, [datos]);

  // Formatear números
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  // Cargar clientes desde la base de datos
  const cargarClientes = useCallback(async () => {
    console.log('Iniciando carga de clientes...');
    setLoadingClientes(true);
    try {
      const token = localStorage.getItem('token');
      console.log('Token encontrado:', token ? 'Sí' : 'No');
      
      const response = await fetch('/api/clientes?activo=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Respuesta del servidor:', response.status);

      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }

      const data = await response.json();
      console.log('Respuesta completa:', data);
      
      // El backend devuelve { success: true, clientes: [...], total: n }
      if (data.success && Array.isArray(data.clientes)) {
        console.log('Clientes cargados:', data.clientes.length);
        console.log('Primer cliente:', data.clientes[0]); // Ver estructura del primer cliente
        setClientesExistentes(data.clientes);
      } else {
        console.warn('Respuesta inesperada del servidor:', data);
        setClientesExistentes([]);
      }
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      toast.error('Error al cargar la lista de clientes');
      // Mantener algunos clientes de ejemplo si falla la carga
      console.log('Usando clientes de ejemplo...');
      setClientesExistentes([
        
      ]);
    } finally {
      setLoadingClientes(false);
      console.log('Carga de clientes completada');
    }
  }, []);

  // Cargar clientes al abrir el modal
  useEffect(() => {
    console.log('useEffect - showModal cambió a:', showModal);
    if (showModal && clientesExistentes.length === 0) {
      console.log('Cargando clientes...');
      try {
        cargarClientes();
      } catch (error) {
        console.error('Error en useEffect cargarClientes:', error);
      }
    }
  }, [showModal]); // No agregamos clientesExistentes aquí para evitar bucle

  // Manejar cambios en las celdas
  const handleCellChange = (index: number, field: 'debe' | 'haber', value: string) => {
    const newDatos = [...datos];
    const numValue = value === '' ? '' : parseFloat(value) || 0;
    newDatos[index][field] = numValue;
    setDatos(newDatos);
  };

  // Guardar cambios
  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada al backend
      // await api.post('/api/consolidacion', datos);
      toast.success('Datos guardados exitosamente');
    } catch (error) {
      toast.error('Error al guardar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos
  const handleLoad = async () => {
    setIsLoading(true);
    try {
      // Aquí iría la llamada al backend
      // const response = await api.get('/api/consolidacion');
      // setDatos(response.data);
      toast.success('Datos cargados exitosamente');
    } catch (error) {
      toast.error('Error al cargar los datos');
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar a Excel
  const handleExport = () => {
    // Aquí iría la lógica de exportación
    toast.success('Archivo exportado exitosamente');
  };

  // Restablecer valores
  const handleReset = () => {
    setDatos(datosIniciales);
    toast.success('Valores restablecidos');
  };

  // Nueva consolidación
  const handleNuevaConsolidacion = () => {
    console.log('Abriendo modal de nueva consolidación...');
    setShowModal(true);
  };

  // Seleccionar cliente existente
  const handleSeleccionarCliente = (clienteId: string) => {
    setClienteSeleccionadoId(clienteId);
    const cliente = clientesExistentes.find(c => c.id.toString() === clienteId);
    if (cliente) {
      setClienteSeleccionado(cliente);
    } else {
      setClienteSeleccionado(null);
    }
  };

  // Crear nuevo cliente
  const handleCrearCliente = () => {
    if (!nuevoCliente.nombre || !nuevoCliente.rtn) {
      toast.error('Complete todos los campos del cliente');
      return;
    }
    
    const cliente: Cliente = {
      id: Date.now(), // ID temporal
      nombre_empresa: nuevoCliente.nombre.toUpperCase(),
      rtn: nuevoCliente.rtn
    };
    
    setClienteSeleccionado(cliente);
    setNuevoCliente({ nombre: '', rtn: '' });
  };

  // Iniciar consolidación
  const handleIniciarConsolidacion = () => {
    console.log('Iniciando consolidación...', { clienteSeleccionado, periodo, tipoRubro });
    
    if (!clienteSeleccionado) {
      toast.error('Seleccione o cree un cliente');
      return;
    }
    
    if (!periodo.fechaInicio || !periodo.fechaFin) {
      toast.error('Seleccione el período');
      return;
    }

    if (!tipoRubro) {
      toast.error('Seleccione el tipo de rubro');
      return;
    }

    try {
      // Resetear con datos en blanco
      setDatos([...datosIniciales]); 
      setShowModal(false);
      toast.success(`Nueva consolidación iniciada para ${clienteSeleccionado.nombre_empresa} (${tipoRubro})`);
      console.log('Consolidación iniciada exitosamente');
    } catch (error) {
      console.error('Error al iniciar consolidación:', error);
      toast.error('Error al iniciar la consolidación');
    }
  };

  // Cancelar modal
  const handleCancelarModal = () => {
    setShowModal(false);
    setClienteSeleccionado(null);
    setClienteSeleccionadoId('');
    setNuevoCliente({ nombre: '', rtn: '' });
    setPeriodo({ fechaInicio: '', fechaFin: '' });
    setTipoRubro('');
  };

  const isBalanced = Math.abs(totales.debe - totales.haber) < 0.01;

  try {
    return (
    <div className="space-y-6">
      {/* Encabezado - Solo mostrar cuando hay cliente seleccionado */}
      {clienteSeleccionado && (
        <div className="card text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              CLIENTE: {clienteSeleccionado.nombre_empresa}
            </h2>
            <p className="text-lg font-semibold text-gray-700">
              RTN: {clienteSeleccionado.rtn}
            </p>
            <p className="text-md text-gray-600">
              Período: {periodo.fechaInicio && periodo.fechaFin 
                ? `Del ${periodo.fechaInicio} al ${periodo.fechaFin}` 
                : 'Sin período definido'}
            </p>
            {tipoRubro && (
              <p className="text-md font-semibold text-blue-600">
                Tipo de Rubro: {tipoRubro}
                {tipoRubro === 'HOTELES' && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Incluye I.S.T. 4%
                  </span>
                )}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tabla de consolidación */}
      {clienteSeleccionado ? (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-500 text-white">
                  <th className="border border-red-500 px-4 py-3 text-left font-semibold">
                    NOMBRE DE LA CUENTA
                  </th>
                  <th className="border border-red-500 px-4 py-3 text-right font-semibold w-32">
                    DEBE
                  </th>
                  <th className="border border-red-500 px-4 py-3 text-right font-semibold w-32">
                    HABER
                  </th>
                </tr>
              </thead>
              <tbody>
                {datos.map((fila, index) => {
                  // Ocultar fila I.S.T. 4% para generales (solo para hoteles)
                  if (tipoRubro === 'GENERALES' && index === 5) {
                    return null;
                  }
                  
                  return (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-red-500 px-4 py-2 font-medium text-gray-900">
                      {fila.cuenta}
                    </td>
                    <td className="border border-red-500 px-2 py-1">
                      <input
                        type="number"
                        value={fila.formulaDebe ? getValueForDisplay(fila, index, 'debe') : fila.debe}
                        onChange={(e) => handleCellChange(index, 'debe', e.target.value)}
                        className={`w-full px-2 py-1 text-right border-0 outline-none ${
                          fila.formulaDebe 
                            ? 'bg-yellow-100 text-gray-700 cursor-not-allowed' 
                            : 'focus:bg-blue-50 focus:ring-1 focus:ring-blue-400'
                        }`}
                        readOnly={fila.formulaDebe}
                        step="0.01"
                      />
                    </td>
                    <td className="border border-red-500 px-2 py-1">
                      <input
                        type="number"
                        value={fila.formulaHaber ? getValueForDisplay(fila, index, 'haber') : fila.haber}
                        onChange={(e) => handleCellChange(index, 'haber', e.target.value)}
                        className={`w-full px-2 py-1 text-right border-0 outline-none ${
                          fila.formulaHaber 
                            ? 'bg-yellow-100 text-gray-700 cursor-not-allowed' 
                            : 'focus:bg-blue-50 focus:ring-1 focus:ring-blue-400'
                        }`}
                        readOnly={fila.formulaHaber}
                        step="0.01"
                      />
                    </td>
                  </tr>
                  );
                })}
                
                {/* Fila de totales */}
                <tr className="bg-gray-200 font-semibold">
                  <td className="border border-red-500 px-4 py-3 text-right font-bold">
                    TOTALES
                  </td>
                  <td className="border border-red-500 px-4 py-3 text-right font-bold">
                    {formatNumber(totales.debe)}
                  </td>
                  <td className="border border-red-500 px-4 py-3 text-right font-bold">
                    {formatNumber(totales.haber)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card bg-gray-50 border-gray-200 text-center py-12">
          <div className="text-gray-500">
            <h3 className="text-lg font-medium mb-2">No hay consolidación activa</h3>
            <p className="text-sm">Seleccione un cliente para comenzar a trabajar con la tabla contable</p>
          </div>
        </div>
      )}

      {/* Estado de balance */}
      {clienteSeleccionado && (
        <div className="card text-center">
          <p className={`text-lg font-bold ${
            isBalanced ? 'text-green-600' : 'text-red-600'
          }`}>
            {isBalanced ? 'TOTALES DEBE Y HABER BALANCEADOS' : 'TOTALES DEBE Y HABER NO BALANCEADOS'}
          </p>
          {!isBalanced && (
            <p className="text-sm text-gray-600 mt-1">
              Diferencia: {formatNumber(Math.abs(totales.debe - totales.haber))}
            </p>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div className="card">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
              console.log('Botón Nueva Consolidación clickeado!');
              handleNuevaConsolidacion();
            }}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nueva Consolidación</span>
          </button>

          <button
            onClick={handleSave}
            disabled={isLoading || !clienteSeleccionado}
            className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Guardar cambios</span>
          </button>

          <button
            onClick={handleLoad}
            disabled={isLoading}
            className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            <Database className="h-4 w-4" />
            <span>Cargar datos</span>
          </button>

          <button
            onClick={handleExport}
            disabled={!clienteSeleccionado}
            className="flex items-center space-x-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar a Excel</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Restablecer valores</span>
          </button>
        </div>
      </div>

      {/* Modal para Nueva Consolidación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Nueva Consolidación Contable</h2>
              <button
                onClick={handleCancelarModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Selección de Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  <User className="inline h-5 w-5 mr-2" />
                  Seleccionar Cliente
                </h3>
                
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cliente Existente
                  </label>
                  <select
                    value={clienteSeleccionadoId}
                    onChange={(e) => handleSeleccionarCliente(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={loadingClientes}
                  >
                    <option value="">
                      {loadingClientes ? 'Cargando clientes...' : 'Seleccione un cliente'}
                    </option>
                    {Array.isArray(clientesExistentes) && clientesExistentes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id.toString()}>
                        {cliente.nombre_empresa} - RTN: {cliente.rtn}
                      </option>
                    ))}
                  </select>
                  
                  {loadingClientes && (
                    <div className="text-center text-sm text-gray-500">
                      <RefreshCw className="inline h-4 w-4 animate-spin mr-2" />
                      Cargando clientes desde la base de datos...
                    </div>
                  )}
                </div>
              </div>

              {/* Crear Nuevo Cliente */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">O Crear Nuevo Cliente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre de la Empresa
                    </label>
                    <input
                      type="text"
                      value={nuevoCliente.nombre}
                      onChange={(e) => setNuevoCliente(prev => ({ ...prev, nombre: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: INVERSIONES DIVERSAS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RTN
                    </label>
                    <input
                      type="text"
                      value={nuevoCliente.rtn}
                      onChange={(e) => setNuevoCliente(prev => ({ ...prev, rtn: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: 10061984254183"
                    />
                  </div>
                </div>
                <button
                  onClick={handleCrearCliente}
                  className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Crear Cliente
                </button>
              </div>

              {/* Tipo de Rubro */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Tipo de Rubro <span className="text-red-500">*</span>
                </h3>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seleccione el tipo de negocio
                  </label>
                  <select
                    value={tipoRubro}
                    onChange={(e) => setTipoRubro(e.target.value as 'GENERALES' | 'HOTELES' | '')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccione el tipo de rubro</option>
                    <option value="GENERALES">GENERALES</option>
                    <option value="HOTELES">HOTELES</option>
                  </select>
                  
                  {tipoRubro === 'HOTELES' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Nota:</strong> Para hoteles se incluirá automáticamente el Impuesto Sobre Turismo (I.S.T.) del 4%
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Período */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Período de Consolidación</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Inicio
                    </label>
                    <input
                      type="date"
                      value={periodo.fechaInicio}
                      onChange={(e) => setPeriodo(prev => ({ ...prev, fechaInicio: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha Fin
                    </label>
                    <input
                      type="date"
                      value={periodo.fechaFin}
                      onChange={(e) => setPeriodo(prev => ({ ...prev, fechaFin: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Cliente Seleccionado */}
              {clienteSeleccionado && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Cliente Seleccionado:</h4>
                  <p className="text-green-800">{clienteSeleccionado.nombre_empresa}</p>
                  <p className="text-sm text-green-600">RTN: {clienteSeleccionado.rtn}</p>
                </div>
              )}
            </div>

            {/* Botones del Modal */}
            <div className="flex justify-end space-x-3 mt-6 pt-6 border-t">
              <button
                onClick={handleCancelarModal}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  console.log('Botón clickeado!');
                  handleIniciarConsolidacion();
                }}
                disabled={!clienteSeleccionado || !periodo.fechaInicio || !periodo.fechaFin || !tipoRubro}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  !clienteSeleccionado || !periodo.fechaInicio || !periodo.fechaFin || !tipoRubro
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                Iniciar Consolidación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  } catch (error) {
    console.error('Error en el renderizado del componente:', error);
    return (
      <div className="card bg-red-50 border-red-200 text-center py-12">
        <div className="text-red-600">
          <h3 className="text-lg font-medium mb-2">Error en el componente</h3>
          <p className="text-sm">{error instanceof Error ? error.message : 'Error desconocido'}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Recargar página
          </button>
        </div>
      </div>
    );
  }
};

export default UploadSection;