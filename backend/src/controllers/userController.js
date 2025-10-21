const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const Database = require('../models/Database');

const db = new Database();

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

      const users = await db.getAllUsers();
      
      // Remover contraseñas de la respuesta
      const safeUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      res.json({
        success: true,
        users: safeUsers
      });
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
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

      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { username, email, password, role = 'user' } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await db.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Ya existe un usuario con este email'
        });
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const newUser = await db.createUser({
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
        error: 'Error interno del servidor'
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

      const userId = req.params.id;
      const { username, email, password, role } = req.body;

      // Verificar que el usuario existe
      const existingUser = await db.findUserById(userId);
      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      // Preparar datos de actualización
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      
      // Si se proporciona nueva contraseña, encriptarla
      if (password) {
        const saltRounds = 10;
        updateData.password = await bcrypt.hash(password, saltRounds);
      }

      // Actualizar usuario
      const updatedUser = await db.updateUser(userId, updateData);

      res.json({
        success: true,
        message: 'Usuario actualizado exitosamente',
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role,
          updated_at: updatedUser.updated_at
        }
      });
    } catch (error) {
      console.error('Error actualizando usuario:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
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

      const userId = req.params.id;

      // No permitir que el admin se elimine a sí mismo
      if (userId == req.user.userId) {
        return res.status(400).json({
          error: 'No puedes eliminar tu propio usuario'
        });
      }

      // Verificar que el usuario existe
      const existingUser = await db.findUserById(userId);
      if (!existingUser) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      // Eliminar usuario
      await db.deleteUser(userId);

      res.json({
        success: true,
        message: 'Usuario eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando usuario:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const user = await db.findUserById(req.user.userId);
      
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
        error: 'Error interno del servidor'
      });
    }
  }
};

module.exports = userController;