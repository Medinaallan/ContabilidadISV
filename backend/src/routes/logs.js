const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const SystemLog = require('../models/SystemLog');

const router = express.Router();
const systemLog = new SystemLog();

// Middleware de autenticación
router.use(authenticateToken);

// Función helper para formatear logs para el frontend
const formatLogForAdmin = (log) => {
  // Función para crear mensajes amigables para usuarios no técnicos
  const getReadableAction = (action, description) => {
    // Mapeo de acciones técnicas a mensajes amigables
    const actionMap = {
      'USER_LOGIN': 'Inicio de sesión de usuario',
      'USER_LOGOUT': 'Cierre de sesión de usuario', 
      'login': 'Usuario ingresó al sistema',
      'logout': 'Usuario salió del sistema',
      'consolidacion_created': 'Nueva consolidación contable creada',
      'consolidacion_updated': 'Consolidación contable modificada',
      'consolidacion_deleted': 'Consolidación contable eliminada',
      'user_created': 'Nuevo usuario registrado',
      'user_updated': 'Información de usuario actualizada',
      'user_deleted': 'Usuario eliminado del sistema',
      'cliente_created': 'Nuevo cliente agregado',
      'cliente_updated': 'Información de cliente actualizada',
      'reporte_generated': 'Reporte contable generado',
      'database_backup': 'Respaldo de base de datos creado',
      'error': 'Error del sistema',
      'SYSTEM_INIT': 'Sistema iniciado correctamente'
    };

    // Si es una acción API, convertir a mensaje amigable
    if (action === 'api_request' && description) {
      if (description.includes('GET /validate')) return 'Verificación de sesión';
      if (description.includes('GET /')) return 'Acceso a página principal';
      if (description.includes('POST /login')) return 'Intento de inicio de sesión';
      if (description.includes('POST /logout')) return 'Solicitud de cierre de sesión';
      if (description.includes('GET /users')) return 'Consulta de usuarios';
      if (description.includes('GET /logs')) return 'Consulta de bitácora del sistema';
      if (description.includes('GET /reports')) return 'Acceso a reportes';
      if (description.includes('POST /consolidaciones')) return 'Creación de consolidación';
      if (description.includes('PUT /consolidaciones')) return 'Actualización de consolidación';
      if (description.includes('/clientes')) return 'Gestión de clientes';
      return 'Actividad en el sistema';
    }

    return actionMap[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Función para determinar categoría e icono
  const getCategoryAndIcon = (action, description) => {
    if (action === 'USER_LOGIN' || action === 'login' || (action === 'api_request' && description?.includes('login'))) {
      return { icon: '�', category: 'Inicio de Sesión', priority: 'importante' };
    }
    if (action === 'USER_LOGOUT' || action === 'logout' || (action === 'api_request' && description?.includes('logout'))) {
      return { icon: '🚪', category: 'Cierre de Sesión', priority: 'normal' };
    }
    if (action.includes('consolidacion') || (action === 'api_request' && description?.includes('consolidacion'))) {
      return { icon: '�', category: 'Contabilidad', priority: 'importante' };
    }
    if (action.includes('user') || (action === 'api_request' && description?.includes('/users'))) {
      return { icon: '👥', category: 'Gestión de Usuarios', priority: 'normal' };
    }
    if (action.includes('cliente') || (action === 'api_request' && description?.includes('cliente'))) {
      return { icon: '🏢', category: 'Gestión de Clientes', priority: 'normal' };
    }
    if (action.includes('reporte') || (action === 'api_request' && description?.includes('report'))) {
      return { icon: '📈', category: 'Reportes', priority: 'normal' };
    }
    if (action === 'api_request' && description?.includes('validate')) {
      return { icon: '✅', category: 'Verificación', priority: 'normal' };
    }
    if (action === 'api_request' && description?.includes('GET /')) {
      return { icon: '👁️', category: 'Navegación', priority: 'normal' };
    }
    if (action === 'SYSTEM_INIT' || action.includes('system')) {
      return { icon: '⚙️', category: 'Sistema', priority: 'importante' };
    }
    if (action === 'error') {
      return { icon: '⚠️', category: 'Errores', priority: 'critico' };
    }
    return { icon: '📝', category: 'Actividad General', priority: 'normal' };
  };

  // Mostrar fecha y hora exacta - SQL Server ya está en zona horaria de Honduras
  const getFriendlyDate = (createdAt) => {
    const logDate = new Date(createdAt);
    
    // Verificar que la fecha sea válida
    if (isNaN(logDate.getTime())) {
      return 'Fecha inválida';
    }

    // SQL Server ya está configurado para Honduras (UTC-6), usar directamente
    const day = logDate.getDate().toString().padStart(2, '0');
    const month = (logDate.getMonth() + 1).toString().padStart(2, '0');
    const year = logDate.getFullYear();
    const hours = logDate.getHours();
    const minutes = logDate.getMinutes().toString().padStart(2, '0');
    const seconds = logDate.getSeconds().toString().padStart(2, '0');
    
    const hour12 = hours === 0 ? 12 : (hours > 12 ? hours - 12 : hours);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    
    return `${day}/${month}/${year} ${hour12}:${minutes}:${seconds} ${ampm}`;
  };

  const categoryInfo = getCategoryAndIcon(log.action, log.description);
  const readableAction = getReadableAction(log.action, log.description);
  const friendlyDate = getFriendlyDate(log.created_at);

  return {
    ...categoryInfo,
    formatted_title: readableAction,
    formatted_message: log.description || 'Sin detalles adicionales',
    friendly_date: friendlyDate,
    location_info: log.ip_address ? `Desde: ${log.ip_address}` : 'Sistema interno'
  };
};

// Obtener logs del sistema
router.get('/', async (req, res) => {
  try {
    const { limit = 100, userId, action } = req.query;
    
    const filters = {};
    if (userId) filters.user_id = parseInt(userId);
    if (action) filters.action = action;

    // Asegurar que limit es un número entero
    const limitNumber = parseInt(limit) || 100;
    const logs = await systemLog.getLogs(limitNumber, filters);

    // FILTRAR los logs de API REQUEST - NO los queremos mostrar
    const filteredLogs = logs.filter(log => {
      return log.action !== 'api_request' && log.action !== 'API_REQUEST';
    });

    // Formatear logs para bitácora administrativa
    const formattedLogs = filteredLogs.map(log => {
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
        category_icon: formatted.icon,
        priority_color: formatted.priority,
        friendly_date: formatted.friendly_date,
        location_info: formatted.location_info
      };
    });

    // Obtener estadísticas solo de logs importantes (sin API requests)
    const statistics = await systemLog.getStatistics({
      ...filters,
      exclude_actions: ['api_request', 'API_REQUEST']
    });

    // Agregar categorías y prioridades para los filtros del frontend
    const categories = [...new Set(formattedLogs.map(log => log.category))];
    const priorities = [...new Set(formattedLogs.map(log => log.priority))];

    res.json({
      success: true,
      logs: formattedLogs,
      statistics: {
        total: formattedLogs.length,
        today: statistics.today || 0,
        thisWeek: statistics.thisWeek || 0,
        byCategory: statistics.byAction || {},
        byPriority: priorities.reduce((acc, priority) => {
          acc[priority] = formattedLogs.filter(log => log.priority === priority).length;
          return acc;
        }, {})
      },
      total: formattedLogs.length
    });

  } catch (error) {
    console.error('Error obteniendo logs:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
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

    // Crear el log en la base de datos
    const newLog = await systemLog.create({
      user_id: req.user.id,
      action: action,
      description: description,
      ip_address: req.ip || req.connection.remoteAddress,
      user_agent: req.get('User-Agent')
    });

    // Formatear el log para respuesta
    const formatted = formatLogForAdmin(newLog);

    const responseLog = {
      ...newLog,
      username: req.user.username || req.user.email,
      formatted_title: formatted.formatted_title,
      formatted_message: formatted.formatted_message,
      category: formatted.category,
      priority: formatted.priority,
      category_icon: formatted.icon,
      friendly_date: formatted.friendly_date,
      location_info: formatted.location_info
    };

    res.status(201).json({
      success: true,
      message: 'Log creado exitosamente',
      log: responseLog
    });

  } catch (error) {
    console.error('Error creando log:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
});

module.exports = router;