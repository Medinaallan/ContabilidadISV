import React, { useState, useEffect } from 'react';
import { formatDate, formatCurrency } from '../../utils/dateUtils';

interface ConsolidacionMetrics {
  totalConsolidaciones: number;
  consolidacionesGenerales: number;
  consolidacionesHoteles: number;
}

interface ClienteRanking {
  id: number;
  nombre_empresa: string;
  totalConsolidaciones: number;
  consolidacionesGenerales: number;
  consolidacionesHoteles: number;
}

interface ConsolidacionSumario {
  cliente_id: number;
  cliente_nombre: string;
  tipo: 'general' | 'hotel';
  // Campos DEBE
  caja_bancos_debe: number;
  ventas_gravadas_15_debe: number;
  isv_15_ventas_debe: number;
  ventas_gravadas_18_debe: number;
  isv_18_ventas_debe: number;
  ist_4_debe?: number; // Solo para hoteles
  ventas_exentas_debe: number;
  compras_gravadas_15_debe: number;
  isv_15_compras_debe: number;
  compras_gravadas_18_debe: number;
  isv_18_compras_debe: number;
  compras_exentas_debe: number;
  ingresos_honorarios_debe: number;
  sueldos_salarios_debe: number;
  treceavo_mes_debe: number;
  catorceavo_mes_debe: number;
  prestaciones_laborales_debe: number;
  energia_electrica_debe: number;
  suministro_agua_debe: number;
  hondutel_debe: number;
  servicio_internet_debe: number;
  ihss_debe: number;
  aportaciones_infop_debe: number;
  aportaciones_rap_debe: number;
  papeleria_utiles_debe: number;
  alquileres_debe: number;
  combustibles_lubricantes_debe: number;
  seguros_debe: number;
  viaticos_gastos_viaje_debe: number;
  impuestos_municipales_debe: number;
  impuestos_estatales_debe: number;
  honorarios_profesionales_debe: number;
  mantenimiento_vehiculos_debe: number;
  reparacion_mantenimiento_debe: number;
  fletes_encomiendas_debe: number;
  limpieza_aseo_debe: number;
  seguridad_vigilancia_debe: number;
  materiales_suministros_debe: number;
  publicidad_propaganda_debe: number;
  gastos_bancarios_debe: number;
  intereses_financieros_debe: number;
  tasa_seguridad_poblacional_debe: number;
  gastos_varios_debe: number;
  // Campos HABER
  caja_bancos_haber: number;
  ventas_gravadas_15_haber: number;
  isv_15_ventas_haber: number;
  ventas_gravadas_18_haber: number;
  isv_18_ventas_haber: number;
  ist_4_haber?: number; // Solo para hoteles
  ventas_exentas_haber: number;
  compras_gravadas_15_haber: number;
  isv_15_compras_haber: number;
  compras_gravadas_18_haber: number;
  isv_18_compras_haber: number;
  compras_exentas_haber: number;
  ingresos_honorarios_haber: number;
  sueldos_salarios_haber: number;
  treceavo_mes_haber: number;
  catorceavo_mes_haber: number;
  prestaciones_laborales_haber: number;
  energia_electrica_haber: number;
  suministro_agua_haber: number;
  hondutel_haber: number;
  servicio_internet_haber: number;
  ihss_haber: number;
  aportaciones_infop_haber: number;
  aportaciones_rap_haber: number;
  papeleria_utiles_haber: number;
  alquileres_haber: number;
  combustibles_lubricantes_haber: number;
  seguros_haber: number;
  viaticos_gastos_viaje_haber: number;
  impuestos_municipales_haber: number;
  impuestos_estatales_haber: number;
  honorarios_profesionales_haber: number;
  mantenimiento_vehiculos_haber: number;
  reparacion_mantenimiento_haber: number;
  fletes_encomiendas_haber: number;
  limpieza_aseo_haber: number;
  seguridad_vigilancia_haber: number;
  materiales_suministros_haber: number;
  publicidad_propaganda_haber: number;
  gastos_bancarios_haber: number;
  intereses_financieros_haber: number;
  tasa_seguridad_poblacional_haber: number;
  gastos_varios_haber: number;
  total_debe: number;
  total_haber: number;
  diferencia: number;
}

