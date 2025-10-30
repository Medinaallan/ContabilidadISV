/**
 * Utilidad para formatear logs técnicos en mensajes de bitácora amigables para administradores
 */

/**
 * Convierte acciones técnicas en descripciones amigables para la bitácora
 */
const formatLogAction = (action, description, username, userData = {}) => {
  const actionMappings = {
    // Autenticación y usuarios
    'USER_LOGIN': {
      title: 'Inicio de Sesión',
      message: `${username} ingresó al sistema exitosamente`,
      category: 'Acceso',
      priority: 'normal'
    },
    'USER_LOGOUT': {
      title: 'Cierre de Sesión',
      message: `${username} cerró su sesión en el sistema`,
      category: 'Acceso',
      priority: 'normal'
    },
    'USER_REGISTER': {
      title: 'Nuevo Usuario',
      message: `Se registró un nuevo usuario: ${username}`,
      category: 'Usuarios',
      priority: 'importante'
    },
    'USER_LOGIN_FAILED': {
      title: 'Intento de Acceso Fallido',
      message: `Intento fallido de acceso con credenciales incorrectas`,
      category: 'Seguridad',
      priority: 'alerta'
    },
    'USER_UPDATE': {
      title: 'Actualización de Usuario',
      message: `Se actualizó la información del usuario ${username}`,
      category: 'Usuarios',
      priority: 'normal'
    },
    'USER_DELETE': {
      title: 'Eliminación de Usuario',
      message: `Se eliminó el usuario ${username || userData.deletedUser || 'desconocido'}`,
      category: 'Usuarios',
      priority: 'importante'
    },

    // Archivos y documentos
    'FILE_UPLOAD': {
      title: 'Subida de Archivo',
      message: `${username} subió un nuevo archivo: ${userData.filename || 'documento'}`,
      category: 'Archivos',
      priority: 'normal'
    },
    'FILE_DOWNLOAD': {
      title: 'Descarga de Archivo',
      message: `${username} descargó el archivo: ${userData.filename || 'documento'}`,
      category: 'Archivos',
      priority: 'normal'
    },
    'FILE_DELETE': {
      title: 'Eliminación de Archivo',
      message: `${username} eliminó el archivo: ${userData.filename || 'documento'}`,
      category: 'Archivos',
      priority: 'importante'
    },
    'FILE_PROCESS': {
      title: 'Procesamiento de Archivo',
      message: `${username} procesó el archivo: ${userData.filename || 'documento'}`,
      category: 'Procesamiento',
      priority: 'normal'
    },

    // Reportes y consolidación
    'REPORT_GENERATE': {
      title: 'Generación de Reporte',
      message: `${username} generó un reporte de consolidación`,
      category: 'Reportes',
      priority: 'normal'
    },
    'DATA_CONSOLIDATE': {
      title: 'Consolidación de Datos',
      message: `${username} ejecutó proceso de consolidación de datos`,
      category: 'Procesamiento',
      priority: 'importante'
    },
    'REPORT_EXPORT': {
      title: 'Exportación de Reporte',
      message: `${username} exportó un reporte del sistema`,
      category: 'Reportes',
      priority: 'normal'
    },

    // Sistema y configuración
    'SYSTEM_CONFIG': {
      title: 'Configuración del Sistema',
      message: `${username} modificó la configuración del sistema`,
      category: 'Sistema',
      priority: 'importante'
    },
    'SYSTEM_BACKUP': {
      title: 'Respaldo del Sistema',
      message: `Se realizó respaldo automático del sistema`,
      category: 'Sistema',
      priority: 'importante'
    },
    'SYSTEM_ERROR': {
      title: 'Error del Sistema',
      message: `Se registró un error en el sistema: ${description}`,
      category: 'Error',
      priority: 'critico'
    },
    'SYSTEM_START': {
      title: 'Inicio del Sistema',
      message: `El sistema de contabilidad se inició correctamente`,
      category: 'Sistema',
      priority: 'importante'
    },

    // Actividades generales
    'API_REQUEST': {
      title: 'Consulta del Sistema',
      message: `${username || 'Usuario'} accedió a una funcionalidad del sistema`,
      category: 'Navegación',
      priority: 'bajo'
    },
    'SYSTEM_AUDIT': {
      title: 'Consulta de Bitácora',
      message: `${username} consultó los registros de la bitácora del sistema`,
      category: 'Auditoría',
      priority: 'normal'
    },
    'USER_LIST': {
      title: 'Consulta de Usuarios',
      message: `${username} consultó la lista de usuarios del sistema`,
      category: 'Usuarios',
      priority: 'normal'
    },
    'FILE_VIEW': {
      title: 'Consulta de Archivos',
      message: `${username} consultó el historial de archivos subidos`,
      category: 'Archivos',
      priority: 'normal'
    },
    'DATA_EXPORT': {
      title: 'Exportación de Datos',
      message: `${username} exportó datos del sistema`,
      category: 'Datos',
      priority: 'normal'
    },
    'DATA_IMPORT': {
      title: 'Importación de Datos',
      message: `${username} importó datos al sistema`,
      category: 'Datos',
      priority: 'importante'
    }
  };

  // Si existe un mapeo específico, usarlo
  if (actionMappings[action]) {
    return actionMappings[action];
  }

  // Fallback para acciones no mapeadas
  return {
    title: 'Actividad del Sistema',
    message: description || `Se registró la acción: ${action}`,
    category: 'General',
    priority: 'normal'
  };
};

