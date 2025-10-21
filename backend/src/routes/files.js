const express = require('express');
const fileController = require('../controllers/fileController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Subir archivo Excel
router.post('/upload', (req, res) => {
  fileController.uploadMiddleware(req, res, (err) => {
    if (err) {
      console.error('Error en multer:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
          error: 'El archivo es demasiado grande. Máximo permitido: 10MB'
        });
      }
      
      if (err.message.includes('Solo se permiten archivos Excel')) {
        return res.status(400).json({
          error: 'Solo se permiten archivos Excel (.xlsx, .xls)'
        });
      }
      
      return res.status(400).json({
        error: err.message || 'Error procesando archivo'
      });
    }
    
    fileController.uploadFile(req, res);
  });
});

// Obtener historial de archivos
router.get('/history', fileController.getFileHistory);

// Descargar archivo por ID
router.get('/download/:fileId', fileController.downloadFile);

// Obtener datos consolidados de un archivo
router.get('/data/:fileId', fileController.getConsolidatedData);

module.exports = router;