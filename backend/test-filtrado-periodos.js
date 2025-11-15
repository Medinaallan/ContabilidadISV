const Database = require('./src/models/Database');
const db = new Database();

(async () => {
  try {
    await db.init();
    
    // Ver todas las consolidaciones con sus períodos
    const query = `
      SELECT 
        'general' as tipo,
        cg.id,
        c.nombre_empresa,
        cg.fecha_inicio,
        cg.fecha_fin,
        cg.fecha_creacion,
        YEAR(cg.fecha_inicio) as año_inicio,
        MONTH(cg.fecha_inicio) as mes_inicio,
        cg.observaciones
      FROM consolidaciones_generales cg
      LEFT JOIN clientes c ON cg.cliente_id = c.id
      WHERE cg.activo = 1
        AND c.nombre_empresa LIKE '%EMPRESA%PRUEBA%'
      ORDER BY cg.fecha_inicio
    `;
    
    const result = await db.pool.request().query(query);
    console.log('=== CONSOLIDACIONES CON SUS PERÍODOS ===');
    result.recordset.forEach(row => {
      console.log(`ID: ${row.id}`);
      console.log(`Empresa: ${row.nombre_empresa}`);
      console.log(`Período: ${row.fecha_inicio.toISOString().split('T')[0]} al ${row.fecha_fin.toISOString().split('T')[0]}`);
      console.log(`Año: ${row.año_inicio}, Mes: ${row.mes_inicio}`);
      console.log(`Creada: ${row.fecha_creacion.toISOString().split('T')[0]}`);
      console.log(`Observaciones: ${row.observaciones}`);
      console.log('---');
    });
    
    // Probar el filtrado por bimestre 1 (enero-febrero)
    const bimestre1Start = '2025-01-01';
    const bimestre1End = '2025-02-28';
    
    console.log(`\n=== FILTRADO POR BIMESTRE 1 (${bimestre1Start} - ${bimestre1End}) ===`);
    
    const filterQuery = `
      SELECT 
        cg.id,
        c.nombre_empresa,
        cg.fecha_inicio,
        cg.fecha_fin,
        YEAR(cg.fecha_inicio) as año_inicio,
        MONTH(cg.fecha_inicio) as mes_inicio
      FROM consolidaciones_generales cg
      LEFT JOIN clientes c ON cg.cliente_id = c.id
      WHERE cg.activo = 1
        AND c.nombre_empresa LIKE '%EMPRESA%PRUEBA%'
        AND (cg.fecha_inicio <= @endDate AND cg.fecha_fin >= @startDate)
    `;
    
    const request = db.pool.request();
    request.input('startDate', require('mssql').Date, new Date(bimestre1Start));
    request.input('endDate', require('mssql').Date, new Date(bimestre1End));
    
    const filterResult = await request.query(filterQuery);
    
    if (filterResult.recordset.length > 0) {
      console.log('Consolidaciones que coinciden con Bimestre 1:');
      filterResult.recordset.forEach(row => {
        console.log(`- ID ${row.id}: ${row.fecha_inicio.toISOString().split('T')[0]} al ${row.fecha_fin.toISOString().split('T')[0]} (${row.año_inicio}/${row.mes_inicio})`);
      });
    } else {
      console.log('No se encontraron consolidaciones para Bimestre 1');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();