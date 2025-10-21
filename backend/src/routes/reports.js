const express = require('express');
const reportsController = require('../controllers/reportsController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Obtener todos los totales/reportes
router.get('/totals', reportsController.getAllTotals);

// Obtener resumen del dashboard
router.get('/dashboard', reportsController.getDashboardSummary);

module.exports = router;