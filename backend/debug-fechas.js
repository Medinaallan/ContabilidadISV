const Database = require('./src/models/Database');
const db = new Database();

(async () => {
  try {
    await db.init();
    
    // Primero buscar todas las empresas
    const clientesQuery = `SELECT id, nombre_empresa FROM clientes`;
    const clientesResult = await db.pool.request().query(clientesQuery);
    console.log('Empresas disponibles:');
    clientesResult.recordset.forEach(cliente => {
      console.log(`- ID: ${cliente.id}, Nombre: ${cliente.nombre_empresa}`);
    });
    
    // Buscar consolidaciones generales
    const generalQuery = `
      SELECT 
        'general' as tipo,
        cg.cliente_id,
        c.nombre_empresa,
        cg.fecha_creacion,
        YEAR(cg.fecha_creacion) as año,
        MONTH(cg.fecha_creacion) as mes
      FROM consolidaciones_generales cg
      LEFT JOIN clientes c ON cg.cliente_id = c.id
      WHERE cg.activo = 1
        AND c.nombre_empresa LIKE '%empresa%prueba%'
      ORDER BY cg.fecha_creacion
    `;
    
    const generalResult = await db.pool.request().query(generalQuery);
    console.log('\nConsolidaciones Generales encontradas:');
    generalResult.recordset.forEach(row => {
      console.log(`- ${row.tipo}: ${row.nombre_empresa} - ${row.fecha_creacion} (${row.año}/${row.mes.toString().padStart(2, '0')})`);
    });
    
    // Buscar consolidaciones de hoteles
    const hotelQuery = `
      SELECT 
        'hotel' as tipo,
        ch.cliente_id,
        c.nombre_empresa,
        ch.fecha_creacion,
        YEAR(ch.fecha_creacion) as año,
        MONTH(ch.fecha_creacion) as mes
      FROM consolidaciones_hoteles ch
      LEFT JOIN clientes c ON ch.cliente_id = c.id
      WHERE ch.activo = 1
        AND c.nombre_empresa LIKE '%empresa%prueba%'
      ORDER BY ch.fecha_creacion
    `;
    
    const hotelResult = await db.pool.request().query(hotelQuery);
    console.log('\nConsolidaciones de Hoteles encontradas:');
    hotelResult.recordset.forEach(row => {
      console.log(`- ${row.tipo}: ${row.nombre_empresa} - ${row.fecha_creacion} (${row.año}/${row.mes.toString().padStart(2, '0')})`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();