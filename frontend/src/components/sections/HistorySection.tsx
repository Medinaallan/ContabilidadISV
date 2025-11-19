import React, { useState, useEffect } from 'react';
import { Eye, User, Calendar, FileText, Search, Building, Download, Shield } from 'lucide-react';
import { consolidacionService } from '@/services/api';
import { Consolidacion, ConsolidacionDetalle } from '@/types';
import Loading from '@/components/Loading';
import ConsolidacionModal from '@/components/ConsolidacionModal';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { jsPDF } from 'jspdf';
import { formatDate, formatCurrency, formatCreationDate } from '../../utils/dateUtils';
import autoTable from 'jspdf-autotable';
import * as ExcelJS from 'exceljs';

const HistorySection: React.FC = () => {
  const { user } = useAuth();
  const [consolidaciones, setConsolidaciones] = useState<Consolidacion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConsolidaciones, setFilteredConsolidaciones] = useState<Consolidacion[]>([]);
  const [selectedConsolidacion, setSelectedConsolidacion] = useState<ConsolidacionDetalle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar historial de consolidaciones
  useEffect(() => {
    const loadConsolidaciones = async () => {
      try {
        setIsLoading(true);
        const response = await consolidacionService.getHistory();
        // ...removed debug log...
        // Verificar si las consolidaciones tienen los campos total_debe y total_haber
        if (response.data.length > 0) {
          // ...removed debug logs...
        }
        setConsolidaciones(response.data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Error cargando historial de consolidaciones';
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadConsolidaciones();
  }, []);

  // Filtrar consolidaciones por búsqueda
  useEffect(() => {
    const filtered = consolidaciones.filter(consolidacion =>
      (consolidacion.cliente_nombre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (consolidacion.usuario_nombre?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (consolidacion.tipo.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (consolidacion.observaciones?.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredConsolidaciones(filtered);
  }, [consolidaciones, searchTerm]);

  // Manejar vista de detalles de consolidación
  const handleViewDetails = async (consolidacion: Consolidacion) => {
    try {
      const detalles = await consolidacionService.getById(consolidacion.id, consolidacion.tipo);
      setSelectedConsolidacion(detalles);
      setIsModalOpen(true);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error cargando detalles de la consolidación';
      toast.error(errorMessage);
    }
  };

  // Exportar consolidación individual a Excel
  const handleExportToExcel = async (consolidacion: Consolidacion) => {
    try {
      // Obtener los detalles completos de la consolidación
      const detalles = await consolidacionService.getById(consolidacion.id, consolidacion.tipo);
      
      // Cargar la plantilla Excel con ExcelJS
      const templatePath = '/template_xlsx_historial.xlsx';
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
      
      // Información de la consolidación
      const fechaActual = new Date().toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      // Generar el texto del período
      const periodoTexto = `${formatDate(detalles.fecha_inicio)} al ${formatDate(detalles.fecha_fin)}`;
      
      // MAPEAR DATOS A CELDAS ESPECÍFICAS - ExcelJS mantiene todos los estilos
      worksheet.getCell('B3').value = periodoTexto;
      worksheet.getCell('B4').value = detalles.cliente_nombre || 'No especificado';
      worksheet.getCell('B5').value = detalles.cliente_rtn || 'No especificado';
      worksheet.getCell('D4').value = fechaActual;
      worksheet.getCell('D5').value = detalles.usuario_nombre || 'No especificado';

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

      // LLENAR DATOS EN LA TABLA - ExcelJS mantiene formatos automáticamente
      cuentasMap.forEach(cuenta => {
        const debeKey = `${cuenta.key}_debe` as keyof ConsolidacionDetalle;
        const haberKey = `${cuenta.key}_haber` as keyof ConsolidacionDetalle;
        
        const debe = Number(detalles[debeKey]) || 0;
        const haber = Number(detalles[haberKey]) || 0;
        
        // Columna C = DEBE, Columna D = HABER
        worksheet.getCell(`C${cuenta.row}`).value = debe;
        worksheet.getCell(`D${cuenta.row}`).value = haber;
      });

      // CALCULAR Y LLENAR TOTALES
      const totalDebe = calcularTotalDebe(detalles);
      const totalHaber = calcularTotalHaber(detalles);
      
      const totalRow = detalles.tipo === 'HOTELES' ? 50 : 49;
      worksheet.getCell(`C${totalRow}`).value = totalDebe;
      worksheet.getCell(`D${totalRow}`).value = totalHaber;

      // GENERAR Y DESCARGAR ARCHIVO - ExcelJS mantiene todos los estilos de la plantilla
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
      });
      
      const fileName = `Consolidacion_${detalles.tipo}_${detalles.cliente_nombre}_${formatDate(detalles.fecha_inicio)}_${formatDate(detalles.fecha_fin)}.xlsx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.click();
      window.URL.revokeObjectURL(url);
      
      toast.success('Excel exportado exitosamente');
    } catch (error) {
      console.error('Error generando Excel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error al generar el archivo Excel';
      toast.error(errorMessage);
    }
  };



  // Generar PDF directo con jsPDF
  // Calcular total DEBE dinámicamente
  const calcularTotalDebe = (consolidacion: any) => {
    const camposDebe = [
      'caja_bancos_debe',
      'ventas_gravadas_15_debe',
      'isv_15_ventas_debe',
      'ventas_gravadas_18_debe',
      'isv_18_ventas_debe',
      'ist_4_debe',
      'ventas_exentas_debe',
      'compras_gravadas_15_debe',
      'isv_15_compras_debe',
      'compras_gravadas_18_debe',
      'isv_18_compras_debe',
      'compras_exentas_debe',
      'ingresos_honorarios_debe',
      'sueldos_salarios_debe',
      'treceavo_mes_debe',
      'catorceavo_mes_debe',
      'prestaciones_laborales_debe',
      'energia_electrica_debe',
      'suministro_agua_debe',
      'hondutel_debe',
      'servicio_internet_debe',
      'ihss_debe',
      'aportaciones_infop_debe',
      'aportaciones_rap_debe',
      'papeleria_utiles_debe',
      'alquileres_debe',
      'combustibles_lubricantes_debe',
      'seguros_debe',
      'viaticos_gastos_viaje_debe',
      'impuestos_municipales_debe',
      'impuestos_estatales_debe',
      'honorarios_profesionales_debe',
      'mantenimiento_vehiculos_debe',
      'reparacion_mantenimiento_debe',
      'fletes_encomiendas_debe',
      'limpieza_aseo_debe',
      'seguridad_vigilancia_debe',
      'materiales_suministros_debe',
      'publicidad_propaganda_debe',
      'gastos_bancarios_debe',
      'intereses_financieros_debe',
      'tasa_seguridad_poblacional_debe',
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
      'caja_bancos_haber',
      'ventas_gravadas_15_haber',
      'isv_15_ventas_haber',
      'ventas_gravadas_18_haber',
      'isv_18_ventas_haber',
      'ist_4_haber',
      'ventas_exentas_haber',
      'compras_gravadas_15_haber',
      'isv_15_compras_haber',
      'compras_gravadas_18_haber',
      'isv_18_compras_haber',
      'compras_exentas_haber',
      'ingresos_honorarios_haber',
      'sueldos_salarios_haber',
      'treceavo_mes_haber',
      'catorceavo_mes_haber',
      'prestaciones_laborales_haber',
      'energia_electrica_haber',
      'suministro_agua_haber',
      'hondutel_haber',
      'servicio_internet_haber',
      'ihss_haber',
      'aportaciones_infop_haber',
      'aportaciones_rap_haber',
      'papeleria_utiles_haber',
      'alquileres_haber',
      'combustibles_lubricantes_haber',
      'seguros_haber',
      'viaticos_gastos_viaje_haber',
      'impuestos_municipales_haber',
      'impuestos_estatales_haber',
      'honorarios_profesionales_haber',
      'mantenimiento_vehiculos_haber',
      'reparacion_mantenimiento_haber',
      'fletes_encomiendas_haber',
      'limpieza_aseo_haber',
      'seguridad_vigilancia_haber',
      'materiales_suministros_haber',
      'publicidad_propaganda_haber',
      'gastos_bancarios_haber',
      'intereses_financieros_haber',
      'tasa_seguridad_poblacional_haber',
      'gastos_varios_haber'
    ];

    return camposHaber.reduce((total, campo) => {
      const valor = Number(consolidacion[campo]) || 0;
      return total + valor;
    }, 0);
  };

  const handleGenerateDirectPDF = async (consolidacion: Consolidacion) => {
    try {
      const detalles = await consolidacionService.getById(consolidacion.id, consolidacion.tipo);
      
      // Debug: verificar que el RTN está llegando
      // ...removed debug logs...
      
      const pdf = new jsPDF('portrait', 'mm', 'letter');
      
      // Cargar logo
      const logoUrl = '/logo-home.png';
      let logoDataUrl = '';
      
      try {
        // Convertir logo a base64
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
        // Logo con relación de aspecto 2.79:1 (superpanorámica)
        const logoHeight = 15; // mm
        const logoWidth = logoHeight * 2.79; // 41.85 mm
        const pageWidth = 215.9; // Ancho de página carta en mm
        const logoX = (pageWidth - logoWidth) / 2; // Centrado horizontalmente
        pdf.addImage(logoDataUrl, 'PNG', logoX, 10, logoWidth, logoHeight);
      }
      
      // Título centrado debajo del logo
      pdf.setFontSize(12);
      const centerX = 215.9 / 2; // Centro de página carta
      pdf.text('CONSOLIDACIÓN CONTABLE', centerX, 35, { align: 'center' });
      pdf.text('_____________________________________________________________________________', centerX, 38, { align: 'center' });
      
      // Período centrado debajo del título
      pdf.setFontSize(10);
      pdf.text(`PERIODO DEL: ${formatDate(detalles.fecha_inicio)} AL: ${formatDate(detalles.fecha_fin)}`, centerX, 45, { align: 'center' });
      
      // Información en dos columnas
      let yPos = 55;
      
      // Línea 1: Cliente (izquierda) - Usuario (derecha)
      pdf.text(`CLIENTE: ${detalles.cliente_nombre || 'No especificado'}`, 20, yPos);
      pdf.text(`GENERADO POR: ${detalles.usuario_nombre || 'No especificado'}`, 130, yPos);
      yPos += 7;
      
      // Línea 2: RTN (izquierda) - Fecha de generación (derecha)
      const fechaActual = new Date().toLocaleDateString('es-HN', {
        day: '2-digit',
        month: '2-digit', 
        year: 'numeric'
      });
      pdf.text(`RTN: ${detalles.cliente_rtn || 'No especificado'}`, 20, yPos);
      pdf.text(`FECHA DE CREACION: ${fechaActual}`, 130, yPos);
      yPos += 15;
      
      // Mapeo completo de cuentas
      const cuentasMap = [
        { key: 'caja_bancos', nombre: 'Caja y Bancos' },
        { key: 'ventas_gravadas_15', nombre: 'Ventas Gravadas 15%' },
        { key: 'isv_15_ventas', nombre: 'I.S.V. 15%' },
        { key: 'ventas_gravadas_18', nombre: 'Ventas Gravadas 18%' },
        { key: 'isv_18_ventas', nombre: 'I.S.V. 18%' },
        ...(detalles.tipo === 'HOTELES' ? [{ key: 'ist_4', nombre: 'I.S.T. 4%' }] : []),
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
      
      // Preparar datos de la tabla
      const tableData = cuentasMap.map(cuenta => {
        const debeKey = `${cuenta.key}_debe` as keyof ConsolidacionDetalle;
        const haberKey = `${cuenta.key}_haber` as keyof ConsolidacionDetalle;
        const debe = Number(detalles[debeKey]) || 0;
        const haber = Number(detalles[haberKey]) || 0;
        return [cuenta.nombre, formatCurrency(debe), formatCurrency(haber)];
      });
      
      // Agregar fila de totales
      const totalDebe = calcularTotalDebe(detalles);
      const totalHaber = calcularTotalHaber(detalles);
      tableData.push(['TOTALES', formatCurrency(totalDebe), formatCurrency(totalHaber)]);
      
      // Crear tabla
      autoTable(pdf, {
        startY: yPos = 70,
        head: [['CUENTA', 'DEBE', 'HABER']],
        body: tableData,
        styles: { fontSize: 8, cellPadding: 2 },
        headStyles: { 
          fillColor: [100, 100, 100], 
          textColor: 255,
          halign: 'center' // Centrar por defecto
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 50, halign: 'right' },
          2: { cellWidth: 50, halign: 'right' }
        },
        didParseCell: function(data) {
          // Alinear encabezados DEBE y HABER a la derecha
          if (data.section === 'head' && (data.column.index === 1 || data.column.index === 2)) {
            data.cell.styles.halign = 'right';
          }
        }
      });
      
      // Footer
      const pageHeight = pdf.internal.pageSize.height;
      pdf.setFontSize(8);
      pdf.text('Servicios Contables de Occidente - Departamento de Desarrollo Tecnológico', centerX, pageHeight - 25, { align: 'center' });
      pdf.text('Comprometidos con la confidencialidad y la integridad, aseguramos que toda la', centerX, pageHeight - 17, { align: 'center' });
      pdf.text('información suministrada sea veraz, confidencial y tratada con absoluta responsabilidad.', centerX, pageHeight - 13, { align: 'center' });
      
      // Abrir PDF en nueva pestaña en lugar de descargar
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      window.open(pdfUrl, '_blank');
      
      toast.success('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error generando PDF';
      toast.error(errorMessage);
    }
  };

  // Las funciones formatDate y formatCurrency se importan desde utils/dateUtils

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading size="lg" text="Cargando historial de consolidaciones..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y estadísticas */}
      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div>
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-gray-900">
                Historial de Consolidaciones
              </h3>
              {user?.role === 'admin' && (
                <span className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
                  <Shield className="h-3 w-3" />
                  <span>Vista Admin - Todas las consolidaciones</span>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">
              {user?.role === 'admin' 
                ? `${consolidaciones.length} consolidación${consolidaciones.length !== 1 ? 'es' : ''} de todos los usuarios`
                : `${consolidaciones.length} consolidación${consolidaciones.length !== 1 ? 'es' : ''} creada${consolidaciones.length !== 1 ? 's' : ''} por ti`
              }
            </p>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por cliente, usuario o tipo..."
              className="input-field pl-10 w-full sm:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Lista de consolidaciones */}
      {filteredConsolidaciones.length === 0 ? (
        <div className="card text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No se encontraron consolidaciones' : 'No hay consolidaciones creadas'}
          </h3>
          <p className="text-gray-500">
            {searchTerm 
              ? 'Intenta con otros términos de búsqueda' 
              : 'Las consolidaciones creadas aparecerán aquí'
            }
          </p>
        </div>
      ) : (
        <div className="card p-0">
          <div className="table-container">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4" />
                      <span>Cliente</span>
                    </div>
                  </th>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Usuario</span>
                    </div>
                  </th>
                  <th className="table-header">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>Período</span>
                    </div>
                  </th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header">Total Debe</th>
                  <th className="table-header">Total Haber</th>
                  <th className="table-header">Fecha Creación</th>
                  <th className="table-header">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConsolidaciones.map((consolidacion) => (
                  <tr key={consolidacion.id} className="hover:bg-gray-50">
                    <td className="table-cell">
                      <div className="flex items-center space-x-3">
                        <div className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${
                          consolidacion.tipo === 'HOTELES' ? 'bg-blue-100' : 'bg-green-100'
                        }`}>
                          {consolidacion.tipo === 'HOTELES' ? (
                            <Building className="h-4 w-4 text-blue-600" />
                          ) : (
                            <FileText className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {consolidacion.cliente_nombre || 'Sin especificar'}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {consolidacion.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm font-medium text-gray-900">
                        {consolidacion.usuario_nombre || 'No especificado'}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {formatDate(consolidacion.fecha_inicio)}
                      </div>
                      <div className="text-xs text-gray-500">
                        al {formatDate(consolidacion.fecha_fin)}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        consolidacion.tipo === 'HOTELES' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {consolidacion.tipo}
                      </span>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm font-medium text-green-600">
                        {formatCurrency(calcularTotalDebe(consolidacion))}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(calcularTotalHaber(consolidacion))}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {formatCreationDate(consolidacion.fecha_creacion)}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(consolidacion)}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium text-primary-600 bg-primary-50 border border-primary-200 rounded-md hover:bg-primary-100 transition-colors"
                          title="Ver detalles de consolidación"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Ver Detalles</span>
                        </button>
                        
                        <button
                          onClick={() => handleExportToExcel(consolidacion)}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium text-green-600 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
                          title="Exportar a Excel"
                        >
                          <Download className="h-4 w-4" />
                          <span>Excel</span>
                        </button>
                        
                        <button
                          onClick={() => handleGenerateDirectPDF(consolidacion)}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 transition-colors"
                          title="Generar PDF directo"
                        >
                          <Download className="h-4 w-4" />
                          <span>PDF</span>
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

      {/* Información adicional */}
      <div className="card bg-gray-50 border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">
          Información del Historial
        </h4>
        <div className="text-xs text-gray-600 space-y-1">
          <p>• Las consolidaciones se almacenan de forma segura en el servidor.</p>
          <p>• Puedes ver todos los detalles contables haciendo clic en "Ver Detalles".</p>
          <p>• Los totales se calculan automáticamente al crear cada consolidación.</p>
        </div>
      </div>

      {/* Modal de detalles */}
      <ConsolidacionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        consolidacion={selectedConsolidacion}
      />
    </div>
  );
};

export default HistorySection;