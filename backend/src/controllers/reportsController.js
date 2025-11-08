const ConsolidacionGenerales = require('../models/ConsolidacionGenerales');
const ConsolidacionHoteles = require('../models/ConsolidacionHoteles');

const consolidacionGenerales = new ConsolidacionGenerales();
const consolidacionHoteles = new ConsolidacionHoteles();

const reportsController = {
  // Obtener todos los totales de consolidaciones
  getAllTotals: async (req, res) => {
    try {
      // Obtener consolidaciones de ambas tablas
      const generales = await consolidacionGenerales.getAll();
      const hoteles = await consolidacionHoteles.getAll();
      
      const allConsolidaciones = [
        ...generales.map(c => ({ ...c, tipo: 'GENERALES' })),
        ...hoteles.map(c => ({ ...c, tipo: 'HOTELES' }))
      ];

      const processedReports = allConsolidaciones.map((consolidacion, index) => ({
        id: consolidacion.id || index + 1,
        filename: `Consolidación ${consolidacion.tipo} - ${consolidacion.cliente_id}`,
        username: 'Sistema',
        created_at: consolidacion.fecha_creacion || new Date().toISOString(),
        tipo: consolidacion.tipo,
        summary: {
          totalRows: 1,
          numericColumns: 20, // Aproximado número de campos numéricos
          mainTotals: [
            {
              column: 'Caja y Bancos (Debe)',
              sum: consolidacion.caja_bancos_debe || 0,
              average: consolidacion.caja_bancos_debe || 0,
              count: 1
            },
            {
              column: 'Caja y Bancos (Haber)',
              sum: consolidacion.caja_bancos_haber || 0,
              average: consolidacion.caja_bancos_haber || 0,
              count: 1
            },
            {
              column: 'Ventas Gravadas 15% (Debe)',
              sum: consolidacion.ventas_gravadas_15_debe || 0,
              average: consolidacion.ventas_gravadas_15_debe || 0,
              count: 1
            },
            {
              column: 'Ventas Gravadas 15% (Haber)',
              sum: consolidacion.ventas_gravadas_15_haber || 0,
              average: consolidacion.ventas_gravadas_15_haber || 0,
              count: 1
            },
            {
              column: 'ISV 15% Ventas (Debe)',
              sum: consolidacion.isv_15_ventas_debe || 0,
              average: consolidacion.isv_15_ventas_debe || 0,
              count: 1
            },
            {
              column: 'ISV 15% Ventas (Haber)',
              sum: consolidacion.isv_15_ventas_haber || 0,
              average: consolidacion.isv_15_ventas_haber || 0,
              count: 1
            }
          ]
        }
      }));

      res.json({
        reports: processedReports,
        summary: {
          totalReports: processedReports.length,
          totalDataRows: processedReports.length
        }
      });

    } catch (error) {
      console.error('Error obteniendo reportes:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Obtener resumen general de la plataforma
  getDashboardSummary: async (req, res) => {
    try {
      const generales = await consolidacionGenerales.getAll();
      const hoteles = await consolidacionHoteles.getAll();
      
      const totalConsolidaciones = generales.length + hoteles.length;

      const summary = {
        totalFiles: 0, // No tenemos archivos por ahora
        totalUsers: 1, // Placeholder
        totalConsolidations: totalConsolidaciones,
        recentActivity: [
          {
            id: 1,
            action: 'consolidacion_created',
            description: 'Nueva consolidación creada',
            username: 'Sistema',
            created_at: new Date().toISOString()
          }
        ],
        filesByUser: {},
        recentFiles: [],
        consolidacionesPorTipo: {
          GENERALES: generales.length,
          HOTELES: hoteles.length
        }
      };

      res.json(summary);

    } catch (error) {
      console.error('Error obteniendo resumen del dashboard:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
};

module.exports = reportsController;