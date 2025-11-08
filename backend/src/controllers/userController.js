const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const userModel = new User();

const userController = {
  // Obtener todos los usuarios (solo admin)
  getAllUsers: async (req, res) => {
    try {
      // Verificar que el usuario sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acceso denegado. Solo administradores pueden ver usuarios.'
        });
      }

      const users = await userModel.getAll();

      res.json({
        success: true,
        users: users
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Crear nuevo usuario (solo admin)
  createUser: async (req, res) => {
    try {
      // Verificar que el usuario sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acceso denegado. Solo administradores pueden crear usuarios.'
        });
      }

      // Validar errores de entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { username, email, password, role = 'user' } = req.body;

      // Verificar si el email ya existe
      const emailExists = await userModel.emailExists(email);
      if (emailExists) {
        return res.status(400).json({
          error: 'Ya existe un usuario con este email'
        });
      }

      // Verificar si el username ya existe
      const usernameExists = await userModel.usernameExists(username);
      if (usernameExists) {
        return res.status(400).json({
          error: 'Ya existe un usuario con este nombre de usuario'
        });
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const newUser = await userModel.create({
        username,
        email,
        password: hashedPassword,
        role
      });

      // Respuesta sin contraseña
      res.status(201).json({
        success: true,
        message: 'Usuario creado exitosamente',
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at
        }
      });
    } catch (error) {
      console.error('Error creando usuario:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Actualizar usuario (solo admin)
  updateUser: async (req, res) => {
    try {
      // Verificar que el usuario sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acceso denegado. Solo administradores pueden modificar usuarios.'
        });
      }

      const userId = parseInt(req.params.id);
      const { username, email, password, role } = req.body;

      // Verificar que el usuario existe
      const existingUser = await userModel.getById(userId);
      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      // Preparar datos de actualización
      const updateData = {};

      if (username && username !== existingUser.username) {
        const usernameExists = await userModel.usernameExists(username, userId);
        if (usernameExists) {
          return res.status(400).json({
            error: 'Ya existe un usuario con este nombre de usuario'
          });
        }
        updateData.username = username;
      }

      if (email && email !== existingUser.email) {
        const emailExists = await userModel.emailExists(email, userId);
        if (emailExists) {
          return res.status(400).json({
            error: 'Ya existe un usuario con este email'
          });
        }
        updateData.email = email;
      }

      if (role && role !== existingUser.role) {
        updateData.role = role;
      }
      
      // Si se proporciona nueva contraseña, encriptarla
      if (password && password.trim() !== '') {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      // Si no hay cambios, devolver el usuario actual
      if (Object.keys(updateData).length === 0) {
        return res.json({
          success: true,
          message: 'No se realizaron cambios',
          user: existingUser
        });
      }

      // Actualizar usuario
      const updatedUser = await userModel.update(userId, updateData);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        user: updatedUser
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Eliminar usuario (solo admin)
  deleteUser: async (req, res) => {
    try {
      // Verificar que el usuario sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acceso denegado. Solo administradores pueden eliminar usuarios.'
        });
      }

      const userId = parseInt(req.params.id);

      // No permitir que el admin se elimine a sí mismo
      if (userId === req.user.id) {
        return res.status(400).json({
          error: 'No puedes eliminar tu propio usuario'
        });
      }

      // Verificar que el usuario existe
      const existingUser = await userModel.getById(userId);
      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      // Eliminar usuario
      await userModel.delete(userId);

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const user = await userModel.getById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }
      });
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        details: error.message
      });
    }
  }
};

module.exports = userController;