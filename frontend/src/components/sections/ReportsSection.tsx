import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../utils/dateUtils';
import { reportsService, clientesApi } from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';

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
  cliente_rtn?: string;
  usuario_nombre?: string;
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
  rtn?: string;
}

const ReportsSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'metrics' | 'ranking' | 'summaries'>('metrics');
  const [metrics, setMetrics] = useState<ConsolidacionMetrics | null>(null);
  const [ranking, setRanking] = useState<ClienteRanking[]>([]);
  const [summaries, setSummaries] = useState<ConsolidacionSumario[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filtros generales (para metrics y ranking)
  const [selectedYear, setSelectedYear] = useState<string>('todos');
  const [selectedCliente, setSelectedCliente] = useState<string>('todos');
  
  // Filtros específicos para resúmenes
  const [summariesFilters, setSummariesFilters] = useState({
    cliente: 'todos',
    año: new Date().getFullYear().toString(),
    periodo: 'anual'
  });
  
  // Años disponibles (últimos 5 años)
  const currentYear = new Date().getFullYear();
  const availableYears = Array.from({ length: 5 }, (_, i) => currentYear - i);

  useEffect(() => {
    loadClientes();
  }, []);

  useEffect(() => {
    if (activeTab === 'metrics') {
      loadMetrics();
    }
    // Ranking y Summaries tienen sus propios efectos
  }, [activeTab, selectedYear, selectedCliente]); // Solo métricas dependen de los filtros

  // Efecto separado para ranking - se carga solo cuando cambia la pestaña
  useEffect(() => {
    if (activeTab === 'ranking') {
      loadRanking();
    }
  }, [activeTab]);

  const loadClientes = async () => {
    try {
      const response = await clientesApi.getAll(true);
      setClientes(response.clientes);
    } catch (error) {
      console.error('Error loading clientes:', error);
      setError('Error cargando clientes');
    }
  };

  const loadMetrics = async () => {
    console.log('=== LOADING METRICS ===');
    setLoading(true);
    setError(null);
    try {
      const params = {
        year: selectedYear !== 'todos' ? selectedYear : undefined,
        clienteId: selectedCliente !== 'todos' ? selectedCliente : undefined
      };
      
      console.log('Loading metrics with params:', params);
      const data = await reportsService.getMetrics(params);
      console.log('Received metrics data:', data);
      setMetrics(data);
    } catch (error) {
      console.error('=== ERROR LOADING METRICS ===');
      console.error('Error loading metrics:', error);
      setError(`Error cargando métricas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadRanking = async () => {
    setLoading(true);
    setError(null);
    try {
      // Ranking no usa filtros - muestra todos los datos
      const data = await reportsService.getRanking({});
      setRanking(data);
    } catch (error) {
      console.error('Error loading ranking:', error);
      setError(`Error cargando ranking: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadSummaries = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        year: summariesFilters.año,
        clienteId: summariesFilters.cliente !== 'todos' ? summariesFilters.cliente : undefined,
        periodo: summariesFilters.periodo
      };
      
      const data = await reportsService.getSummaries(params);
      console.log('=== SUMMARIES DATA RECEIVED ===');
      console.log('Raw data:', data);
      console.log('First item:', data[0]);
      if (data[0]) {
        console.log('cliente_rtn:', data[0].cliente_rtn);
        console.log('usuario_nombre:', data[0].usuario_nombre);
      }
      setSummaries(data);
    } catch (error) {
      console.error('Error loading summaries:', error);
      setError(`Error cargando resúmenes: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySummariesFilters = () => {
    loadSummaries();
  };

  const generatePeriodOptions = (year: string) => {
    const periods = [
      { value: 'anual', label: `Anual ${year}` }
    ];
    
    // Bimestral (6 periods)
    for (let i = 1; i <= 6; i++) {
      const startMonth = (i - 1) * 2 + 1;
      const endMonth = i * 2;
      periods.push({
        value: `bimestral-${i}`,
        label: `Bimestre ${i} (${startMonth.toString().padStart(2, '0')}/${year} - ${endMonth.toString().padStart(2, '0')}/${year})`
      });
    }
    
    // Trimestral (4 periods)
    for (let i = 1; i <= 4; i++) {
      const startMonth = (i - 1) * 3 + 1;
      const endMonth = i * 3;
      periods.push({
        value: `trimestral-${i}`,
        label: `Trimestre ${i} (${startMonth.toString().padStart(2, '0')}/${year} - ${endMonth.toString().padStart(2, '0')}/${year})`
      });
    }
    
    // Semestral (2 periods)
    periods.push(
      { value: 'semestral-1', label: `Primer Semestre ${year} (01/${year} - 06/${year})` },
      { value: 'semestral-2', label: `Segundo Semestre ${year} (07/${year} - 12/${year})` }
    );
    
    return periods;
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

  const exportSummariesToPDF = async () => {
    if (summaries.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      const pdf = new jsPDF('portrait', 'mm', 'letter');
      
      // Cargar logo
      const logoUrl = '/logo-home.png';
      let logoDataUrl = '';
      
      try {
        const response = await fetch(logoUrl);
        const blob = await response.blob();
        logoDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.warn('No se pudo cargar el logo:', error);
      }
      
      // Header con logo centrado
      if (logoDataUrl) {
        const logoHeight = 12;
        const logoWidth = logoHeight * 2.79;
        const pageWidth = 215.9; // Ancho carta portrait
        const logoX = (pageWidth - logoWidth) / 2;
        pdf.addImage(logoDataUrl, 'PNG', logoX, 10, logoWidth, logoHeight);
      }
      
      // Título centrado
      pdf.setFontSize(14);
      const centerX = 215.9 / 2; // Centro de página carta
      pdf.text('RESUMEN DE CONSOLIDACION POR CLIENTE', centerX, 30, { align: 'center' });
      pdf.text('_____________________________________________________________________________', centerX, 33, { align: 'center' });
      
      // Información del filtro (declarar antes del bucle)
      const selectedPeriod = generatePeriodOptions(summariesFilters.año).find(p => p.value === summariesFilters.periodo);
      const clienteName = summariesFilters.cliente !== 'todos' 
        ? clientes.find(c => c.id.toString() === summariesFilters.cliente)?.nombre_empresa || 'Todos'
        : 'Todos';
        
      // Fecha de generación
      const fechaActual = new Date().toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // RTN y Usuario
      const clienteRTN = summaries.length > 0 && summaries[0].cliente_rtn 
        ? summaries[0].cliente_rtn 
        : 'No especificado';
      const usuarioNombre = summaries.length > 0 && summaries[0].usuario_nombre 
        ? summaries[0].usuario_nombre 
        : 'No especificado';
        
      console.log('=== PDF EXPORT DEBUG ===');
      console.log('Summaries length:', summaries.length);
      console.log('First summary:', summaries[0]);
      console.log('Cliente RTN:', clienteRTN);
      console.log('Usuario nombre:', usuarioNombre);

      // Período más grande y más arriba
      pdf.setFontSize(12);
      pdf.text(`PERÍODO: ${selectedPeriod?.label || summariesFilters.periodo}`, centerX, 40, { align: 'center' });
      
      // Cliente a la izquierda y Fecha de generación a la derecha
      pdf.setFontSize(10);
      
      pdf.text(`CLIENTE: ${clienteName}`, 20, 50);
      pdf.text(`FECHA DE GENERACIÓN: ${fechaActual}`, 195.9, 50, { align: 'right' });
        
      pdf.text(`RTN: ${clienteRTN}`, 20, 55);
      pdf.text(`GENERADO POR: ${usuarioNombre}`, 195.9, 55, { align: 'right' });
      
      // Agrupar por cliente
      const clientesData = summaries.reduce((acc, summary) => {
        const key = summary.cliente_id;
        if (!acc[key]) {
          acc[key] = {
            cliente: summary.cliente_nombre,
            summaries: []
          };
        }
        acc[key].summaries.push(summary);
        return acc;
      }, {} as Record<number, { cliente: string; summaries: ConsolidacionSumario[] }>);

      let startY = 65;

      // Iterar por cada cliente
      for (const clienteData of Object.values(clientesData)) {
        // Preparar datos de la tabla para este cliente (sin título duplicado)
        const tableData: string[][] = [];
        
        // Mapeo de cuentas
        const cuentasMap = [
          { key: 'caja_bancos', nombre: 'Caja y Bancos' },
          { key: 'ventas_gravadas_15', nombre: 'Ventas Gravadas 15%' },
          { key: 'isv_15_ventas', nombre: 'I.S.V. 15%' },
          { key: 'ventas_gravadas_18', nombre: 'Ventas Gravadas 18%' },
          { key: 'isv_18_ventas', nombre: 'I.S.V. 18%' },
          { key: 'ist_4', nombre: 'I.S.T. 4%' },
          { key: 'ventas_exentas', nombre: 'Ventas Exentas' },
          { key: 'compras_gravadas_15', nombre: 'Compras Gravadas 15%' },
          { key: 'isv_15_compras', nombre: 'I.S.V. 15% Compras' },
          { key: 'compras_gravadas_18', nombre: 'Compras Gravadas 18%' },
          { key: 'isv_18_compras', nombre: 'I.S.V. 18% Compras' },
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
          { key: 'ihss', nombre: 'IHSS' },
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
          { key: 'reparacion_mantenimiento', nombre: 'Reparación y Mantenimiento' },
          { key: 'fletes_encomiendas', nombre: 'Fletes y encomiendas' },
          { key: 'limpieza_aseo', nombre: 'Limpieza y Aseo' },
          { key: 'seguridad_vigilancia', nombre: 'Seguridad y Vigilancia' },
          { key: 'materiales_suministros', nombre: 'Materiales y Suministros' },
          { key: 'publicidad_propaganda', nombre: 'Publicidad y Propaganda' },
          { key: 'gastos_bancarios', nombre: 'Gastos Bancarios' },
          { key: 'intereses_financieros', nombre: 'Intereses Financieros' },
          { key: 'tasa_seguridad_poblacional', nombre: 'Tasa de Seguridad Poblacional' },
          { key: 'gastos_varios', nombre: 'Gastos Varios' }
        ];

        // Sumar todos los valores para este cliente
        const totales = clienteData.summaries.reduce((acc, summary) => {
          cuentasMap.forEach(cuenta => {
            const debeKey = `${cuenta.key}_debe` as keyof ConsolidacionSumario;
            const haberKey = `${cuenta.key}_haber` as keyof ConsolidacionSumario;
            
            if (!acc[cuenta.key]) {
              acc[cuenta.key] = { debe: 0, haber: 0 };
            }
            
            acc[cuenta.key].debe += Number(summary[debeKey]) || 0;
            acc[cuenta.key].haber += Number(summary[haberKey]) || 0;
          });
          return acc;
        }, {} as Record<string, { debe: number; haber: number }>);

        // Construir filas de la tabla
        cuentasMap.forEach(cuenta => {
          const debe = totales[cuenta.key]?.debe || 0;
          const haber = totales[cuenta.key]?.haber || 0;
          
          // Solo incluir filas que tienen valores
          if (debe !== 0 || haber !== 0) {
            tableData.push([
              cuenta.nombre,
              formatCurrency(debe),
              formatCurrency(haber)
            ]);
          }
        });

        // Agregar fila de totales
        const totalDebe = clienteData.summaries.reduce((acc, summary) => acc + calcularTotalDebe(summary), 0);
        const totalHaber = clienteData.summaries.reduce((acc, summary) => acc + calcularTotalHaber(summary), 0);
        tableData.push(['TOTALES', formatCurrency(totalDebe), formatCurrency(totalHaber)]);

        // Crear tabla
        autoTable(pdf, {
          startY: startY,
          head: [['CUENTA', 'DEBE', 'HABER']],
          body: tableData,
          styles: { fontSize: 10, cellPadding: 1.5 },
          headStyles: { 
            fillColor: [100, 100, 100], 
            textColor: 255,
            halign: 'center',
            fontSize: 11,
            cellPadding: 2
          },
          columnStyles: {
            0: { cellWidth: 110 },
            1: { cellWidth: 40, halign: 'right' },
            2: { cellWidth: 40, halign: 'right' }
          }
        });

        // Actualizar posición Y para el siguiente cliente
        startY = (pdf as any).lastAutoTable.finalY + 20;
        
        // Verificar si hay espacio para más contenido
        // Si estamos cerca del final de la página, mostrar "FIN DE PAGINA" y crear nueva página
        if (startY > 240) {
          // Agregar "FIN DE PAGINA" centrado
          pdf.setFontSize(16);
          pdf.text('FIN DE PAGINA', centerX, startY + 10, { align: 'center' });
          
          // Crear nueva página
          pdf.addPage();
          
          // Repetir encabezado en nueva página
          if (logoDataUrl) {
            const logoHeight = 12;
            const logoWidth = logoHeight * 2.79;
            const logoX = (215.9 - logoWidth) / 2;
            pdf.addImage(logoDataUrl, 'PNG', logoX, 10, logoWidth, logoHeight);
          }
          
          pdf.setFontSize(14);
          pdf.text('RESUMEN DE CONSOLIDACION POR CLIENTE', centerX, 30, { align: 'center' });
          pdf.text('_____________________________________________________________________________', centerX, 33, { align: 'center' });
          
          pdf.setFontSize(12);
          pdf.text(`PERÍODO: ${selectedPeriod?.label || summariesFilters.periodo}`, centerX, 40, { align: 'center' });
          
          pdf.setFontSize(10);
          pdf.text(`CLIENTE: ${clienteName}`, 20, 50);
          pdf.text(`FECHA DE GENERACIÓN: ${fechaActual}`, 195.9, 50, { align: 'right' });
          pdf.text(`RTN: ${clienteRTN}`, 20, 55);
          pdf.text(`GENERADO POR: ${usuarioNombre}`, 195.9, 55, { align: 'right' });
          
          startY = 70;
        }
      }
      
      // Footer
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(8);
      pdf.text('Servicios Contables de Occidente - Departamento de Desarrollo Tecnológico', centerX, pageHeight - 20, { align: 'center' });
      pdf.text('Todos los datos declarados en este reporte, se manejan con estricta confidencialidad.', centerX, pageHeight - 15, { align: 'center' });
      
      // Descargar PDF
      const fileName = `Resumen_por_Cliente_${summariesFilters.año}_${summariesFilters.periodo}_${fechaActual.replace(/\//g, '-')}.pdf`;
      pdf.save(fileName);
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF');
    }
  };

  const exportSummariesToExcel = async () => {
    if (summaries.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    try {
      // Cargar la plantilla Excel con ExcelJS
      const templatePath = '/template_xlsx_resumen.xlsx';
      const response = await fetch(templatePath);
      
      if (!response.ok) {
        throw new Error('No se pudo cargar la plantilla Excel');
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(arrayBuffer);
      const worksheet = workbook.getWorksheet(1);
      
      if (!worksheet) {
        throw new Error('No se pudo acceder a la hoja de trabajo');
      }
      
      // Información del filtro
      const fechaActual = new Date().toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // RTN y Usuario
      const clienteRTN = summaries.length > 0 && summaries[0].cliente_rtn 
        ? summaries[0].cliente_rtn 
        : 'No especificado';
      const usuarioNombre = summaries.length > 0 && summaries[0].usuario_nombre 
        ? summaries[0].usuario_nombre 
        : 'No especificado';

      // Agrupar por cliente (tomar el primer cliente para llenar la plantilla)
      const clientesData = summaries.reduce((acc, summary) => {
        const key = summary.cliente_id;
        if (!acc[key]) {
          acc[key] = {
            cliente: summary.cliente_nombre,
            summaries: []
          };
        }
        acc[key].summaries.push(summary);
        return acc;
      }, {} as Record<number, { cliente: string; summaries: ConsolidacionSumario[] }>);

      // Tomar el primer cliente
      const clienteData = Object.values(clientesData)[0];
      
      // Generar el texto del período
      const selectedPeriod = generatePeriodOptions(summariesFilters.año).find(p => p.value === summariesFilters.periodo);
      const periodoTexto = selectedPeriod?.label || summariesFilters.periodo;
      
      // MAPEAR DATOS A CELDAS ESPECÍFICAS - ExcelJS mantiene todos los estilos
      worksheet.getCell('B3').value = periodoTexto;
      worksheet.getCell('B4').value = clienteData.cliente;
      worksheet.getCell('B5').value = clienteRTN;
      worksheet.getCell('D4').value = fechaActual;
      worksheet.getCell('D5').value = usuarioNombre;

      // Mapeo de cuentas con sus posiciones en la plantilla
      const cuentasMap = [
        { key: 'caja_bancos', nombre: 'Caja y Bancos', row: 8 },
        { key: 'ventas_gravadas_15', nombre: 'Ventas Gravadas 15%', row: 9 },
        { key: 'isv_15_ventas', nombre: 'I.S.V. 15%', row: 10 },
        { key: 'ventas_gravadas_18', nombre: 'Ventas Gravadas 18%', row: 11 },
        { key: 'isv_18_ventas', nombre: 'I.S.V. 18%', row: 12 },
        { key: 'ventas_exentas', nombre: 'Ventas Exentas', row: 13 },
        { key: 'compras_gravadas_15', nombre: 'Compras Gravadas 15%', row: 14 },
        { key: 'isv_15_compras', nombre: 'I.S.V. 15% Compras', row: 15 },
        { key: 'compras_gravadas_18', nombre: 'Compras Gravadas 18%', row: 16 },
        { key: 'isv_18_compras', nombre: 'I.S.V. 18% Compras', row: 17 },
        { key: 'compras_exentas', nombre: 'Compras Exentas', row: 18 },
        { key: 'ingresos_honorarios', nombre: 'Ingresos por Honorarios', row: 19 },
        { key: 'sueldos_salarios', nombre: 'Sueldos y Salarios', row: 20 },
        { key: 'treceavo_mes', nombre: '13 Avo mes', row: 21 },
        { key: 'catorceavo_mes', nombre: '14 Avo mes', row: 22 },
        { key: 'prestaciones_laborales', nombre: 'Prestaciones laborales', row: 23 },
        { key: 'energia_electrica', nombre: 'Energía Eléctrica', row: 24 },
        { key: 'suministro_agua', nombre: 'Suministro de Agua', row: 25 },
        { key: 'hondutel', nombre: 'Hondutel', row: 26 },
        { key: 'servicio_internet', nombre: 'Servicio de Internet', row: 27 },
        { key: 'ihss', nombre: 'IHSS', row: 28 },
        { key: 'aportaciones_infop', nombre: 'Aportaciones INFOP', row: 29 },
        { key: 'aportaciones_rap', nombre: 'Aportaciones RAP', row: 30 },
        { key: 'papeleria_utiles', nombre: 'Papelería y Útiles', row: 31 },
        { key: 'alquileres', nombre: 'Alquileres', row: 32 },
        { key: 'combustibles_lubricantes', nombre: 'Combustibles y Lubricantes', row: 33 },
        { key: 'seguros', nombre: 'Seguros', row: 34 },
        { key: 'viaticos_gastos_viaje', nombre: 'Viáticos / Gastos de viaje', row: 35 },
        { key: 'impuestos_municipales', nombre: 'Impuestos Municipales', row: 36 },
        { key: 'impuestos_estatales', nombre: 'Impuestos Estatales', row: 37 },
        { key: 'honorarios_profesionales', nombre: 'Honorarios Profesionales', row: 38 },
        { key: 'mantenimiento_vehiculos', nombre: 'Mantenimiento de Vehículos', row: 39 },
        { key: 'reparacion_mantenimiento', nombre: 'Reparación y Mantenimiento', row: 40 },
        { key: 'fletes_encomiendas', nombre: 'Fletes y encomiendas', row: 41 },
        { key: 'limpieza_aseo', nombre: 'Limpieza y Aseo', row: 42 },
        { key: 'seguridad_vigilancia', nombre: 'Seguridad y Vigilancia', row: 43 },
        { key: 'materiales_suministros', nombre: 'Materiales y Suministros', row: 44 },
        { key: 'publicidad_propaganda', nombre: 'Publicidad y Propaganda', row: 45 },
        { key: 'gastos_bancarios', nombre: 'Gastos Bancarios', row: 46 },
        { key: 'intereses_financieros', nombre: 'Intereses Financieros', row: 47 },
        { key: 'tasa_seguridad_poblacional', nombre: 'Tasa de Seguridad Poblacional', row: 48 },
        { key: 'gastos_varios', nombre: 'Gastos Varios', row: 49 }
      ];

      // Sumar todos los valores para este cliente
      const totales = clienteData.summaries.reduce((acc, summary) => {
        cuentasMap.forEach(cuenta => {
          const debeKey = `${cuenta.key}_debe` as keyof ConsolidacionSumario;
          const haberKey = `${cuenta.key}_haber` as keyof ConsolidacionSumario;
          
          if (!acc[cuenta.key]) {
            acc[cuenta.key] = { debe: 0, haber: 0 };
          }
          
          acc[cuenta.key].debe += Number(summary[debeKey]) || 0;
          acc[cuenta.key].haber += Number(summary[haberKey]) || 0;
        });
        return acc;
      }, {} as Record<string, { debe: number; haber: number }>);

      // LLENAR DATOS EN LA TABLA - ExcelJS mantiene formatos automáticamente
      cuentasMap.forEach(cuenta => {
        const debe = totales[cuenta.key]?.debe || 0;
        const haber = totales[cuenta.key]?.haber || 0;
        
        // Columna C = DEBE, Columna D = HABER
        worksheet.getCell(`C${cuenta.row}`).value = debe === 0 ? 2 : debe;
        worksheet.getCell(`D${cuenta.row}`).value = haber === 0 ? 2 : haber;
      });

      // CALCULAR Y LLENAR TOTALES
      const totalDebe = clienteData.summaries.reduce((acc, summary) => acc + calcularTotalDebe(summary), 0);
      const totalHaber = clienteData.summaries.reduce((acc, summary) => acc + calcularTotalHaber(summary), 0);
      
      worksheet.getCell('C50').value = totalDebe;
      worksheet.getCell('D50').value = totalHaber;

      // GENERAR Y DESCARGAR ARCHIVO - ExcelJS mantiene todos los estilos de la plantilla
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `Resumen_Consolidacion_${summariesFilters.año}_${summariesFilters.periodo}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar el archivo Excel: ' + (error as Error).message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6"> Reportes y Métricas</h2>
        
        {/* Filtros - Solo para Métricas Generales */}
        {activeTab === 'metrics' && (
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
        )}

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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
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
                {/* Filtros específicos para resúmenes */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Filtros de Consulta</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                      <select
                        value={summariesFilters.cliente}
                        onChange={(e) => setSummariesFilters(prev => ({ ...prev, cliente: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="todos">Todos los clientes</option>
                        {clientes.map(cliente => (
                          <option key={cliente.id} value={cliente.id.toString()}>{cliente.nombre_empresa}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Año</label>
                      <select
                        value={summariesFilters.año}
                        onChange={(e) => setSummariesFilters(prev => ({ ...prev, año: e.target.value, periodo: 'anual' }))}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {availableYears.map(year => (
                          <option key={year} value={year.toString()}>{year}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Período</label>
                      <select
                        value={summariesFilters.periodo}
                        onChange={(e) => setSummariesFilters(prev => ({ ...prev, periodo: e.target.value }))}
                        className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {generatePeriodOptions(summariesFilters.año).map(period => (
                          <option key={period.value} value={period.value}>{period.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={exportSummariesToExcel}
                      disabled={loading || summaries.length === 0}
                      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Exportar Excel
                    </button>
                    <button
                      onClick={exportSummariesToPDF}
                      disabled={loading || summaries.length === 0}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Exportar PDF
                    </button>
                    <button
                      onClick={handleApplySummariesFilters}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                      {loading ? 'Aplicando...' : 'Aplicar Filtros'}
                    </button>
                  </div>
                </div>
                
                {/* Resultados */}
                {summaries.length > 0 ? (
                  summaries.map((sumario) => (
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
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">Selecciona los filtros y presiona "Aplicar Filtros" para ver los resúmenes</p>
                    <p className="text-sm text-gray-400">Los datos se cargarán según el cliente, año y período seleccionado</p>
                  </div>
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