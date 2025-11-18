const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// Todas las rutas de admin requieren autenticación y rol admin
router.use(authenticateToken);
router.use(requireRole(['admin']));

// POST /api/admin/backup - body: { table }
router.post('/backup', adminController.backupTable);

// POST /api/admin/delete - body: { table, backupBefore }
router.post('/delete', adminController.deleteTable);

module.exports = router;
