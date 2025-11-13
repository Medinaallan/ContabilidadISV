import React from 'react';
import { X, User, Calendar, DollarSign, Building, FileText } from 'lucide-react';
import { ConsolidacionDetalle } from '@/types';

interface ConsolidacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  consolidacion: ConsolidacionDetalle | null;
}

const ConsolidacionModal: React.FC<ConsolidacionModalProps> = ({ 
  isOpen, 
  onClose, 
  consolidacion 
}) => {
  if (!isOpen || !consolidacion) return null;

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-HN', {
      style: 'currency',
      currency: 'HNL',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  // Calcular total DEBE dinámicamente
  const calcularTotalDebe = (consolidacion: any) => {
    const camposDebe = [
      'caja_bancos_debe', 'ventas_gravadas_15_debe', 'isv_15_ventas_debe',
      'ventas_gravadas_18_debe', 'isv_18_ventas_debe', 'ist_4_debe',
      'ventas_exentas_debe', 'compras_gravadas_15_debe', 'isv_15_compras_debe',
      'compras_gravadas_18_debe', 'isv_18_compras_debe', 'compras_exentas_debe',
      'ingresos_honorarios_debe', 'sueldos_salarios_debe', 'treceavo_mes_debe',
      'catorceavo_mes_debe', 'prestaciones_laborales_debe', 'energia_electrica_debe',
      'suministro_agua_debe', 'hondutel_debe', 'servicio_internet_debe',
      'ihss_debe', 'aportaciones_infop_debe', 'aportaciones_rap_debe',
      'papeleria_utiles_debe', 'alquileres_debe', 'combustibles_lubricantes_debe',
      'seguros_debe', 'viaticos_gastos_viaje_debe', 'impuestos_municipales_debe',
      'impuestos_estatales_debe', 'honorarios_profesionales_debe', 'mantenimiento_vehiculos_debe',
      'reparacion_mantenimiento_debe', 'fletes_encomiendas_debe', 'limpieza_aseo_debe',
      'seguridad_vigilancia_debe', 'materiales_suministros_debe', 'publicidad_propaganda_debe',
      'gastos_bancarios_debe', 'intereses_financieros_debe', 'tasa_seguridad_poblacional_debe',
      'gastos_varios_debe'
    ];

    return camposDebe.reduce((total, campo) => {
      const valor = Number(consolidacion[campo]) || 0;
      return total + valor;
    }, 0);
  };

  // Calcular total HABER dinámicamente
  const calcularTotalHaber = (consolidacion: any) => {
    const camposHaber = [
      'caja_bancos_haber', 'ventas_gravadas_15_haber', 'isv_15_ventas_haber',
      'ventas_gravadas_18_haber', 'isv_18_ventas_haber', 'ist_4_haber',
      'ventas_exentas_haber', 'compras_gravadas_15_haber', 'isv_15_compras_haber',
      'compras_gravadas_18_haber', 'isv_18_compras_haber', 'compras_exentas_haber',
      'ingresos_honorarios_haber', 'sueldos_salarios_haber', 'treceavo_mes_haber',
      'catorceavo_mes_haber', 'prestaciones_laborales_haber', 'energia_electrica_haber',
      'suministro_agua_haber', 'hondutel_haber', 'servicio_internet_haber',
      'ihss_haber', 'aportaciones_infop_haber', 'aportaciones_rap_haber',
      'papeleria_utiles_haber', 'alquileres_haber', 'combustibles_lubricantes_haber',
      'seguros_haber', 'viaticos_gastos_viaje_haber', 'impuestos_municipales_haber',
      'impuestos_estatales_haber', 'honorarios_profesionales_haber', 'mantenimiento_vehiculos_haber',
      'reparacion_mantenimiento_haber', 'fletes_encomiendas_haber', 'limpieza_aseo_haber',
      'seguridad_vigilancia_haber', 'materiales_suministros_haber', 'publicidad_propaganda_haber',
      'gastos_bancarios_haber', 'intereses_financieros_haber', 'tasa_seguridad_poblacional_haber',
      'gastos_varios_haber'
    ];

    return camposHaber.reduce((total, campo) => {
      const valor = Number(consolidacion[campo]) || 0;
      return total + valor;
    }, 0);
  };

  // Mapeo de campos de la base de datos a nombres amigables
  const cuentasMap = [
    { key: 'caja_bancos', nombre: 'Caja y Bancos' },
    { key: 'ventas_gravadas_15', nombre: 'Ventas Gravadas 15%' },
    { key: 'isv_15_ventas', nombre: 'I.S.V. 15%' },
    { key: 'ventas_gravadas_18', nombre: 'Ventas Gravadas 18%' },
    { key: 'isv_18_ventas', nombre: 'I.S.V. 18%' },
    ...(consolidacion.tipo === 'HOTELES' ? [{ key: 'ist_4', nombre: 'I.S.T. 4%' }] : []),
    { key: 'ventas_exentas', nombre: 'Ventas Exentas' },
    { key: 'compras_gravadas_15', nombre: 'Compras Gravadas 15%' },
    { key: 'isv_15_compras', nombre: 'I.S.V. 15%' },
    { key: 'compras_gravadas_18', nombre: 'Compras Gravadas 18%' },
    { key: 'isv_18_compras', nombre: 'I.S.V. 18%' },
    { key: 'compras_exentas', nombre: 'Compras Exentas' },
    { key: 'ingresos_honorarios', nombre: 'Ingresos por Honorarios' },
    { key: 'sueldos_salarios', nombre: 'Sueldos y Salarios' },
    { key: 'treceavo_mes', nombre: '13 Avo mes' },
    { key: 'catorceavo_mes', nombre: '14 Avo mes' },
    { key: 'prestaciones_laborales', nombre: 'Prestaciones laborales' },
    { key: 'energia_electrica', nombre: 'Energía Eléctrica' },
    { key: 'suministro_agua', nombre: 'Suministro de Agua' },
    { key: 'hondutel', nombre: 'Hondutel' },
    { key: 'servicio_internet', nombre: 'Servicio de Internet' },
    { key: 'ihss', nombre: 'IHSS Instituto Hondureño de Seguridad Social' },
    { key: 'aportaciones_infop', nombre: 'Aportaciones INFOP' },
    { key: 'aportaciones_rap', nombre: 'Aportaciones RAP' },
    { key: 'papeleria_utiles', nombre: 'Papelería y Útiles' },
    { key: 'alquileres', nombre: 'Alquileres' },
    { key: 'combustibles_lubricantes', nombre: 'Combustibles y Lubricantes' },
    { key: 'seguros', nombre: 'Seguros' },
    { key: 'viaticos_gastos_viaje', nombre: 'Viáticos / Gastos de viaje' },
    { key: 'impuestos_municipales', nombre: 'Impuestos Municipales' },
    { key: 'impuestos_estatales', nombre: 'Impuestos Estatales' },
    { key: 'honorarios_profesionales', nombre: 'Honorarios Profesionales' },
    { key: 'mantenimiento_vehiculos', nombre: 'Mantenimiento de Vehículos' },
    { key: 'reparacion_mantenimiento', nombre: 'Reparación y Mantenimiento varios' },
    { key: 'fletes_encomiendas', nombre: 'Fletes y encomiendas' },
    { key: 'limpieza_aseo', nombre: 'Limpieza y Aseo' },
    { key: 'seguridad_vigilancia', nombre: 'Seguridad y Vigilancia' },
    { key: 'materiales_suministros', nombre: 'Materiales, Suministros y Accesorios' },
    { key: 'publicidad_propaganda', nombre: 'Publicidad y Propaganda' },
    { key: 'gastos_bancarios', nombre: 'Gastos Bancarios' },
    { key: 'intereses_financieros', nombre: 'Intereses Financieros' },
    { key: 'tasa_seguridad_poblacional', nombre: 'Tasa de Seguridad Poblacional' },
    { key: 'gastos_varios', nombre: 'Gastos Varios' }
  ];

  // Procesar las cuentas para mostrar en tabla
  const procesarCuentas = () => {
    return cuentasMap.map(cuenta => {
      const debeKey = `${cuenta.key}_debe`;
      const haberKey = `${cuenta.key}_haber`;
      const debe = consolidacion[debeKey] || 0;
      const haber = consolidacion[haberKey] || 0;

      // Mostrar TODAS las cuentas, incluso las que están en cero
      return {
        nombre: cuenta.nombre,
        debe: debe,
        haber: haber
      };
    });
  };

  const cuentasConDatos = procesarCuentas();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  consolidacion.tipo === 'HOTELES' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {consolidacion.tipo === 'HOTELES' ? (
                    <Building className="h-5 w-5 text-blue-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Detalles de Consolidación {consolidacion.tipo}
                  </h3>
                  <p className="text-sm text-gray-500">
                    ID: {consolidacion.id} - {consolidacion.cliente_nombre || 'Cliente no especificado'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-6 space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Período</span>
                </div>
                <p className="text-sm text-gray-900">
                  {formatDate(consolidacion.fecha_inicio)}
                </p>
                <p className="text-xs text-gray-500">hasta</p>
                <p className="text-sm text-gray-900">
                  {formatDate(consolidacion.fecha_fin)}
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <User className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Usuario</span>
                </div>
                <p className="text-sm text-gray-900">
                  {consolidacion.usuario_nombre || 'No especificado'}
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">Total Debe</span>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(calcularTotalDebe(consolidacion))}
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-gray-700">Total Haber</span>
                </div>
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(calcularTotalHaber(consolidacion))}
                </p>
              </div>
            </div>

            {/* Balance */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Balance</h4>
              <p className={`text-xl font-bold ${
                calcularTotalDebe(consolidacion) - calcularTotalHaber(consolidacion) >= 0 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {formatCurrency(calcularTotalDebe(consolidacion) - calcularTotalHaber(consolidacion))}
              </p>
            </div>

            {/* Tabla de Cuentas Contables */}
            <div className="bg-white">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Detalle de Cuentas Contables</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cuenta
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Debe
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Haber
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cuentasConDatos.map((cuenta: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cuenta.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={cuenta.debe > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {cuenta.debe > 0 ? formatCurrency(cuenta.debe) : formatCurrency(0)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                          <span className={cuenta.haber > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}>
                            {cuenta.haber > 0 ? formatCurrency(cuenta.haber) : formatCurrency(0)}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Fila de totales */}
                    <tr className="bg-gray-50 font-semibold">
                      <td className="px-6 py-4 text-sm text-gray-900">
                        TOTALES
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-green-600">
                        {formatCurrency(calcularTotalDebe(consolidacion))}
                      </td>
                      <td className="px-6 py-4 text-sm text-right text-red-600">
                        {formatCurrency(calcularTotalHaber(consolidacion))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Observaciones */}
            {consolidacion.observaciones && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Observaciones</h4>
                <p className="text-sm text-gray-900">{consolidacion.observaciones}</p>
              </div>
            )}

            {/* Fecha de creación */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500">
                Consolidación creada el {formatDate(consolidacion.fecha_creacion)}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-3">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsolidacionModal;