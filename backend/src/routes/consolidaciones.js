const express = require('express');
const router = express.Router();
const consolidacionesController = require('../controllers/consolidacionesController');
const { authenticateToken } = require('../middleware/auth');

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// ================================================
// RUTAS PRINCIPALES DE CONSOLIDACIONES
// ================================================

// POST /api/consolidaciones - Crear nueva consolidación
router.post('/', consolidacionesController.create);

// GET /api/consolidaciones - Obtener todas las consolidaciones
// Query params: cliente_id, fecha_desde, fecha_hasta, tipo
router.get('/', consolidacionesController.getAll);

// GET /api/consolidaciones/summary - Obtener resumen de consolidaciones
// Query params: cliente_id, fecha_desde, fecha_hasta
router.get('/summary', consolidacionesController.getSummary);

// GET /api/consolidaciones/ist-statistics - Obtener estadísticas de I.S.T.
// Query params: cliente_id, fecha_desde, fecha_hasta
router.get('/ist-statistics', consolidacionesController.getISTStatistics);

// GET /api/consolidaciones/cliente/:clienteId - Obtener consolidaciones por cliente
// Query params: tipo
router.get('/cliente/:clienteId', consolidacionesController.getByCliente);

// GET /api/consolidaciones/:id - Obtener consolidación por ID
// Query params: tipo (GENERALES o HOTELES)
router.get('/:id', consolidacionesController.getById);

// PUT /api/consolidaciones/:id - Actualizar consolidación
// Body debe incluir tipoRubro
router.put('/:id', consolidacionesController.update);

// DELETE /api/consolidaciones/:id - Eliminar consolidación (soft delete)
// Query params: tipo (GENERALES o HOTELES)
router.delete('/:id', consolidacionesController.delete);

module.exports = router;