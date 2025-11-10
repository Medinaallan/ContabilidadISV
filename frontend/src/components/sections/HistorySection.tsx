import React, { useState, useEffect } from 'react';
import { Eye, User, Calendar, FileText, Search, Building, Download, Printer, Shield } from 'lucide-react';
import { consolidacionService } from '@/services/api';
import { Consolidacion, ConsolidacionDetalle } from '@/types';
import Loading from '@/components/Loading';
import ConsolidacionModal from '@/components/ConsolidacionModal';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import * as XLSX from 'xlsx';

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

  // Exportar consolidación a Excel
  const handleExportToExcel = async (consolidacion: Consolidacion) => {
    try {
      // Obtener los detalles completos de la consolidación
      const detalles = await consolidacionService.getById(consolidacion.id, consolidacion.tipo);
      
      // Crear datos para la hoja de cálculo
      const worksheetData: (string | number)[][] = [
        // Información general
        ['CONSOLIDACIÓN CONTABLE'],
        [''],
        ['Cliente:', detalles.cliente_nombre || 'No especificado'],
        ['Usuario:', detalles.usuario_nombre || 'No especificado'],
        ['Tipo:', detalles.tipo],
        ['Período:', `${formatDate(detalles.fecha_inicio)} - ${formatDate(detalles.fecha_fin)}`],
        ['Fecha de Creación:', formatDate(detalles.fecha_creacion)],
        [''],
        // Encabezados de la tabla
        ['CUENTA', 'DEBE', 'HABER'],
      ];

      // Mapeo de cuentas (igual al modal)
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

      // Agregar filas de cuentas
      cuentasMap.forEach(cuenta => {
        const debeKey = `${cuenta.key}_debe`;
        const haberKey = `${cuenta.key}_haber`;
        const debe = detalles[debeKey] || 0;
        const haber = detalles[haberKey] || 0;
        
        worksheetData.push([
          cuenta.nombre,
          debe,
          haber
        ]);
      });

      // Agregar totales
      worksheetData.push(['']);
      worksheetData.push(['TOTALES', detalles.total_debe || 0, detalles.total_haber || 0]);
      worksheetData.push(['']);
      worksheetData.push(['BALANCE', (detalles.total_debe || 0) - (detalles.total_haber || 0)]);

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Agregar estilos básicos
      ws['!cols'] = [
        { width: 40 }, // Columna de cuentas más ancha
        { width: 15 }, // Columna debe
        { width: 15 }  // Columna haber
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Consolidación');
      
      // Descargar archivo
      const fileName = `Consolidacion_${detalles.tipo}_${detalles.cliente_nombre?.replace(/\s+/g, '_')}_${consolidacion.id}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
      toast.success('Archivo Excel exportado exitosamente');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error exportando a Excel';
      toast.error(errorMessage);
    }
  };

  // Imprimir consolidación como PDF
  const handlePrintToPDF = async (consolidacion: Consolidacion) => {
    try {
      // Obtener los detalles completos de la consolidación
      const detalles = await consolidacionService.getById(consolidacion.id, consolidacion.tipo);
      
      // Crear contenido HTML para imprimir
      const printContent = await generatePrintContent(detalles);
      
      // Crear un iframe oculto para la impresión
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.top = '-10000px';
      iframe.style.left = '-10000px';
      iframe.style.width = '0px';
      iframe.style.height = '0px';
      iframe.style.border = 'none';
      
      document.body.appendChild(iframe);
      
      // Escribir el contenido al iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.write(printContent);
        iframeDoc.close();
        
        // Esperar a que se cargue el contenido y luego imprimir
        iframe.onload = () => {
          setTimeout(() => {
            try {
              iframe.contentWindow?.focus();
              iframe.contentWindow?.print();
              
              // Limpiar el iframe después de un momento
              setTimeout(() => {
                document.body.removeChild(iframe);
              }, 1000);
            } catch (printError) {
              console.error('Error al imprimir:', printError);
              document.body.removeChild(iframe);
              toast.error('Error al imprimir el documento');
            }
          }, 500);
        };
      } else {
        document.body.removeChild(iframe);
        toast.error('No se pudo preparar el documento para impresión');
      }
      
      toast.success('Preparando documento para impresión...');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error preparando impresión';
      toast.error(errorMessage);
    }
  };

  // Generar contenido HTML para impresión
  const generatePrintContent = async (detalles: ConsolidacionDetalle): Promise<string> => {
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

    const cuentasRows = cuentasMap.map(cuenta => {
      const debeKey = `${cuenta.key}_debe`;
      const haberKey = `${cuenta.key}_haber`;
      const debe = detalles[debeKey] || 0;
      const haber = detalles[haberKey] || 0;
      
      return `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${cuenta.nombre}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(debe)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatCurrency(haber)}</td>
        </tr>
      `;
    }).join('');

    // Obtener URLs de las imágenes
    const serviciosContablesLogo = '/logo-home.png'; // Logo de Servicios Contables
    let clienteLogo = '';
    
    // Construir URL del logo del cliente si existe
    if (detalles.logo_url) {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3002';
      clienteLogo = `${API_BASE_URL}${detalles.logo_url}`;
    }

    // Crear el HTML con los logos en el encabezado
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Servicios Contables de Occidente - Consolidación Contable</title>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header-logos { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-bottom: 20px;
            padding: 10px 0;
            border-bottom: 2px solid #ddd;
          }
          .logo { 
            height: 60px; 
            width: auto; 
            max-width: 150px;
          }
          .logo-left {
            margin-right: auto;
          }
          .logo-right {
            margin-left: auto;
          }
          .header-title { 
            text-align: center; 
            margin: 20px 0; 
            flex-grow: 1;
          }
          .info { margin-bottom: 20px; }
          .info-row { margin: 5px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #f5f5f5; padding: 10px; border: 1px solid #ddd; }
          .totals-row { font-weight: bold; background-color: #f9f9f9; }
          .balance { font-size: 18px; font-weight: bold; margin: 20px 0; text-align: center; }
          .footer { 
            position: fixed; 
            bottom: 20px; 
            left: 50%; 
            transform: translateX(-50%); 
            text-align: center; 
            font-size: 10px; 
            color: #666; 
            width: 100%;
          }
          .no-logo-placeholder {
            width: 150px;
            height: 60px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 1px dashed #ccc;
            font-size: 10px;
            color: #999;
          }
          @media print {
            .footer { 
              position: fixed; 
              bottom: 0; 
            }
          }
        </style>
      </head>
      <body>
        <div class="header-logos">
          <div class="logo-left">
            <img src="${serviciosContablesLogo}" alt="Servicios Contables de Occidente" class="logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <div class="no-logo-placeholder" style="display: none;">
              Servicios Contables<br>de Occidente
            </div>
          </div>
          
          <div class="header-title">
            <h1>CONSOLIDACIÓN CONTABLE</h1>
          </div>
          
          <div class="logo-right">
            ${clienteLogo ? `
              <img src="${clienteLogo}" alt="${detalles.cliente_nombre}" class="logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
              <div class="no-logo-placeholder" style="display: none;">
                ${detalles.cliente_nombre || 'Cliente'}
              </div>
            ` : `
              <div class="no-logo-placeholder">
                ${detalles.cliente_nombre || 'Cliente'}
              </div>
            `}
          </div>
        </div>
        
        <div class="info">
          <div class="info-row"><strong>Cliente:</strong> ${detalles.cliente_nombre || 'No especificado'}</div>
          <div class="info-row"><strong>Usuario:</strong> ${detalles.usuario_nombre || 'No especificado'}</div>
          <div class="info-row"><strong>Tipo de Rubro:</strong> ${detalles.tipo}</div>
          <div class="info-row"><strong>Período:</strong> ${formatDate(detalles.fecha_inicio)} - ${formatDate(detalles.fecha_fin)}</div>
          <div class="info-row"><strong>Fecha de Creación:</strong> ${formatDate(detalles.fecha_creacion)}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>CUENTA</th>
              <th>DEBE</th>
              <th>HABER</th>
            </tr>
          </thead>
          <tbody>
            ${cuentasRows}
            <tr class="totals-row">
              <td style="padding: 10px; border: 1px solid #ddd;">TOTALES</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(detalles.total_debe || 0)}</td>
              <td style="padding: 10px; border: 1px solid #ddd; text-align: right;">${formatCurrency(detalles.total_haber || 0)}</td>
            </tr>
          </tbody>
        </table>

        <div class="balance">
          BALANCE: ${formatCurrency((detalles.total_debe || 0) - (detalles.total_haber || 0))}
        </div>

        ${detalles.observaciones ? `
          <div style="margin-top: 30px;">
            <strong>Observaciones:</strong><br>
            ${detalles.observaciones}
          </div>
        ` : ''}

        <div class="footer">
          Servicios Contables de Occidente - Área de Desarrollo Tecnológico<br>
          Sus datos son completamente confidenciales
        </div>
      </body>
      </html>
    `;
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
                        {formatCurrency(consolidacion.total_debe)}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm font-medium text-red-600">
                        {formatCurrency(consolidacion.total_haber)}
                      </div>
                    </td>
                    
                    <td className="table-cell">
                      <div className="text-sm text-gray-900">
                        {formatDate(consolidacion.fecha_creacion)}
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
                          onClick={() => handlePrintToPDF(consolidacion)}
                          className="inline-flex items-center space-x-1 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                          title="Imprimir PDF"
                        >
                          <Printer className="h-4 w-4" />
                          <span>Imprimir</span>
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