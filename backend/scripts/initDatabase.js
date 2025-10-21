const Database = require('../src/models/Database');

async function initDatabase() {
  console.log('Inicializando base de datos...');
  
  try {
    const db = new Database();
    await db.init();
    console.log(' Base de datos inicializada correctamente');
    
    // Crear usuario administrador por defecto
    try {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await db.createUser({
        username: 'admin',
        email: 'admin@contabilidad.com',
        password: hashedPassword,
        role: 'admin'
      });
      
      console.log(' Usuario administrador creado: admin@contabilidad.com / admin123');
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log('ℹ  Usuario administrador ya existe');
      } else {
        console.error('Error creando usuario admin:', error.message);
      }
    }
    
    await db.close();
    console.log('✅ Configuración completada');
    
  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    process.exit(1);
  }
}

initDatabase();