const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Database = require('../models/Database');

const db = new Database();

const authController = {
  // Registro de usuario
  register: async (req, res) => {
    try {
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
          error: 'El usuario ya existe con este email'
        });
      }

      // Encriptar contraseña
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Crear usuario
      const user = await db.createUser({
        username,
        email,
        password: hashedPassword,
        role
      });

      // Generar token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Registrar log
      await db.createLog({
        user_id: user.id,
        action: 'USER_REGISTER',
        description: `Nuevo usuario registrado: ${username}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Login de usuario
  login: async (req, res) => {
    try {
      // Validar entrada
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Buscar usuario
      const user = await db.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          error: 'Credenciales inválidas'
        });
      }

      // Generar token
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          email: user.email,
          role: user.role 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

      // Registrar log
      await db.createLog({
        user_id: user.id,
        action: 'USER_LOGIN',
        description: `Usuario ${user.username} inició sesión`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        message: 'Login exitoso',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Obtener perfil del usuario actual
  getProfile: async (req, res) => {
    try {
      const user = await db.findUserById(req.user.id);
      
      if (!user) {
        return res.status(404).json({
          error: 'Usuario no encontrado'
        });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Logout (principalmente para registrar la acción)
  logout: async (req, res) => {
    try {
      // Registrar log
      await db.createLog({
        user_id: req.user.id,
        action: 'USER_LOGOUT',
        description: `Usuario ${req.user.username} cerró sesión`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
};

module.exports = authController;