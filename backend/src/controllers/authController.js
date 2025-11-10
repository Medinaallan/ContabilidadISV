const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const Database = require('../models/Database');
const SystemLog = require('../models/SystemLog');

const db = new Database();
const systemLog = new SystemLog();

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

      // Registrar log de registro exitoso
      await systemLog.create({
        user_id: user.id,
        action: 'USER_REGISTER',
        description: `Nuevo usuario registrado: ${username} (${email})`,
        ip_address: req.ip || req.connection.remoteAddress,
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

      const { username, password } = req.body;

      // Buscar usuario por nombre de usuario
      const user = await db.findUserByUsername(username);
      
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

      // Registrar log de inicio de sesión exitoso
      await systemLog.create({
        user_id: user.id,
        action: 'USER_LOGIN',
        description: `Usuario ${user.username} (${user.email}) inició sesión exitosamente`,
        ip_address: req.ip || req.connection.remoteAddress,
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
      
      // Log del error
      try {
        await systemLog.create({
          user_id: null,
          action: 'error',
          description: `Error en intento de login: ${error.message}`,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent')
        });
      } catch (logError) {
        console.error('Error logging login error:', logError);
      }
      
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
      // Registrar log de cierre de sesión
      await systemLog.create({
        user_id: req.user.id,
        action: 'USER_LOGOUT',
        description: `Usuario ${req.user.username} (${req.user.email}) cerró sesión`,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent')
      });

      res.json({
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('Error en logout:', error);
      
      // Log del error
      try {
        await systemLog.create({
          user_id: req.user?.id || null,
          action: 'error',
          description: `Error en logout: ${error.message}`,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent')
        });
      } catch (logError) {
        console.error('Error logging logout error:', logError);
      }
      
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
};

module.exports = authController;