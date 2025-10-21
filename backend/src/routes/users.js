const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// Validaciones para crear usuario
const createUserValidation = [
  body('username')
    .notEmpty()
    .withMessage('El nombre de usuario es requerido')
    .isLength({ min: 3 })
    .withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
  body('email')
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('El rol debe ser admin o user')
];

// Validaciones para actualizar usuario
const updateUserValidation = [
  body('username')
    .optional()
    .isLength({ min: 3 })
    .withMessage('El nombre de usuario debe tener al menos 3 caracteres'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('role')
    .optional()
    .isIn(['admin', 'user'])
    .withMessage('El rol debe ser admin o user')
];

// Rutas protegidas - requieren autenticación
router.use(auth.authenticateToken);

// GET /api/users/profile - Obtener perfil del usuario actual
router.get('/profile', userController.getProfile);

// GET /api/users - Obtener todos los usuarios (solo admin)
router.get('/', userController.getAllUsers);

// POST /api/users - Crear nuevo usuario (solo admin)
router.post('/', createUserValidation, userController.createUser);

// PUT /api/users/:id - Actualizar usuario (solo admin)
router.put('/:id', updateUserValidation, userController.updateUser);

// DELETE /api/users/:id - Eliminar usuario (solo admin)
router.delete('/:id', userController.deleteUser);

module.exports = router;