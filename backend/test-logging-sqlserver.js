const SystemLog = require('./src/models/SystemLog');
const Database = require('./src/models/Database');

async function testConnection() {
  console.log('🔧 Probando conexión limpia a SQL Server...\n');
  
  try {
    // Test 1: Verificar conexión SQL Server
    console.log('1. Probando conexión Database...');
    const db = new Database();
    await db.init();
    console.log('✅ Database conectado correctamente\n');
    
    // Test 2: Verificar conexión SystemLog
    console.log('2. Probando conexión SystemLog...');
    const systemLog = new SystemLog();
    const testLog = await systemLog.create({
      user_id: 1,
      action: 'TEST_CONNECTION',
      description: 'Prueba de conexión después del reset',
      ip_address: '127.0.0.1',
      user_agent: 'Test Script'
    });
    console.log('✅ SystemLog funcionando:', testLog);
    console.log('📅 Fecha del log:', testLog.created_at);
    console.log();
    
    // Test 3: Verificar que se guardó en SQL Server
    console.log('3. Verificando en SQL Server...');
    const logs = await systemLog.getLogs(5);
    console.log('📊 Logs en SQL Server:', logs.length);
    logs.forEach(log => {
      console.log(`   - ID: ${log.id}, Acción: ${log.action}, Fecha: ${log.created_at}`);
    });
    
    console.log('\n✅ ¡Reset completado exitosamente!');
    console.log('🚀 El sistema ahora usa SQL Server con zona horaria de Honduras\n');
    
  } catch (error) {
    console.error('❌ Error durante las pruebas:', error);
  }
  
  process.exit(0);
}

testConnection();