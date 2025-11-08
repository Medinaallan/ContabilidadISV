const { validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Cliente = require('../models/Cliente');
const SystemLog = require('../models/SystemLog');

const cliente = new Cliente();
const systemLog = new SystemLog();

// Configuración de multer para subir logos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/logos');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    // Generar nombre único para el archivo
    const uniqueName = `logo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Solo permitir imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'));
    }
  }
});

const clienteController = {
  // Obtener todos los clientes
  getAll: async (req, res) => {
    try {
      const { activo, search } = req.query;
      let clientes;

      if (search) {
        clientes = await cliente.search(search, activo);
      } else {
        clientes = await cliente.getAll(activo);
      }

      res.json({
        success: true,
        clientes: clientes,
        total: clientes.length
      });
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  },

  // Obtener cliente por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID de cliente inválido'
        });
      }

      const clienteData = await cliente.getById(parseInt(id));
      
      if (!clienteData) {
        return res.status(404).json({
          error: 'Cliente no encontrado'
        });
      }

      res.json({
        success: true,
        cliente: clienteData
      });
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  },

  // Crear nuevo cliente
  create: async (req, res) => {
    try {
      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const {
        nombre_empresa,
        rtn,
        rubro,
        representante,
        telefono,
        email,
        direccion
      } = req.body;

      // Validar campos requeridos
      if (!nombre_empresa || !rtn || !rubro || !representante || !telefono || !email || !direccion) {
        return res.status(400).json({
          error: 'Todos los campos son requeridos',
          required: ['nombre_empresa', 'rtn', 'rubro', 'representante', 'telefono', 'email', 'direccion']
        });
      }

      const clienteData = {
        nombre_empresa: nombre_empresa.trim(),
        rtn: rtn.trim().toUpperCase(),
        rubro: rubro.trim(),
        representante: representante.trim(),
        telefono: telefono.trim(),
        email: email.trim().toLowerCase(),
        direccion: direccion.trim(),
        logo_url: req.file ? `/uploads/logos/${req.file.filename}` : null,
        usuario_creacion: req.user.id
      };

      const nuevoCliente = await cliente.create(clienteData);

      // Registrar log de cliente creado
      try {
        await systemLog.create({
          user_id: req.user.userId,
          action: 'cliente_created',
          description: `Usuario ${req.user.username} creó nuevo cliente: ${clienteData.nombre_empresa} (RTN: ${clienteData.rtn})`,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent')
        });
      } catch (logError) {
        console.error('Error registrando log de cliente creado:', logError);
      }

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        cliente: nuevoCliente
      });
    } catch (error) {
      console.error('Error creando cliente:', error);
      
      // Log del error
      try {
        await systemLog.create({
          user_id: req.user?.userId || null,
          action: 'error',
          description: `Error al crear cliente: ${error.message}`,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent')
        });
      } catch (logError) {
        console.error('Error logging client create error:', logError);
      }
      
      // Si hay error y se subió un archivo, eliminarlo
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo:', unlinkError);
        }
      }

      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  },

  // Actualizar cliente
  update: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID de cliente inválido'
        });
      }

      // Verificar errores de validación
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Datos inválidos',
          details: errors.array()
        });
      }

      const updateData = {};
      const allowedFields = [
        'nombre_empresa', 'rtn', 'rubro', 'representante', 
        'telefono', 'email', 'direccion', 'activo'
      ];

      // Solo incluir campos que se están actualizando
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (field === 'rtn') {
            updateData[field] = req.body[field].trim().toUpperCase();
          } else if (field === 'email') {
            updateData[field] = req.body[field].trim().toLowerCase();
          } else if (typeof req.body[field] === 'string') {
            updateData[field] = req.body[field].trim();
          } else {
            updateData[field] = req.body[field];
          }
        }
      });

      // Si se subió una nueva imagen
      if (req.file) {
        // Obtener cliente actual para eliminar logo anterior
        const clienteActual = await cliente.getById(parseInt(id));
        
        if (clienteActual && clienteActual.logo_url) {
          const oldLogoPath = path.join(__dirname, '../../', clienteActual.logo_url);
          try {
            await fs.unlink(oldLogoPath);
          } catch (error) {
            console.log('No se pudo eliminar el logo anterior:', error.message);
          }
        }

        updateData.logo_url = `/uploads/logos/${req.file.filename}`;
      }

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          error: 'No se proporcionaron campos para actualizar'
        });
      }

      const clienteActualizado = await cliente.update(parseInt(id), updateData);

      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        cliente: clienteActualizado
      });
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      
      // Si hay error y se subió un archivo, eliminarlo
      if (req.file) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.error('Error eliminando archivo:', unlinkError);
        }
      }

      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  },

  // Eliminar cliente (soft delete)
  delete: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID de cliente inválido'
        });
      }

      const result = await cliente.delete(parseInt(id));

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  },

  // Eliminar cliente permanentemente (solo admin)
  deleteHard: async (req, res) => {
    try {
      // Verificar que el usuario sea admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: 'Acceso denegado. Solo administradores pueden eliminar permanentemente.'
        });
      }

      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID de cliente inválido'
        });
      }

      // Obtener cliente para eliminar su logo si existe
      const clienteData = await cliente.getById(parseInt(id));
      
      if (clienteData && clienteData.logo_url) {
        const logoPath = path.join(__dirname, '../../', clienteData.logo_url);
        try {
          await fs.unlink(logoPath);
        } catch (error) {
          console.log('No se pudo eliminar el logo:', error.message);
        }
      }

      const result = await cliente.deleteHard(parseInt(id));

      res.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error eliminando cliente permanentemente:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  },

  // Cambiar estado del cliente
  toggleStatus: async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          error: 'ID de cliente inválido'
        });
      }

      const clienteActualizado = await cliente.toggleStatus(parseInt(id));

      res.json({
        success: true,
        message: `Cliente ${clienteActualizado.activo ? 'activado' : 'desactivado'} exitosamente`,
        cliente: clienteActualizado
      });
    } catch (error) {
      console.error('Error cambiando estado del cliente:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  },

  // Obtener estadísticas de clientes
  getStats: async (req, res) => {
    try {
      const stats = await cliente.getStats();

      res.json({
        success: true,
        estadisticas: stats
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        message: error.message
      });
    }
  },

  // Middleware para subir logo
  uploadLogo: upload.single('logo')
};

module.exports = clienteController;