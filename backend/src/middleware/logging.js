const Database = require('../models/Database');

const db = new Database();

const logActivity = async (req, res, next) => {
  // Solo loggear rutas importantes, no todas las peticiones
  const shouldLog = shouldLogRoute(req.path, req.method);
  
  if (!shouldLog) {
    return next();
  }
  
  // Capturar información de la petición
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    // Llamar al método original
    originalEnd.call(this, chunk, encoding);
    
    // Registrar la actividad después de que la respuesta se envíe
    setImmediate(async () => {
      try {
        const actionInfo = getActionInfo(req);
        const logData = {
          user_id: req.user ? req.user.id : null,
          action: actionInfo.action,
          description: actionInfo.description,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.get('User-Agent')
        };

        await db.createLog(logData);
      } catch (error) {
        console.error('Error registrando log:', error);
      }
    });
  };

  next();
};

// Determinar si una ruta debe ser loggeada
const shouldLogRoute = (path, method) => {
  // No loggear rutas estáticas, de salud o muy frecuentes
  if (path === '/' || 
      path === '/favicon.ico' || 
      path.startsWith('/assets/') || 
      path.startsWith('/static/') ||
      path === '/api/health') {
    return false;
  }
  
  // Solo loggear rutas de API importantes
  return path.startsWith('/api/');
};

// Obtener información de la acción para logs más descriptivos
const getActionInfo = (req) => {
  const { method, path, body, query } = req;
  
  // Mapear rutas a acciones específicas
  const routeActions = {
    'POST /api/auth/login': {
      action: 'USER_LOGIN',
      description: 'Intento de inicio de sesión'
    },
    'POST /api/auth/register': {
      action: 'USER_REGISTER', 
      description: 'Registro de nuevo usuario'
    },
    'POST /api/auth/logout': {
      action: 'USER_LOGOUT',
      description: 'Cierre de sesión'
    },
    'POST /api/files/upload': {
      action: 'FILE_UPLOAD',
      description: 'Subida de archivo Excel para consolidación'
    },
    'GET /api/files/download': {
      action: 'FILE_DOWNLOAD',
      description: `Descarga de archivo`
    },
    'GET /api/files/history': {
      action: 'FILE_VIEW',
      description: 'Consulta de historial de archivos'
    },
    'GET /api/reports/totals': {
      action: 'REPORT_GENERATE',
      description: 'Generación de reporte de totales consolidados'
    },
    'GET /api/logs': {
      action: 'SYSTEM_AUDIT',
      description: 'Consulta de bitácora del sistema'
    },
    'GET /api/users': {
      action: 'USER_LIST',
      description: 'Consulta de lista de usuarios'
    },
    'PUT /api/users': {
      action: 'USER_UPDATE',
      description: 'Actualización de información de usuario'
    },
    'DELETE /api/users': {
      action: 'USER_DELETE',
      description: 'Eliminación de usuario'
    }
  };
  
  const routeKey = `${method} ${path}`;
  
  if (routeActions[routeKey]) {
    return routeActions[routeKey];
  }
  
  // Para rutas no específicamente mapeadas pero importantes
  if (path.includes('/api/files/download/')) {
    return {
      action: 'FILE_DOWNLOAD',
      description: `Descarga de archivo: ${path.split('/').pop()}`
    };
  }
  
  // Fallback para otras rutas de API
  return {
    action: 'API_REQUEST',
    description: `${method} ${path}`
  };
};

module.exports = {
  logActivity
};