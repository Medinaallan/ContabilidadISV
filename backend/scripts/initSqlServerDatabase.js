const Database = require('../src/models/Database_SqlServer');
const bcrypt = require('bcryptjs');

async function initSqlServerDatabase() {
  console.log('==========================================');
  console.log('   INICIALIZANDO BASE DE DATOS SQL SERVER');
  console.log('==========================================');
  console.log('');

  let db = null;
  
  try {
    // Crear instancia de la base de datos
    db = new Database();
    
    // Inicializar conexión
    await db.init();
    
    console.log('✅ Conexión establecida correctamente');
    console.log('');
    
    // Verificar si el usuario administrador ya existe
    console.log('Verificando usuario administrador...');
    const existingAdmin = await db.findUserByEmail('admin@contabilidad.com');
    
    if (existingAdmin) {
      console.log('ℹ️  Usuario administrador ya existe');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Username: ${existingAdmin.username}`);
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
    } else {
      // Crear usuario administrador
      console.log('Creando usuario administrador...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const adminUser = await db.createUser({
        username: 'admin',
        email: 'admin@contabilidad.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log('✅ Usuario administrador creado:');
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Username: ${adminUser.username}`);
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Role: ${adminUser.role}`);
    }
    
    console.log('');
    
    // Crear log inicial del sistema
    console.log('Registrando inicialización del sistema...');
    await db.createLog({
      user_id: 1,
      action: 'SYSTEM_INIT_NODEJS',
      description: 'Sistema inicializado desde Node.js con SQL Server',
      ip_address: 'localhost',
      user_agent: 'Node.js Init Script'
    });
    
    console.log('✅ Log inicial creado');
    console.log('');
    
    // Mostrar estadísticas
    console.log('==========================================');
    console.log('   ESTADÍSTICAS DE LA BASE DE DATOS');
    console.log('==========================================');
    
    const users = await db.getAllUsers();
    console.log(`👥 Usuarios totales: ${users.length}`);
    
    const files = await db.getUploadedFiles();
    console.log(`📁 Archivos subidos: ${files.length}`);
    
    const logs = await db.getLogs(5);
    console.log(`📝 Logs recientes: ${logs.length}`);
    
    console.log('');
    console.log('==========================================');
    console.log('   CONFIGURACIÓN COMPLETADA');
    console.log('==========================================');
    console.log('');
    console.log('🌐 Credenciales de acceso:');
    console.log('   📧 Email: admin@contabilidad.com');
    console.log('   🔑 Contraseña: admin123');
    console.log('   👑 Rol: admin');
    console.log('');
    console.log('🔗 Cadena de conexión utilizada:');
    console.log('   Server=localhost\\SQLEXPRESS;Database=ContabilidadISV;Trusted_Connection=True;TrustServerCertificate=True;');
    console.log('');
    console.log('✅ El sistema está listo para usar con SQL Server!');
    
  } catch (error) {
    console.error('');
    console.error('❌ Error inicializando base de datos SQL Server:');
    console.error('   Mensaje:', error.message);
    
    if (error.code === 'ELOGIN') {
      console.error('');
      console.error('🔧 SOLUCIÓN SUGERIDA:');
      console.error('   1. Verifica que SQL Server Express esté instalado');
      console.error('   2. Verifica que el servicio SQL Server (SQLEXPRESS) esté ejecutándose');
      console.error('   3. Ejecuta primero los scripts de instalación de la base de datos:');
      console.error('      - database/sqlserver/instalar_base_datos.bat');
      console.error('   4. Verifica la cadena de conexión en las variables de entorno');
    }
    
    if (error.code === 'ENOTFOUND') {
      console.error('');
      console.error('🔧 SOLUCIÓN SUGERIDA:');
      console.error('   1. Verifica que la instancia SQL Server esté ejecutándose');
      console.error('   2. Comprueba el nombre de la instancia: localhost\\SQLEXPRESS');
      console.error('   3. Ejecuta "services.msc" y busca "SQL Server (SQLEXPRESS)"');
    }
    
    console.error('');
    process.exit(1);
    
  } finally {
    if (db) {
      await db.close();
    }
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  initSqlServerDatabase();
}

module.exports = { initSqlServerDatabase };