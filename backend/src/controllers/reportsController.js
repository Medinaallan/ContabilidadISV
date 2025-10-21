const Database = require('../models/Database');

const db = new Database();

const reportsController = {
  // Obtener todos los totales de consolidaciones
  getAllTotals: async (req, res) => {
    try {
      const totalsData = await db.getAllTotals();

      const processedReports = totalsData.map(report => ({
        id: report.id,
        filename: report.original_name,
        username: report.username,
        created_at: report.created_at,
        totals: report.totals,
        summary: {
          totalRows: report.totals.totalRows || 0,
          numericColumns: Object.keys(report.totals.numericColumns || {}).length,
          mainTotals: Object.entries(report.totals.numericColumns || {}).map(([column, data]) => ({
            column,
            sum: data.sum,
            average: data.average,
            count: data.count
          }))
        }
      }));

      res.json({
        reports: processedReports,
        summary: {
          totalReports: processedReports.length,
          totalDataRows: processedReports.reduce((sum, report) => sum + report.totals.totalRows, 0)
        }
      });

    } catch (error) {
      console.error('Error obteniendo reportes:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Obtener resumen general de la plataforma
  getDashboardSummary: async (req, res) => {
    try {
      const files = await db.getUploadedFiles();
      const totalsData = await db.getAllTotals();
      const recentLogs = await db.getLogs(10);

      const summary = {
        totalFiles: files.length,
        totalUsers: [...new Set(files.map(f => f.username))].length,
        totalConsolidations: totalsData.length,
        recentActivity: recentLogs.slice(0, 5).map(log => ({
          id: log.id,
          action: log.action,
          description: log.description,
          username: log.username || 'Sistema',
          created_at: log.created_at
        })),
        filesByUser: files.reduce((acc, file) => {
          acc[file.username] = (acc[file.username] || 0) + 1;
          return acc;
        }, {}),
        recentFiles: files.slice(0, 5).map(file => ({
          id: file.id,
          original_name: file.original_name,
          username: file.username,
          upload_date: file.upload_date
        }))
      };

      res.json(summary);

    } catch (error) {
      console.error('Error obteniendo resumen del dashboard:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
};

module.exports = reportsController;