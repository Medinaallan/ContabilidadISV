const Database = require('../models/Database');

const db = new Database();

const logActivity = async (req, res, next) => {
  // Capturar información de la petición
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    // Llamar al método original
    originalEnd.call(this, chunk, encoding);
    
    // Registrar la actividad después de que la respuesta se envíe
    setImmediate(async () => {
      try {
        const logData = {
          user_id: req.user ? req.user.id : null,
          action: `${req.method} ${req.path}`,
          description: getActionDescription(req),
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

const getActionDescription = (req) => {
  const { method, path, body, query } = req;
  
  // Describir acciones comunes
  if (path === '/api/auth/login') return 'Usuario intentó iniciar sesión';
  if (path === '/api/auth/register') return 'Registro de nuevo usuario';
  if (path === '/api/auth/logout') return 'Usuario cerró sesión';
  if (path.includes('/api/files/upload')) return 'Subida de archivo Excel';
  if (path.includes('/api/files/download')) return `Descarga de archivo: ${path.split('/').pop()}`;
  if (path === '/api/files/history') return 'Consulta de historial de archivos';
  if (path === '/api/reports/totals') return 'Consulta de reportes de totales';
  if (path === '/api/logs') return 'Consulta de logs del sistema';
  
  return `${method} ${path}`;
};

module.exports = {
  logActivity
};