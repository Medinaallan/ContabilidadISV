const bcrypt = require('bcryptjs'); 
const sql = require('mssql');

async function updatePassword() {
  try {
    const hash = await bcrypt.hash('admin123', 10);
    console.log('Nuevo hash generado:', hash);
    
    const config = {
      server: 'localhost',
      port: 1433,
      database: 'ContabilidadISV',
      user: 'contabilidad_app',
      password: 'Admin123!',
      options: {
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      }
    };
    
    console.log('Conectando a la base de datos...');
    const pool = await sql.connect(config);
    
    console.log('Actualizando contraseña...');
    const result = await pool.request()
      .input('newHash', sql.NVarChar(255), hash)
      .query("UPDATE users SET password = @newHash WHERE email = 'admin@contabilidad.com'");
    
    console.log('Contraseña actualizada. Filas afectadas:', result.rowsAffected);
    
    console.log('Verificando actualización...');
    const verify = await pool.request()
      .query("SELECT LEFT(password, 30) as hash_start, LEN(password) as length FROM users WHERE email = 'admin@contabilidad.com'");
    
    console.log('Hash verificado:', verify.recordset[0]);
    
    // Probar la validación
    const testResult = await bcrypt.compare('admin123', hash);
    console.log('Test de validación con bcrypt:', testResult);
    
    await pool.close();
    console.log('¡Actualización completada!');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updatePassword();