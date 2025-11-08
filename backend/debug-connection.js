require('dotenv').config();

console.log('=== CONFIGURACIÓN ACTUAL ===');
console.log('DB_SERVER:', process.env.DB_SERVER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_USER:', process.env.DB_USER || 'undefined (Windows Auth)');
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[CONFIGURADO]' : 'undefined (Windows Auth)');

const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'ContabilidadISV',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true' || false,
    trustServerCertificate: process.env.DB_TRUST_CERT === 'false' ? false : true,
    enableArithAbort: true,
    instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS',
  },
  connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
  requestTimeout: 30000,
};

// Si no hay usuario especificado, usar Windows Authentication
if (!config.user) {
  config.authentication = {
    type: 'default'
  };
}

console.log('\n=== CONFIGURACIÓN MSSQL ===');
console.log('Config:', JSON.stringify(config, null, 2));

async function testDirectConnection() {
  try {
    console.log('\n=== PROBANDO CONEXIÓN DIRECTA ===');
    const pool = await sql.connect(config);
    console.log('✅ Conexión exitosa!');
    
    const result = await pool.request().query('SELECT GETDATE() as fecha_actual, USER_NAME() as usuario');
    console.log('✅ Query exitosa:', result.recordset[0]);
    
    await pool.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testDirectConnection();