const express = require('express');
const { body } = require('express-validator');
const clienteController = require('../controllers/clienteController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validaciones para crear cliente
const createClienteValidation = [
  body('nombre_empresa')
    .notEmpty()
    .withMessage('El nombre de la empresa es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre de la empresa debe tener entre 2 y 255 caracteres'),
  body('rtn')
    .notEmpty()
    .withMessage('El RTN es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El RTN debe tener entre 3 y 50 caracteres')
    .matches(/^[0-9\-]+$/)
    .withMessage('El RTN debe contener solo números y guiones'),
  body('rubro')
    .notEmpty()
    .withMessage('El rubro es requerido')
    .isLength({ min: 2, max: 100 })
    .withMessage('El rubro debe tener entre 2 y 100 caracteres'),
  body('representante')
    .notEmpty()
    .withMessage('El representante es requerido')
    .isLength({ min: 2, max: 255 })
    .withMessage('El representante debe tener entre 2 y 255 caracteres'),
  body('telefono')
    .notEmpty()
    .withMessage('El teléfono es requerido')
    .isLength({ min: 8, max: 20 })
    .withMessage('El teléfono debe tener entre 8 y 20 caracteres')
    .matches(/^[\d\-\+\(\)\s]+$/)
    .withMessage('El teléfono debe contener solo números, espacios, guiones, paréntesis y signo +'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido')
    .isLength({ max: 255 })
    .withMessage('El email no debe exceder 255 caracteres'),
  body('direccion')
    .notEmpty()
    .withMessage('La dirección es requerida')
    .isLength({ min: 5, max: 500 })
    .withMessage('La dirección debe tener entre 5 y 500 caracteres')
];

// Validaciones para actualizar cliente
const updateClienteValidation = [
  body('nombre_empresa')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El nombre de la empresa debe tener entre 2 y 255 caracteres'),
  body('rtn')
    .optional()
    .isLength({ min: 3, max: 50 })
    .withMessage('El RTN debe tener entre 3 y 50 caracteres')
    .matches(/^[0-9\-]+$/)
    .withMessage('El RTN debe contener solo números y guiones'),
  body('rubro')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('El rubro debe tener entre 2 y 100 caracteres'),
  body('representante')
    .optional()
    .isLength({ min: 2, max: 255 })
    .withMessage('El representante debe tener entre 2 y 255 caracteres'),
  body('telefono')
    .optional()
    .isLength({ min: 8, max: 20 })
    .withMessage('El teléfono debe tener entre 8 y 20 caracteres')
    .matches(/^[\d\-\+\(\)\s]+$/)
    .withMessage('El teléfono debe contener solo números, espacios, guiones, paréntesis y signo +'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido')
    .isLength({ max: 255 })
    .withMessage('El email no debe exceder 255 caracteres'),
  body('direccion')
    .optional()
    .isLength({ min: 5, max: 500 })
    .withMessage('La dirección debe tener entre 5 y 500 caracteres'),
  body('activo')
    .optional()
    .isBoolean()
    .withMessage('El campo activo debe ser verdadero o falso')
];

// Todas las rutas requieren autenticación
router.use(auth.authenticateToken);

// GET /api/clientes - Obtener todos los clientes
// Query params opcionales: ?activo=true/false, ?search=termino
router.get('/', clienteController.getAll);

// GET /api/clientes/stats - Obtener estadísticas de clientes
router.get('/stats', clienteController.getStats);

// GET /api/clientes/:id - Obtener cliente por ID
router.get('/:id', clienteController.getById);

// POST /api/clientes - Crear nuevo cliente
// Incluye middleware para subir logo
router.post('/', 
  clienteController.uploadLogo,
  createClienteValidation, 
  clienteController.create
);

// PUT /api/clientes/:id - Actualizar cliente
// Incluye middleware para subir logo
router.put('/:id', 
  clienteController.uploadLogo,
  updateClienteValidation, 
  clienteController.update
);

// PATCH /api/clientes/:id/toggle-status - Cambiar estado del cliente
router.patch('/:id/toggle-status', clienteController.toggleStatus);

// DELETE /api/clientes/:id - Eliminar cliente (soft delete)
router.delete('/:id', clienteController.delete);

// DELETE /api/clientes/:id/hard - Eliminar cliente permanentemente (solo admin)
router.delete('/:id/hard', clienteController.deleteHard);


// --- Carga masiva de clientes desde CSV (solo admin) ---
const multer = require('multer');
const uploadCsv = multer({ dest: 'uploads/' });
router.post('/upload-csv', auth.requireRole(['admin']), uploadCsv.single('csv'), clienteController.uploadCSV);

module.exports = router;