import React, { useState, useEffect } from 'react';
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
  nombre: string;
  rtn: string;
}

const UploadSection: React.FC = () => {
  // Datos iniciales de la tabla contable
  const datosIniciales: CuentaContable[] = [
    { cuenta: "Caja y Bancos", debe: "", haber: "", formulaDebe: true, formulaHaber: true }, // =SUMA(B8:B48) y =SUMA(C8:C48)
    { cuenta: "Ventas Gravadas 15%", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "I.S.V. 15%", debe: "", haber: "", formulaDebe: false, formulaHaber: true }, // =C8*15%
    { cuenta: "Ventas Gravadas 18%", debe: "", haber: "", formulaDebe: false, formulaHaber: false },
    { cuenta: "I.S.V. 18%", debe: "", haber: "", formulaDebe: false, formulaHaber: true }, // =C10*18%
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
  const [showModal, setShowModal] = useState(true); // Iniciar con modal abierto
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [nuevoCliente, setNuevoCliente] = useState({ nombre: '', rtn: '' });
  const [periodo, setPeriodo] = useState({ 
    fechaInicio: '', 
    fechaFin: '' 
  });

  // Lista de clientes existentes (esto vendría del backend)
  const clientesExistentes: Cliente[] = [
    { id: 1, nombre: "INVERSIONES DIVERSAS", rtn: "10061984254183" },
    { id: 2, nombre: "COMERCIAL HONDUREÑA S.A.", rtn: "08019840001234" },
    { id: 3, nombre: "SERVICIOS INTEGRALES", rtn: "05011975005678" },
  ];

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
        case 0: // Caja y Bancos DEBE
          return datos.slice(6, 42).reduce((sum, item) => sum + getNumericValue(item.debe), 0);
        case 7: // I.S.V. 15% Compras
          return getNumericValue(datos[6].debe) * 0.15;
        case 9: // I.S.V. 18% Compras
          return getNumericValue(datos[8].debe) * 0.18;
        default:
          return getNumericValue(fila.debe);
      }
    }
    
    if (field === 'haber' && fila.formulaHaber) {
      switch (index) {
        case 0: // Caja y Bancos HABER
          return datos.slice(6, 42).reduce((sum, item) => sum + getNumericValue(item.haber), 0);
        case 2: // I.S.V. 15% Venta
          return getNumericValue(datos[1].haber) * 0.15;
        case 4: // I.S.V. 18% Ventas
          return getNumericValue(datos[3].haber) * 0.18;
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
    setShowModal(true);
  };

  // Seleccionar cliente existente
  const handleSeleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
  };

  // Crear nuevo cliente
  const handleCrearCliente = () => {
    if (!nuevoCliente.nombre || !nuevoCliente.rtn) {
      toast.error('Complete todos los campos del cliente');
      return;
    }
    
    const cliente: Cliente = {
      id: Date.now(), // ID temporal
      nombre: nuevoCliente.nombre.toUpperCase(),
      rtn: nuevoCliente.rtn
    };
    
    setClienteSeleccionado(cliente);
    setNuevoCliente({ nombre: '', rtn: '' });
  };

  // Iniciar consolidación
  const handleIniciarConsolidacion = () => {
    console.log('Iniciando consolidación...', { clienteSeleccionado, periodo });
    
    if (!clienteSeleccionado) {
      toast.error('Seleccione o cree un cliente');
      return;
    }
    
    if (!periodo.fechaInicio || !periodo.fechaFin) {
      toast.error('Seleccione el período');
      return;
    }

    try {
      // Resetear con datos en blanco
      setDatos([...datosIniciales]); 
      setShowModal(false);
      toast.success(`Nueva consolidación iniciada para ${clienteSeleccionado.nombre}`);
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
    setNuevoCliente({ nombre: '', rtn: '' });
    setPeriodo({ fechaInicio: '', fechaFin: '' });
  };

  const isBalanced = Math.abs(totales.debe - totales.haber) < 0.01;

  return (
    <div className="space-y-6">
      {/* Encabezado - Solo mostrar cuando hay cliente seleccionado */}
      {clienteSeleccionado && (
        <div className="card text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-gray-900">
              CLIENTE: {clienteSeleccionado.nombre}
            </h2>
            <p className="text-lg font-semibold text-gray-700">
              RTN: {clienteSeleccionado.rtn}
            </p>
            <p className="text-md text-gray-600">
              Período: {periodo.fechaInicio && periodo.fechaFin 
                ? `Del ${periodo.fechaInicio} al ${periodo.fechaFin}` 
                : 'Sin período definido'}
            </p>
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
                {datos.map((fila, index) => (
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
                ))}
                
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
            {isBalanced ? '✓ TOTALES DEBE Y HABER BALANCEADOS' : '⚠ TOTALES DEBE Y HABER NO BALANCEADOS'}
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
            onClick={handleNuevaConsolidacion}
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
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
                  {clientesExistentes.map((cliente) => (
                    <div
                      key={cliente.id}
                      onClick={() => handleSeleccionarCliente(cliente)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        clienteSeleccionado?.id === cliente.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <p className="font-medium text-gray-900">{cliente.nombre}</p>
                      <p className="text-sm text-gray-500">RTN: {cliente.rtn}</p>
                    </div>
                  ))}
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
                  <p className="text-green-800">{clienteSeleccionado.nombre}</p>
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
                disabled={!clienteSeleccionado || !periodo.fechaInicio || !periodo.fechaFin}
                className={`px-6 py-2 rounded-lg transition-colors ${
                  !clienteSeleccionado || !periodo.fechaInicio || !periodo.fechaFin
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
};

export default UploadSection;