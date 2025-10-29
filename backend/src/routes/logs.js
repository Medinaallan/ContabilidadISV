const express = require('express');
const Database = require('../models/Database');
const { authenticateToken } = require('../middleware/auth');
const { formatLogForAdmin, getLogStatistics } = require('../utils/logFormatter');

const router = express.Router();
const db = new Database();

// Middleware de autenticación
router.use(authenticateToken);

// Obtener logs del sistema
router.get('/', async (req, res) => {
  try {
    const { limit = 100, userId, action } = req.query;
    
    let logs = await db.getLogs(parseInt(limit));
    
    // Filtrar por usuario si se especifica
    if (userId) {
      logs = logs.filter(log => log.user_id == userId);
    }
    
    // Filtrar por acción si se especifica
    if (action) {
      logs = logs.filter(log => log.action.toLowerCase().includes(action.toLowerCase()));
    }

    // Formatear logs para bitácora administrativa
    const formattedLogs = logs.map(log => {
      const formatted = formatLogForAdmin(log);
      return {
        id: log.id,
        username: log.username || 'Sistema',
        action: log.action,
        description: log.description,
        ip_address: log.ip_address,
        created_at: log.created_at,
        // Campos amigables para bitácora
        formatted_title: formatted.formatted_title,
        formatted_message: formatted.formatted_message,
        category: formatted.category,
        priority: formatted.priority,
        category_icon: formatted.category_icon,
        priority_color: formatted.priority_color,
        friendly_date: formatted.friendly_date,
        location_info: formatted.location_info
      };
    });

    // Obtener estadísticas
    const statistics = getLogStatistics(logs);

    res.json({
      logs: formattedLogs,
      total: logs.length,
      statistics
    });

  } catch (error) {
    console.error('Error obteniendo logs:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

// Crear log manual (para admin)
router.post('/', async (req, res) => {
  try {
    // Solo admin puede crear logs manuales
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Permisos insuficientes'
      });
    }

    const { action, description } = req.body;
    
    if (!action || !description) {
      return res.status(400).json({
        error: 'Acción y descripción son requeridas'
      });
    }

    const logData = {
      user_id: req.user.id,
      action: action,
      description: description,
      ip_address: req.ip,
      user_agent: req.get('User-Agent')
    };

    const log = await db.createLog(logData);

    res.status(201).json({
      message: 'Log creado exitosamente',
      log
    });

  } catch (error) {
    console.error('Error creando log:', error);
    res.status(500).json({
      error: 'Error interno del servidor'
    });
  }
});

module.exports = router;