/**
 * Obtiene el ícono apropiado según la categoría del log
 */
const getCategoryIcon = (category) => {
  const iconMappings = {
    'Acceso': '🔐',
    'Usuarios': '👤',
    'Seguridad': '🛡️',
    'Archivos': '📄',
    'Procesamiento': '⚙️',
    'Reportes': '📊',
    'Sistema': '🖥️',
    'Error': '❌',
    'Datos': '💾',
    'Actividad': '📋',
    'Navegación': '🧭',
    'Auditoría': '🔍',
    'General': '📝'
  };
  
  return iconMappings[category] || '📝';
};

/**
 * Obtiene el color apropiado según la prioridad
 */
const getPriorityColor = (priority) => {
  const colorMappings = {
    'critico': 'red',
    'alerta': 'orange', 
    'importante': 'blue',
    'normal': 'green',
    'bajo': 'gray'
  };
  
  return colorMappings[priority] || 'gray';
};

/**
 * Formatea un log completo para la bitácora administrativa
 */
const formatLogForAdmin = (logData) => {
  const { action, description, username, user_id, ip_address, created_at, ...userData } = logData;
  
  const formatted = formatLogAction(action, description, username, userData);
  
  return {
    ...logData,
    formatted_title: formatted.title,
    formatted_message: formatted.message,
    category: formatted.category,
    priority: formatted.priority,
    category_icon: getCategoryIcon(formatted.category),
    priority_color: getPriorityColor(formatted.priority),
    friendly_date: formatFriendlyDate(created_at),
    location_info: ip_address ? `desde ${ip_address}` : null
  };
};

/**
 * Formatea fecha en formato amigable
 */
const formatFriendlyDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Hace menos de un minuto';
  } else if (diffMins < 60) {
    return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
  } else {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};

/**
 * Obtiene estadísticas de la bitácora
 */
const getLogStatistics = (logs) => {
  const stats = {
    total: logs.length,
    byCategory: {},
    byPriority: {},
    today: 0,
    thisWeek: 0
  };

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart.getTime() - (7 * 24 * 60 * 60 * 1000));

  logs.forEach(log => {
    const formatted = formatLogForAdmin(log);
    const logDate = new Date(log.created_at);

    // Contar por categoría
    stats.byCategory[formatted.category] = (stats.byCategory[formatted.category] || 0) + 1;
    
    // Contar por prioridad
    stats.byPriority[formatted.priority] = (stats.byPriority[formatted.priority] || 0) + 1;
    
    // Contar por tiempo
    if (logDate >= todayStart) {
      stats.today++;
    }
    if (logDate >= weekStart) {
      stats.thisWeek++;
    }
  });

  return stats;
};

module.exports = {
  formatLogAction,
  formatLogForAdmin,
  getCategoryIcon,
  getPriorityColor,
  formatFriendlyDate,
  getLogStatistics
};