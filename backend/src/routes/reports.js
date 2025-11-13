const express = require('express');
const reportsController = require('../controllers/reportsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Obtener métricas de consolidaciones
router.get('/metrics', reportsController.getMetrics);

// Obtener ranking de clientes
router.get('/ranking', reportsController.getRanking);

// Obtener resúmenes detallados por cliente
router.get('/summaries', reportsController.getSummaries);

// Rutas legacy comentadas hasta implementar
// router.get('/totals', reportsController.getAllTotals);
// router.get('/dashboard', reportsController.getDashboardSummary);

module.exports = router;