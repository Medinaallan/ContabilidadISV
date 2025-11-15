const Database = require('./src/models/Database');
const db = new Database();

(async () => {
  try {
    await db.init();
    
    // Probar la consulta de resúmenes con los nuevos campos
    const query = `
      SELECT 
        cg.cliente_id,
        c.nombre_empresa as cliente_nombre,
        c.rtn as cliente_rtn,
        u.username as usuario_nombre,
        'general' as tipo,
        SUM(COALESCE(caja_bancos_debe, 0)) as caja_bancos_debe,
        SUM(COALESCE(caja_bancos_haber, 0)) as caja_bancos_haber
      FROM consolidaciones_generales cg
      LEFT JOIN clientes c ON cg.cliente_id = c.id
      LEFT JOIN users u ON cg.usuario_id = u.id
      WHERE cg.activo = 1
        AND c.nombre_empresa LIKE '%EMPRESA%PRUEBA%'
      GROUP BY cg.cliente_id, c.nombre_empresa, c.rtn, u.username
      HAVING COUNT(*) > 0
    `;
    
    const result = await db.pool.request().query(query);
    console.log('=== CONSULTA DE RESÚMENES CON RTN Y USUARIO ===');
    console.log('Resultados:');
    result.recordset.forEach(row => {
      console.log(`Cliente: ${row.cliente_nombre}`);
      console.log(`RTN: ${row.cliente_rtn}`);
      console.log(`Usuario: ${row.usuario_nombre}`);
      console.log(`Tipo: ${row.tipo}`);
      console.log('---');
    });
    
    if (result.recordset.length === 0) {
      console.log('No se encontraron resultados');
      
      // Verificar si hay datos sin los JOIN
      const simpleQuery = `
        SELECT 
          cg.cliente_id,
          cg.usuario_id,
          c.nombre_empresa,
          c.rtn,
          u.username
        FROM consolidaciones_generales cg
        LEFT JOIN clientes c ON cg.cliente_id = c.id
        LEFT JOIN users u ON cg.usuario_id = u.id
        WHERE cg.activo = 1
        LIMIT 3
      `;
      
      const simpleResult = await db.pool.request().query(simpleQuery);
      console.log('\n=== DATOS BÁSICOS ===');
      simpleResult.recordset.forEach(row => {
        console.log(`Cliente ID: ${row.cliente_id}, Usuario ID: ${row.usuario_id}`);
        console.log(`Empresa: ${row.nombre_empresa}, RTN: ${row.rtn}, Username: ${row.username}`);
        console.log('---');
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();