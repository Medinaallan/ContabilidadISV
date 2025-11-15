const Database = require('./src/models/Database');
const db = new Database();

(async () => {
  try {
    await db.init();
    
    // Revisar estructura de consolidaciones_generales
    const generalStructQuery = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'consolidaciones_generales'
      ORDER BY ORDINAL_POSITION
    `;
    
    const generalStruct = await db.pool.request().query(generalStructQuery);
    console.log('=== ESTRUCTURA consolidaciones_generales ===');
    generalStruct.recordset.forEach(col => {
      console.log(`${col.COLUMN_NAME} - ${col.DATA_TYPE} - ${col.IS_NULLABLE}`);
    });
    
    // Revisar estructura de consolidaciones_hoteles
    const hotelStructQuery = `
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'consolidaciones_hoteles'
      ORDER BY ORDINAL_POSITION
    `;
    
    const hotelStruct = await db.pool.request().query(hotelStructQuery);
    console.log('\n=== ESTRUCTURA consolidaciones_hoteles ===');
    hotelStruct.recordset.forEach(col => {
      console.log(`${col.COLUMN_NAME} - ${col.DATA_TYPE} - ${col.IS_NULLABLE}`);
    });
    
    // Ver una consolidación de ejemplo para entender la estructura
    const sampleQuery = `
      SELECT TOP 1 *
      FROM consolidaciones_generales 
      WHERE cliente_id = 1 AND activo = 1
    `;
    
    const sampleResult = await db.pool.request().query(sampleQuery);
    console.log('\n=== EJEMPLO DE CONSOLIDACIÓN ===');
    if (sampleResult.recordset.length > 0) {
      console.log('Campos con valores no nulos:');
      const record = sampleResult.recordset[0];
      Object.keys(record).forEach(key => {
        if (record[key] !== null && record[key] !== 0) {
          console.log(`${key}: ${record[key]}`);
        }
      });
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();