interface Cliente {
  id: number;
  nombre_empresa: string;
}

const ReportsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'ranking' | 'summaries'>('metrics');
  const [metrics, setMetrics] = useState<ConsolidacionMetrics | null>(null);
  const [ranking, setRanking] = useState<ClienteRanking[]>([]);
  const [summaries, setSummaries] = useState<ConsolidacionSumario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filtros
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [selectedCliente, setSelectedCliente] = useState<string>('todos');
  
  // Años disponibles (últimos 5 años)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (activeTab === 'metrics') {
      loadMetrics();
    } else if (activeTab === 'ranking') {
      loadRanking();
    } else if (activeTab === 'summaries') {
      loadSummaries();
    }
  }, [activeTab, selectedYear, selectedCliente]);

  const loadClientes = async () => {
    try {
      const response = await fetch('/api/clientes');
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error('Error loading clientes:', error);
    }
  };

  const loadMetrics = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'todos') params.append('year', selectedYear);
      if (selectedCliente !== 'todos') params.append('clienteId', selectedCliente);
      
      const response = await fetch(`/api/reports/metrics?${params}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRanking = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'todos') params.append('year', selectedYear);
      
      const response = await fetch(`/api/reports/ranking?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRanking(data);
      }
    } catch (error) {
      console.error('Error loading ranking:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummaries = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear !== 'todos') params.append('year', selectedYear);
      if (selectedCliente !== 'todos') params.append('clienteId', selectedCliente);
      
      const response = await fetch(`/api/reports/summaries?${params}`);
      if (response.ok) {
        const data = await response.json();
        setSummaries(data);
      }
    } catch (error) {
      console.error('Error loading summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const calcularTotalDebe = (sumario: ConsolidacionSumario): number => {
    return (sumario.caja_bancos_debe || 0) + 
           (sumario.ventas_gravadas_15_debe || 0) + 
           (sumario.isv_15_ventas_debe || 0) +
           (sumario.ventas_gravadas_18_debe || 0) + 
           (sumario.isv_18_ventas_debe || 0) + 
           (sumario.ist_4_debe || 0) +
           (sumario.ventas_exentas_debe || 0) + 
           (sumario.compras_gravadas_15_debe || 0) + 
           (sumario.isv_15_compras_debe || 0) +
           (sumario.compras_gravadas_18_debe || 0) + 
           (sumario.isv_18_compras_debe || 0) + 
           (sumario.compras_exentas_debe || 0) +
           (sumario.ingresos_honorarios_debe || 0) + 
           (sumario.sueldos_salarios_debe || 0) + 
           (sumario.treceavo_mes_debe || 0) +
           (sumario.catorceavo_mes_debe || 0) + 
           (sumario.prestaciones_laborales_debe || 0) + 
           (sumario.energia_electrica_debe || 0) +
           (sumario.suministro_agua_debe || 0) + 
           (sumario.hondutel_debe || 0) + 
           (sumario.servicio_internet_debe || 0) +
           (sumario.ihss_debe || 0) + 
           (sumario.aportaciones_infop_debe || 0) + 
           (sumario.aportaciones_rap_debe || 0) +
           (sumario.papeleria_utiles_debe || 0) + 
           (sumario.alquileres_debe || 0) + 
           (sumario.combustibles_lubricantes_debe || 0) +
           (sumario.seguros_debe || 0) + 
           (sumario.viaticos_gastos_viaje_debe || 0) + 
           (sumario.impuestos_municipales_debe || 0) +
           (sumario.impuestos_estatales_debe || 0) + 
           (sumario.honorarios_profesionales_debe || 0) + 
           (sumario.mantenimiento_vehiculos_debe || 0) +
           (sumario.reparacion_mantenimiento_debe || 0) + 
           (sumario.fletes_encomiendas_debe || 0) + 
           (sumario.limpieza_aseo_debe || 0) +
           (sumario.seguridad_vigilancia_debe || 0) + 
           (sumario.materiales_suministros_debe || 0) + 
           (sumario.publicidad_propaganda_debe || 0) +
           (sumario.gastos_bancarios_debe || 0) + 
           (sumario.intereses_financieros_debe || 0) + 
           (sumario.tasa_seguridad_poblacional_debe || 0) +
           (sumario.gastos_varios_debe || 0);
  };

  const calcularTotalHaber = (sumario: ConsolidacionSumario): number => {
    return (sumario.caja_bancos_haber || 0) + 
           (sumario.ventas_gravadas_15_haber || 0) + 
           (sumario.isv_15_ventas_haber || 0) +
           (sumario.ventas_gravadas_18_haber || 0) + 
           (sumario.isv_18_ventas_haber || 0) + 
           (sumario.ist_4_haber || 0) +
           (sumario.ventas_exentas_haber || 0) + 
           (sumario.compras_gravadas_15_haber || 0) + 
           (sumario.isv_15_compras_haber || 0) +
           (sumario.compras_gravadas_18_haber || 0) + 
           (sumario.isv_18_compras_haber || 0) + 
           (sumario.compras_exentas_haber || 0) +
           (sumario.ingresos_honorarios_haber || 0) + 
           (sumario.sueldos_salarios_haber || 0) + 
           (sumario.treceavo_mes_haber || 0) +
           (sumario.catorceavo_mes_haber || 0) + 
           (sumario.prestaciones_laborales_haber || 0) + 
           (sumario.energia_electrica_haber || 0) +
           (sumario.suministro_agua_haber || 0) + 
           (sumario.hondutel_haber || 0) + 
           (sumario.servicio_internet_haber || 0) +
           (sumario.ihss_haber || 0) + 
           (sumario.aportaciones_infop_haber || 0) + 
           (sumario.aportaciones_rap_haber || 0) +
           (sumario.papeleria_utiles_haber || 0) + 
           (sumario.alquileres_haber || 0) + 
           (sumario.combustibles_lubricantes_haber || 0) +
           (sumario.seguros_haber || 0) + 
           (sumario.viaticos_gastos_viaje_haber || 0) + 
           (sumario.impuestos_municipales_haber || 0) +
           (sumario.impuestos_estatales_haber || 0) + 
           (sumario.honorarios_profesionales_haber || 0) + 
           (sumario.mantenimiento_vehiculos_haber || 0) +
           (sumario.reparacion_mantenimiento_haber || 0) + 
           (sumario.fletes_encomiendas_haber || 0) + 
           (sumario.limpieza_aseo_haber || 0) +
           (sumario.seguridad_vigilancia_haber || 0) + 
           (sumario.materiales_suministros_haber || 0) + 
           (sumario.publicidad_propaganda_haber || 0) +
           (sumario.gastos_bancarios_haber || 0) + 
           (sumario.intereses_financieros_haber || 0) + 
           (sumario.tasa_seguridad_poblacional_haber || 0) +
           (sumario.gastos_varios_haber || 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6"> Reportes y Métricas</h2>
        
        {/* Filtros */}
        <div className="flex gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Año</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="todos">Todos los años</option>
              {availableYears.map(year => (
                <option key={year} value={year.toString()}>{year}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
            <select
              value={selectedCliente}
              onChange={(e) => setSelectedCliente(e.target.value)}
              className="border rounded-md px-3 py-2"
            >
              <option value="todos">Todos los clientes</option>
              {clientes.map(cliente => (
                <option key={cliente.id} value={cliente.id.toString()}>{cliente.nombre_empresa}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Pestañas */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'metrics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
               Métricas Generales
            </button>
            <button
              onClick={() => setActiveTab('ranking')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ranking'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
               Ranking de Clientes
            </button>
            <button
              onClick={() => setActiveTab('summaries')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summaries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
               Resúmenes por Cliente
            </button>
          </nav>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-gray-600">Cargando datos...</span>
          </div>
        )}

        {/* Contenido de las pestañas */}
        {!loading && (
          <>
            {/* Métricas Generales */}
            {activeTab === 'metrics' && metrics && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Consolidaciones</h3>
                  <p className="text-3xl font-bold text-blue-600">{metrics.totalConsolidaciones}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">Consolidaciones Generales</h3>
                  <p className="text-3xl font-bold text-green-600">{metrics.consolidacionesGenerales}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-800 mb-2">Consolidaciones Hoteles</h3>
                  <p className="text-3xl font-bold text-purple-600">{metrics.consolidacionesHoteles}</p>
                </div>
              </div>
            )}

            {/* Ranking de Clientes */}
            {activeTab === 'ranking' && (
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Posición</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Cliente</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Total</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Generales</th>
                      <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Hoteles</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {ranking.map((cliente, index) => (
                      <tr key={cliente.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2">
                          <span className="font-bold text-lg">
                            {index + 1 === 1 && '🥇'}
                            {index + 1 === 2 && '🥈'}
                            {index + 1 === 3 && '🥉'}
                            {index + 1 > 3 && `#${index + 1}`}
                          </span>
                        </td>
                        <td className="px-4 py-2 font-medium">{cliente.nombre_empresa}</td>
                        <td className="px-4 py-2 font-bold text-blue-600">{cliente.totalConsolidaciones}</td>
                        <td className="px-4 py-2 text-green-600">{cliente.consolidacionesGenerales}</td>
                        <td className="px-4 py-2 text-purple-600">{cliente.consolidacionesHoteles}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {ranking.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No hay datos para mostrar</p>
                )}
              </div>
            )}

            {/* Resúmenes por Cliente */}
            {activeTab === 'summaries' && (
              <div className="space-y-6">
                {summaries.map((sumario) => (
                  <div key={`${sumario.cliente_id}-${sumario.tipo}`} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {sumario.cliente_nombre} - {sumario.tipo === 'general' ? 'Consolidaciones Generales' : 'Consolidaciones Hoteles'}
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-3 py-2 text-left font-medium text-gray-700">Cuenta</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-700">DEBE</th>
                            <th className="px-3 py-2 text-right font-medium text-gray-700">HABER</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          <tr><td className="px-3 py-1 font-medium">Caja y Bancos</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.caja_bancos_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.caja_bancos_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Ventas Gravadas 15%</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ventas_gravadas_15_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ventas_gravadas_15_haber)}</td></tr>
                          <tr><td className="px-3 py-1">ISV 15% Ventas</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.isv_15_ventas_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.isv_15_ventas_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Ventas Gravadas 18%</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ventas_gravadas_18_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ventas_gravadas_18_haber)}</td></tr>
                          <tr><td className="px-3 py-1">ISV 18% Ventas</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.isv_18_ventas_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.isv_18_ventas_haber)}</td></tr>
                          {sumario.tipo === 'hotel' && (
                            <tr><td className="px-3 py-1">IST 4%</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ist_4_debe || 0)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ist_4_haber || 0)}</td></tr>
                          )}
                          <tr><td className="px-3 py-1">Ventas Exentas</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ventas_exentas_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ventas_exentas_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Compras Gravadas 15%</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.compras_gravadas_15_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.compras_gravadas_15_haber)}</td></tr>
                          <tr><td className="px-3 py-1">ISV 15% Compras</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.isv_15_compras_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.isv_15_compras_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Compras Gravadas 18%</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.compras_gravadas_18_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.compras_gravadas_18_haber)}</td></tr>
                          <tr><td className="px-3 py-1">ISV 18% Compras</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.isv_18_compras_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.isv_18_compras_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Compras Exentas</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.compras_exentas_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.compras_exentas_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Ingresos por Honorarios</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ingresos_honorarios_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ingresos_honorarios_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Sueldos y Salarios</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.sueldos_salarios_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.sueldos_salarios_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Treceavo Mes</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.treceavo_mes_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.treceavo_mes_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Catorceavo Mes</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.catorceavo_mes_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.catorceavo_mes_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Prestaciones Laborales</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.prestaciones_laborales_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.prestaciones_laborales_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Energía Eléctrica</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.energia_electrica_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.energia_electrica_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Suministro de Agua</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.suministro_agua_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.suministro_agua_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Hondutel</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.hondutel_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.hondutel_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Servicio de Internet</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.servicio_internet_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.servicio_internet_haber)}</td></tr>
                          <tr><td className="px-3 py-1">IHSS</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ihss_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.ihss_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Aportaciones INFOP</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.aportaciones_infop_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.aportaciones_infop_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Aportaciones RAP</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.aportaciones_rap_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.aportaciones_rap_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Papelería y Útiles</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.papeleria_utiles_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.papeleria_utiles_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Alquileres</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.alquileres_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.alquileres_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Combustibles y Lubricantes</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.combustibles_lubricantes_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.combustibles_lubricantes_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Seguros</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.seguros_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.seguros_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Viáticos y Gastos de Viaje</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.viaticos_gastos_viaje_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.viaticos_gastos_viaje_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Impuestos Municipales</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.impuestos_municipales_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.impuestos_municipales_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Impuestos Estatales</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.impuestos_estatales_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.impuestos_estatales_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Honorarios Profesionales</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.honorarios_profesionales_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.honorarios_profesionales_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Mantenimiento de Vehículos</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.mantenimiento_vehiculos_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.mantenimiento_vehiculos_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Reparación y Mantenimiento</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.reparacion_mantenimiento_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.reparacion_mantenimiento_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Fletes y Encomiendas</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.fletes_encomiendas_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.fletes_encomiendas_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Limpieza y Aseo</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.limpieza_aseo_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.limpieza_aseo_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Seguridad y Vigilancia</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.seguridad_vigilancia_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.seguridad_vigilancia_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Materiales y Suministros</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.materiales_suministros_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.materiales_suministros_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Publicidad y Propaganda</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.publicidad_propaganda_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.publicidad_propaganda_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Gastos Bancarios</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.gastos_bancarios_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.gastos_bancarios_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Intereses Financieros</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.intereses_financieros_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.intereses_financieros_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Tasa de Seguridad Poblacional</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.tasa_seguridad_poblacional_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.tasa_seguridad_poblacional_haber)}</td></tr>
                          <tr><td className="px-3 py-1">Gastos Varios</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.gastos_varios_debe)}</td><td className="px-3 py-1 text-right">{formatCurrency(sumario.gastos_varios_haber)}</td></tr>
                        </tbody>
                        <tfoot className="bg-gray-100 font-bold">
                          <tr>
                            <td className="px-3 py-2">TOTALES</td>
                            <td className="px-3 py-2 text-right text-blue-600">{formatCurrency(calcularTotalDebe(sumario))}</td>
                            <td className="px-3 py-2 text-right text-green-600">{formatCurrency(calcularTotalHaber(sumario))}</td>
                          </tr>
                          <tr>
                            <td className="px-3 py-2">DIFERENCIA</td>
                            <td className="px-3 py-2 text-right font-bold" colSpan={2}>
                              {formatCurrency(calcularTotalDebe(sumario) - calcularTotalHaber(sumario))}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                ))}
                {summaries.length === 0 && (
                  <p className="text-center text-gray-500 py-8">No hay datos para mostrar</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsSection;