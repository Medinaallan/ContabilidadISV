const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const Database = require('./src/models/Database_SqlServer');
const { logActivity } = require('./src/middleware/logging');

// Importar rutas
const authRoutes = require('./src/routes/auth');
const fileRoutes = require('./src/routes/files');
const reportsRoutes = require('./src/routes/reports');
const logsRoutes = require('./src/routes/logs');
const userRoutes = require('./src/routes/users');
const clienteRoutes = require('./src/routes/clientes');
const consolidacionesRoutes = require('./src/routes/consolidaciones');
const adminRoutes = require('./src/routes/admin');

const app = express();
const PORT = process.env.PORT || 3002;
const HOST = process.env.HOST || '0.0.0.0';

// Inicializar base de datos
const db = new Database();

// Middleware de seguridad
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 requests por windowMs
});
app.use(limiter);

// CORS configurado para red local
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:3000',
    process.env.FRONTEND_URL,
    // Permitir cualquier IP local (para red local)
    /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/,
    /^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
    /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}(:\d+)?$/,
    // Permitir Hamachi/VPN
    /^http:\/\/26\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/,
    // IPs específicas
    'http://26.171.184.161:5174',
    'http://26.120.44.48:5174',
    'http://192.168.1.18:5174',
    'http://26.23.200.187:5174'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware para capturar IP real
app.use((req, res, next) => {
  req.ip = req.ip || 
           req.connection.remoteAddress || 
           req.socket.remoteAddress ||
           (req.connection.socket ? req.connection.socket.remoteAddress : null);
  next();
});

// Middleware de logging (después de parsear JSON pero antes de las rutas)
app.use(logActivity);

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/consolidaciones', consolidacionesRoutes);
app.use('/api/admin', adminRoutes);

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta para servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Ruta no encontrada',
    message: `No se pudo encontrar ${req.method} ${req.originalUrl}`
  });
});

// Middleware de manejo de errores global
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  
  res.status(err.status || 500).json({
    error: 'Error interno del servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Algo salió mal'
  });
});

// Función para obtener la IP local
function getLocalIP() {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Buscar IPv4 que no sea loopback
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return 'localhost';
}

// Inicializar servidor
const server = app.listen(PORT, HOST, async () => {
  try {
    // Inicializar base de datos
    await db.init();
    
    const localIP = getLocalIP();
    
    console.log('🚀 Servidor iniciado exitosamente!');
    console.log('📍 Direcciones de acceso:');
    console.log(`   - Local: http://localhost:${PORT}`);
    console.log(`   - Red Local: http://${localIP}:${PORT}`);
    console.log(`   - Host: http://${HOST}:${PORT}`);
    console.log('');
    console.log('📊 Endpoints disponibles:');
    console.log(`   - API Health: http://${localIP}:${PORT}/api/health`);
    console.log(`   - API Auth: http://${localIP}:${PORT}/api/auth`);
    console.log(`   - API Files: http://${localIP}:${PORT}/api/files`);
    console.log(`   - API Reports: http://${localIP}:${PORT}/api/reports`);
    console.log(`   - API Logs: http://${localIP}:${PORT}/api/logs`);
    console.log(`   - API Clientes: http://${localIP}:${PORT}/api/clientes`);
    console.log('');
    console.log('⚙️  Configuración:');
    console.log(`   - Entorno: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   - Base de datos: ${process.env.DB_PATH || './database/consolidacion.db'}`);
    console.log(`   - Uploads: ${process.env.UPLOAD_PATH || './uploads'}`);
    console.log('');
    console.log('👥 Usuario administrador por defecto:');
    console.log('   - Email: admin@contabilidad.com');
    console.log('   - Contraseña: admin123');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Error: El puerto ${PORT} ya está en uso.`);
    console.error('💡 Soluciones posibles:');
    console.error('   1. Detén otros procesos que usen el puerto 3002');
    console.error('   2. Usa el comando: taskkill /f /im node.exe');
    console.error('   3. Reinicia la aplicación');
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
  }
});

// Manejo de cierre del servidor
process.on('SIGTERM', async () => {
  console.log('🔄 Cerrando servidor...');
  
  server.close(async () => {
    await db.close();
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  console.log('🔄 Cerrando servidor...');
  
  server.close(async () => {
    await db.close();
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
});

module.exports = app;