import React, { useState, useEffect, useCallback } from 'react';
import { Save, Download, RefreshCw, Database, Plus, X, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { formatDateForAPI } from '../../utils/dateUtils';

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

interface UploadSectionProps {
  onSectionChange?: (section: 'home' | 'upload' | 'history' | 'reports' | 'logs' | 'users' | 'clients-view' | 'clients-profile') => void;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onSectionChange }) => {
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
        case 5: // I.S.T. 4% Hoteles - Solo se calcula si el tipo de rubro es HOTELES
          return tipoRubro === 'HOTELES' ? getNumericValue(datos[1].haber) * 0.04 : 0;
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
    // ...removed debug log...
    setLoadingClientes(true);
    try {
      const token = localStorage.getItem('token');
      // ...removed debug log...
      
      const response = await fetch('/api/clientes?activo=true', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // ...removed debug log...

      if (!response.ok) {
        throw new Error('Error al cargar clientes');
      }

      const data = await response.json();
      // ...removed debug log...
      
      // El backend devuelve { success: true, clientes: [...], total: n }
      if (data.success && Array.isArray(data.clientes)) {
        // ...removed debug logs...
        setClientesExistentes(data.clientes);
      } else {
        console.warn('Respuesta inesperada del servidor:', data);
        setClientesExistentes([]);
      }
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      toast.error('Error al cargar la lista de clientes');
      // Mantener algunos clientes de ejemplo si falla la carga
      // ...removed debug log...
      setClientesExistentes([
        
      ]);
    } finally {
      setLoadingClientes(false);
      // ...removed debug log...
    }
  }, []);

  // Cargar clientes al abrir el modal
  useEffect(() => {
    // ...removed debug log...
    if (showModal && clientesExistentes.length === 0) {
      // ...removed debug log...
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

  // Función para formatear fechas sin zona horaria (importada desde utils)
  // const formatearFecha = formatDateForAPI;

  // Guardar cambios
  const handleSave = async () => {
    // Validaciones antes de guardar
    if (!clienteSeleccionado) {
      toast.error('Debe seleccionar un cliente antes de guardar');
      return;
    }

    if (!periodo.fechaInicio || !periodo.fechaFin) {
      toast.error('Debe definir el período (fecha inicio y fin)');
      return;
    }

    if (!tipoRubro) {
      toast.error('Debe seleccionar el tipo de rubro (GENERALES o HOTELES)');
      return;
    }

    setIsLoading(true);
    try {
      // Mapear los datos de la tabla a los campos de la base de datos
      const consolidacionData = {
        cliente_id: clienteSeleccionado.id,
        fecha_inicio: formatDateForAPI(periodo.fechaInicio),
        fecha_fin: formatDateForAPI(periodo.fechaFin),
        observaciones: `Consolidación ${tipoRubro} - ${formatDateForAPI(periodo.fechaInicio)} al ${formatDateForAPI(periodo.fechaFin)}`,
        tipoRubro: tipoRubro,
        
        // Mapear cada fila de datos a los campos de la base de datos
        // DEBE
        caja_bancos_debe: getValueForDisplay(datos[0], 0, 'debe'),
        ventas_gravadas_15_debe: getValueForDisplay(datos[1], 1, 'debe'),
        isv_15_ventas_debe: getValueForDisplay(datos[2], 2, 'debe'),
        ventas_gravadas_18_debe: getValueForDisplay(datos[3], 3, 'debe'),
        isv_18_ventas_debe: getValueForDisplay(datos[4], 4, 'debe'),
        ...(tipoRubro === 'HOTELES' && { ist_4_debe: getValueForDisplay(datos[5], 5, 'debe') }),
        ventas_exentas_debe: getValueForDisplay(datos[6], 6, 'debe'),
        compras_gravadas_15_debe: getValueForDisplay(datos[7], 7, 'debe'),
        isv_15_compras_debe: getValueForDisplay(datos[8], 8, 'debe'),
        compras_gravadas_18_debe: getValueForDisplay(datos[9], 9, 'debe'),
        isv_18_compras_debe: getValueForDisplay(datos[10], 10, 'debe'),
        compras_exentas_debe: getValueForDisplay(datos[11], 11, 'debe'),
        ingresos_honorarios_debe: getValueForDisplay(datos[12], 12, 'debe'),
        sueldos_salarios_debe: getValueForDisplay(datos[13], 13, 'debe'),
        treceavo_mes_debe: getValueForDisplay(datos[14], 14, 'debe'),
        catorceavo_mes_debe: getValueForDisplay(datos[15], 15, 'debe'),
        prestaciones_laborales_debe: getValueForDisplay(datos[16], 16, 'debe'),
        energia_electrica_debe: getValueForDisplay(datos[17], 17, 'debe'),
        suministro_agua_debe: getValueForDisplay(datos[18], 18, 'debe'),
        hondutel_debe: getValueForDisplay(datos[19], 19, 'debe'),
        servicio_internet_debe: getValueForDisplay(datos[20], 20, 'debe'),
        ihss_debe: getValueForDisplay(datos[21], 21, 'debe'),
        aportaciones_infop_debe: getValueForDisplay(datos[22], 22, 'debe'),
        aportaciones_rap_debe: getValueForDisplay(datos[23], 23, 'debe'),
        papeleria_utiles_debe: getValueForDisplay(datos[24], 24, 'debe'),
        alquileres_debe: getValueForDisplay(datos[25], 25, 'debe'),
        combustibles_lubricantes_debe: getValueForDisplay(datos[26], 26, 'debe'),
        seguros_debe: getValueForDisplay(datos[27], 27, 'debe'),
        viaticos_gastos_viaje_debe: getValueForDisplay(datos[28], 28, 'debe'),
        impuestos_municipales_debe: getValueForDisplay(datos[29], 29, 'debe'),
        impuestos_estatales_debe: getValueForDisplay(datos[30], 30, 'debe'),
        honorarios_profesionales_debe: getValueForDisplay(datos[31], 31, 'debe'),
        mantenimiento_vehiculos_debe: getValueForDisplay(datos[32], 32, 'debe'),
        reparacion_mantenimiento_debe: getValueForDisplay(datos[33], 33, 'debe'),
        fletes_encomiendas_debe: getValueForDisplay(datos[34], 34, 'debe'),
        limpieza_aseo_debe: getValueForDisplay(datos[35], 35, 'debe'),
        seguridad_vigilancia_debe: getValueForDisplay(datos[36], 36, 'debe'),
        materiales_suministros_debe: getValueForDisplay(datos[37], 37, 'debe'),
        publicidad_propaganda_debe: getValueForDisplay(datos[38], 38, 'debe'),
        gastos_bancarios_debe: getValueForDisplay(datos[39], 39, 'debe'),
        intereses_financieros_debe: getValueForDisplay(datos[40], 40, 'debe'),
        tasa_seguridad_poblacional_debe: getValueForDisplay(datos[41], 41, 'debe'),
        gastos_varios_debe: getValueForDisplay(datos[42], 42, 'debe'),

        // HABER
        caja_bancos_haber: getValueForDisplay(datos[0], 0, 'haber'),
        ventas_gravadas_15_haber: getValueForDisplay(datos[1], 1, 'haber'),
        isv_15_ventas_haber: getValueForDisplay(datos[2], 2, 'haber'),
        ventas_gravadas_18_haber: getValueForDisplay(datos[3], 3, 'haber'),
        isv_18_ventas_haber: getValueForDisplay(datos[4], 4, 'haber'),
        ...(tipoRubro === 'HOTELES' && { ist_4_haber: getValueForDisplay(datos[5], 5, 'haber') }),
        ventas_exentas_haber: getValueForDisplay(datos[6], 6, 'haber'),
        compras_gravadas_15_haber: getValueForDisplay(datos[7], 7, 'haber'),
        isv_15_compras_haber: getValueForDisplay(datos[8], 8, 'haber'),
        compras_gravadas_18_haber: getValueForDisplay(datos[9], 9, 'haber'),
        isv_18_compras_haber: getValueForDisplay(datos[10], 10, 'haber'),
        compras_exentas_haber: getValueForDisplay(datos[11], 11, 'haber'),
        ingresos_honorarios_haber: getValueForDisplay(datos[12], 12, 'haber'),
        sueldos_salarios_haber: getValueForDisplay(datos[13], 13, 'haber'),
        treceavo_mes_haber: getValueForDisplay(datos[14], 14, 'haber'),
        catorceavo_mes_haber: getValueForDisplay(datos[15], 15, 'haber'),
        prestaciones_laborales_haber: getValueForDisplay(datos[16], 16, 'haber'),
        energia_electrica_haber: getValueForDisplay(datos[17], 17, 'haber'),
        suministro_agua_haber: getValueForDisplay(datos[18], 18, 'haber'),
        hondutel_haber: getValueForDisplay(datos[19], 19, 'haber'),
        servicio_internet_haber: getValueForDisplay(datos[20], 20, 'haber'),
        ihss_haber: getValueForDisplay(datos[21], 21, 'haber'),
        aportaciones_infop_haber: getValueForDisplay(datos[22], 22, 'haber'),
        aportaciones_rap_haber: getValueForDisplay(datos[23], 23, 'haber'),
        papeleria_utiles_haber: getValueForDisplay(datos[24], 24, 'haber'),
        alquileres_haber: getValueForDisplay(datos[25], 25, 'haber'),
        combustibles_lubricantes_haber: getValueForDisplay(datos[26], 26, 'haber'),
        seguros_haber: getValueForDisplay(datos[27], 27, 'haber'),
        viaticos_gastos_viaje_haber: getValueForDisplay(datos[28], 28, 'haber'),
        impuestos_municipales_haber: getValueForDisplay(datos[29], 29, 'haber'),
        impuestos_estatales_haber: getValueForDisplay(datos[30], 30, 'haber'),
        honorarios_profesionales_haber: getValueForDisplay(datos[31], 31, 'haber'),
        mantenimiento_vehiculos_haber: getValueForDisplay(datos[32], 32, 'haber'),
        reparacion_mantenimiento_haber: getValueForDisplay(datos[33], 33, 'haber'),
        fletes_encomiendas_haber: getValueForDisplay(datos[34], 34, 'haber'),
        limpieza_aseo_haber: getValueForDisplay(datos[35], 35, 'haber'),
        seguridad_vigilancia_haber: getValueForDisplay(datos[36], 36, 'haber'),
        materiales_suministros_haber: getValueForDisplay(datos[37], 37, 'haber'),
        publicidad_propaganda_haber: getValueForDisplay(datos[38], 38, 'haber'),
        gastos_bancarios_haber: getValueForDisplay(datos[39], 39, 'haber'),
        intereses_financieros_haber: getValueForDisplay(datos[40], 40, 'haber'),
        tasa_seguridad_poblacional_haber: getValueForDisplay(datos[41], 41, 'haber'),
        gastos_varios_haber: getValueForDisplay(datos[42], 42, 'haber')
      };

      // ...removed debug log...
      
      const response = await api.post('/consolidaciones', consolidacionData);
      
      toast.success(`Consolidación ${tipoRubro} guardada exitosamente!`);
      // ...removed debug log...
      
      // Limpiar y cerrar la hoja de consolidación después de guardar exitosamente
      setDatos(datosIniciales);
      setClienteSeleccionado(null);
      setPeriodo({ fechaInicio: '', fechaFin: '' });
      setTipoRubro('');
      
      // Opcionalmente cambiar a la sección de inicio o historial
      if (onSectionChange) {
        onSectionChange('home'); // Cambiar a la sección de inicio
      }
      
    } catch (error: any) {
      console.error('Error guardando consolidación:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar la consolidación';
      toast.error(errorMessage);
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
    // ...removed debug log...
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



  // Iniciar consolidación
  const handleIniciarConsolidacion = () => {
    // ...removed debug log...
    
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
      // ...removed debug log...
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

      {/* Botones de acción */}
      <div className="card">
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={() => {
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
                  // ...removed debug log...
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