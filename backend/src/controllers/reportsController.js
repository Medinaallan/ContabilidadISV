const Database = require('../models/Database');

const db = new Database();

// Obtener métricas de consolidaciones
exports.getMetrics = async (req, res) => {
  try {
    console.log('=== REPORTS METRICS CALLED ===');
    console.log('Query params:', req.query);
    
    const { year, clienteId } = req.query;
    
    let whereConditions = ['cg.activo = 1', 'ch.activo = 1'];
    let params = {};
    
    // Filtro por año
    if (year && year !== 'todos') {
      whereConditions.push('YEAR(cg.fecha_inicio) = @year');
      whereConditions.push('YEAR(ch.fecha_inicio) = @year');
      params.year = parseInt(year);
    }
    
    // Filtro por cliente
    if (clienteId && clienteId !== 'todos') {
      whereConditions.push('cg.cliente_id = @clienteId');
      whereConditions.push('ch.cliente_id = @clienteId');
      params.clienteId = parseInt(clienteId);
    }
    
    const generalWhere = whereConditions.filter(c => c.includes('cg.')).join(' AND ');
    const hotelWhere = whereConditions.filter(c => c.includes('ch.')).join(' AND ');
    
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM consolidaciones_generales cg WHERE ${generalWhere}) as consolidacionesGenerales,
        (SELECT COUNT(*) FROM consolidaciones_hoteles ch WHERE ${hotelWhere}) as consolidacionesHoteles
    `;
    
    console.log('Query to execute:', query);
    console.log('Params:', params);
    
    if (!db.isConnected) {
      await db.init();
    }
    
    const request = db.pool.request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, key === 'year' || key === 'clienteId' ? require('mssql').Int : require('mssql').NVarChar(255), value);
    }
    
    const result = await request.query(query);
    
    console.log('Raw SQL result:', result.recordset);
    
    const metrics = {
      consolidacionesGenerales: result.recordset[0].consolidacionesGenerales,
      consolidacionesHoteles: result.recordset[0].consolidacionesHoteles,
      totalConsolidaciones: result.recordset[0].consolidacionesGenerales + result.recordset[0].consolidacionesHoteles
    };
    
    console.log('Processed metrics:', metrics);
    res.json(metrics);
  } catch (error) {
    console.error('=== ERROR EN METRICS ===');
    console.error('Error completo:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
};
// Obtener ranking de clientes
exports.getRanking = async (req, res) => {
  try {
    const { year } = req.query;
    
    let whereCondition = '';
    let params = {};
    
    if (year && year !== 'todos') {
      whereCondition = `WHERE YEAR(cg.fecha_inicio) = @year OR YEAR(ch.fecha_inicio) = @year`;
      params.year = parseInt(year);
    }
    
    const query = `
      WITH ClienteStats AS (
        SELECT 
          c.id,
          c.nombre_empresa,
          COALESCE(cg_count.total, 0) as consolidacionesGenerales,
          COALESCE(ch_count.total, 0) as consolidacionesHoteles
        FROM clientes c
        LEFT JOIN (
          SELECT cliente_id, COUNT(*) as total 
          FROM consolidaciones_generales cg
          WHERE cg.activo = 1 ${year && year !== 'todos' ? 'AND YEAR(cg.fecha_inicio) = @year' : ''}
          GROUP BY cliente_id
        ) cg_count ON c.id = cg_count.cliente_id
        LEFT JOIN (
          SELECT cliente_id, COUNT(*) as total 
          FROM consolidaciones_hoteles ch
          WHERE ch.activo = 1 ${year && year !== 'todos' ? 'AND YEAR(ch.fecha_inicio) = @year' : ''}
          GROUP BY cliente_id
        ) ch_count ON c.id = ch_count.cliente_id
        WHERE c.activo = 1
      )
      SELECT 
        id,
        nombre_empresa,
        consolidacionesGenerales,
        consolidacionesHoteles,
        (consolidacionesGenerales + consolidacionesHoteles) as totalConsolidaciones
      FROM ClienteStats
      WHERE (consolidacionesGenerales + consolidacionesHoteles) > 0
      ORDER BY totalConsolidaciones DESC, nombre_empresa ASC
    `;
    
    if (!db.isConnected) {
      await db.init();
    }
    
    const request = db.pool.request();
    for (const [key, value] of Object.entries(params)) {
      request.input(key, key === 'year' ? require('mssql').Int : require('mssql').NVarChar(255), value);
    }
    
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (error) {
    console.error('Error obteniendo ranking:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
// Obtener resúmenes por cliente
exports.getSummaries = async (req, res) => {
  try {
    console.log('=== SUMMARIES CALLED ===');
    console.log('Query params:', req.query);
    
    const { year, clienteId, periodo } = req.query;
    
    let whereConditions = [];
    let params = {};
    
    // Separar WHERE de consultas por condicional de clasificacion
    let generalWhereConditions = [];
    let hotelWhereConditions = [];
    
    // FUNCION PARA OBTENER LAS CONSOLIDACIONES EN RANGO DE FECHAS
    const getDateRange = (year, periodo) => {
      const yearInt = parseInt(year);
      let startDate, endDate;
      
      if (periodo === 'anual') {
        startDate = `${yearInt}-01-01`;
        endDate = `${yearInt}-12-31`;
      } else if (periodo.startsWith('bimestral-')) {
        const bimester = parseInt(periodo.split('-')[1]);
        const startMonth = (bimester - 1) * 2 + 1;
        const endMonth = bimester * 2;
        startDate = `${yearInt}-${startMonth.toString().padStart(2, '0')}-01`;
        endDate = `${yearInt}-${endMonth.toString().padStart(2, '0')}-${new Date(yearInt, endMonth, 0).getDate()}`;
      } else if (periodo.startsWith('trimestral-')) {
        const trimester = parseInt(periodo.split('-')[1]);
        const startMonth = (trimester - 1) * 3 + 1;
        const endMonth = trimester * 3;
        startDate = `${yearInt}-${startMonth.toString().padStart(2, '0')}-01`;
        endDate = `${yearInt}-${endMonth.toString().padStart(2, '0')}-${new Date(yearInt, endMonth, 0).getDate()}`;
      } else if (periodo.startsWith('semestral-')) {
        const semester = parseInt(periodo.split('-')[1]);
        if (semester === 1) {
          startDate = `${yearInt}-01-01`;
          endDate = `${yearInt}-06-30`;
        } else {
          startDate = `${yearInt}-07-01`;
          endDate = `${yearInt}-12-31`;
        }
      }
      
      return { startDate, endDate };
    };
    
    // Filtro por año y período
    if (year && periodo) {
      const { startDate, endDate } = getDateRange(year, periodo);
      console.log(`Aplicando filtro por período: ${periodo} del año ${year}`);
      console.log(`Rango de fechas: ${startDate} a ${endDate}`);
      
      // Filtrar por consolidaciones cuyo período se superpone con el rango solicitado
      generalWhereConditions.push('(cg.fecha_inicio <= @endDate AND cg.fecha_fin >= @startDate)');
      hotelWhereConditions.push('(ch.fecha_inicio <= @endDate AND ch.fecha_fin >= @startDate)');
      params.startDate = startDate;
      params.endDate = endDate;
    } else if (year && year !== 'todos') {
      console.log(`Aplicando filtro por año: ${year}`);
      generalWhereConditions.push('YEAR(cg.fecha_inicio) = @year');
      hotelWhereConditions.push('YEAR(ch.fecha_inicio) = @year');
      params.year = parseInt(year);
    }
    
    // Filtro por cliente
    if (clienteId && clienteId !== 'todos') {
      console.log(`Aplicando filtro por cliente: ${clienteId}`);
      generalWhereConditions.push('cg.cliente_id = @clienteId');
      hotelWhereConditions.push('ch.cliente_id = @clienteId');
      params.clienteId = parseInt(clienteId);
    }
    
    // Add activo condition
    generalWhereConditions.push('cg.activo = 1');
    hotelWhereConditions.push('ch.activo = 1');
    
    const generalWhereClause = generalWhereConditions.length > 0 ? 'WHERE ' + generalWhereConditions.join(' AND ') : '';
    const hotelWhereClause = hotelWhereConditions.length > 0 ? 'WHERE ' + hotelWhereConditions.join(' AND ') : '';
    
    // Consulta para consolidaciones generales
    const generalQuery = `
      SELECT 
        cg.cliente_id,
        c.nombre_empresa as cliente_nombre,
        c.rtn as cliente_rtn,
        u.username as usuario_nombre,
        'general' as tipo,
        SUM(COALESCE(caja_bancos_debe, 0)) as caja_bancos_debe,
        SUM(COALESCE(ventas_gravadas_15_debe, 0)) as ventas_gravadas_15_debe,
        SUM(COALESCE(isv_15_ventas_debe, 0)) as isv_15_ventas_debe,
        SUM(COALESCE(ventas_gravadas_18_debe, 0)) as ventas_gravadas_18_debe,
        SUM(COALESCE(isv_18_ventas_debe, 0)) as isv_18_ventas_debe,
        SUM(COALESCE(ventas_exentas_debe, 0)) as ventas_exentas_debe,
        SUM(COALESCE(compras_gravadas_15_debe, 0)) as compras_gravadas_15_debe,
        SUM(COALESCE(isv_15_compras_debe, 0)) as isv_15_compras_debe,
        SUM(COALESCE(compras_gravadas_18_debe, 0)) as compras_gravadas_18_debe,
        SUM(COALESCE(isv_18_compras_debe, 0)) as isv_18_compras_debe,
        SUM(COALESCE(compras_exentas_debe, 0)) as compras_exentas_debe,
        SUM(COALESCE(ingresos_honorarios_debe, 0)) as ingresos_honorarios_debe,
        SUM(COALESCE(sueldos_salarios_debe, 0)) as sueldos_salarios_debe,
        SUM(COALESCE(treceavo_mes_debe, 0)) as treceavo_mes_debe,
        SUM(COALESCE(catorceavo_mes_debe, 0)) as catorceavo_mes_debe,
        SUM(COALESCE(prestaciones_laborales_debe, 0)) as prestaciones_laborales_debe,
        SUM(COALESCE(energia_electrica_debe, 0)) as energia_electrica_debe,
        SUM(COALESCE(suministro_agua_debe, 0)) as suministro_agua_debe,
        SUM(COALESCE(hondutel_debe, 0)) as hondutel_debe,
        SUM(COALESCE(servicio_internet_debe, 0)) as servicio_internet_debe,
        SUM(COALESCE(ihss_debe, 0)) as ihss_debe,
        SUM(COALESCE(aportaciones_infop_debe, 0)) as aportaciones_infop_debe,
        SUM(COALESCE(aportaciones_rap_debe, 0)) as aportaciones_rap_debe,
        SUM(COALESCE(papeleria_utiles_debe, 0)) as papeleria_utiles_debe,
        SUM(COALESCE(alquileres_debe, 0)) as alquileres_debe,
        SUM(COALESCE(combustibles_lubricantes_debe, 0)) as combustibles_lubricantes_debe,
        SUM(COALESCE(seguros_debe, 0)) as seguros_debe,
        SUM(COALESCE(viaticos_gastos_viaje_debe, 0)) as viaticos_gastos_viaje_debe,
        SUM(COALESCE(impuestos_municipales_debe, 0)) as impuestos_municipales_debe,
        SUM(COALESCE(impuestos_estatales_debe, 0)) as impuestos_estatales_debe,
        SUM(COALESCE(honorarios_profesionales_debe, 0)) as honorarios_profesionales_debe,
        SUM(COALESCE(mantenimiento_vehiculos_debe, 0)) as mantenimiento_vehiculos_debe,
        SUM(COALESCE(reparacion_mantenimiento_debe, 0)) as reparacion_mantenimiento_debe,
        SUM(COALESCE(fletes_encomiendas_debe, 0)) as fletes_encomiendas_debe,
        SUM(COALESCE(limpieza_aseo_debe, 0)) as limpieza_aseo_debe,
        SUM(COALESCE(seguridad_vigilancia_debe, 0)) as seguridad_vigilancia_debe,
        SUM(COALESCE(materiales_suministros_debe, 0)) as materiales_suministros_debe,
        SUM(COALESCE(publicidad_propaganda_debe, 0)) as publicidad_propaganda_debe,
        SUM(COALESCE(gastos_bancarios_debe, 0)) as gastos_bancarios_debe,
        SUM(COALESCE(intereses_financieros_debe, 0)) as intereses_financieros_debe,
        SUM(COALESCE(tasa_seguridad_poblacional_debe, 0)) as tasa_seguridad_poblacional_debe,
        SUM(COALESCE(gastos_varios_debe, 0)) as gastos_varios_debe,
        -- HABER
        SUM(COALESCE(caja_bancos_haber, 0)) as caja_bancos_haber,
        SUM(COALESCE(ventas_gravadas_15_haber, 0)) as ventas_gravadas_15_haber,
        SUM(COALESCE(isv_15_ventas_haber, 0)) as isv_15_ventas_haber,
        SUM(COALESCE(ventas_gravadas_18_haber, 0)) as ventas_gravadas_18_haber,
        SUM(COALESCE(isv_18_ventas_haber, 0)) as isv_18_ventas_haber,
        SUM(COALESCE(ventas_exentas_haber, 0)) as ventas_exentas_haber,
        SUM(COALESCE(compras_gravadas_15_haber, 0)) as compras_gravadas_15_haber,
        SUM(COALESCE(isv_15_compras_haber, 0)) as isv_15_compras_haber,
        SUM(COALESCE(compras_gravadas_18_haber, 0)) as compras_gravadas_18_haber,
        SUM(COALESCE(isv_18_compras_haber, 0)) as isv_18_compras_haber,
        SUM(COALESCE(compras_exentas_haber, 0)) as compras_exentas_haber,
        SUM(COALESCE(ingresos_honorarios_haber, 0)) as ingresos_honorarios_haber,
        SUM(COALESCE(sueldos_salarios_haber, 0)) as sueldos_salarios_haber,
        SUM(COALESCE(treceavo_mes_haber, 0)) as treceavo_mes_haber,
        SUM(COALESCE(catorceavo_mes_haber, 0)) as catorceavo_mes_haber,
        SUM(COALESCE(prestaciones_laborales_haber, 0)) as prestaciones_laborales_haber,
        SUM(COALESCE(energia_electrica_haber, 0)) as energia_electrica_haber,
        SUM(COALESCE(suministro_agua_haber, 0)) as suministro_agua_haber,
        SUM(COALESCE(hondutel_haber, 0)) as hondutel_haber,
        SUM(COALESCE(servicio_internet_haber, 0)) as servicio_internet_haber,
        SUM(COALESCE(ihss_haber, 0)) as ihss_haber,
        SUM(COALESCE(aportaciones_infop_haber, 0)) as aportaciones_infop_haber,
        SUM(COALESCE(aportaciones_rap_haber, 0)) as aportaciones_rap_haber,
        SUM(COALESCE(papeleria_utiles_haber, 0)) as papeleria_utiles_haber,
        SUM(COALESCE(alquileres_haber, 0)) as alquileres_haber,
        SUM(COALESCE(combustibles_lubricantes_haber, 0)) as combustibles_lubricantes_haber,
        SUM(COALESCE(seguros_haber, 0)) as seguros_haber,
        SUM(COALESCE(viaticos_gastos_viaje_haber, 0)) as viaticos_gastos_viaje_haber,
        SUM(COALESCE(impuestos_municipales_haber, 0)) as impuestos_municipales_haber,
        SUM(COALESCE(impuestos_estatales_haber, 0)) as impuestos_estatales_haber,
        SUM(COALESCE(honorarios_profesionales_haber, 0)) as honorarios_profesionales_haber,
        SUM(COALESCE(mantenimiento_vehiculos_haber, 0)) as mantenimiento_vehiculos_haber,
        SUM(COALESCE(reparacion_mantenimiento_haber, 0)) as reparacion_mantenimiento_haber,
        SUM(COALESCE(fletes_encomiendas_haber, 0)) as fletes_encomiendas_haber,
        SUM(COALESCE(limpieza_aseo_haber, 0)) as limpieza_aseo_haber,
        SUM(COALESCE(seguridad_vigilancia_haber, 0)) as seguridad_vigilancia_haber,
        SUM(COALESCE(materiales_suministros_haber, 0)) as materiales_suministros_haber,
        SUM(COALESCE(publicidad_propaganda_haber, 0)) as publicidad_propaganda_haber,
        SUM(COALESCE(gastos_bancarios_haber, 0)) as gastos_bancarios_haber,
        SUM(COALESCE(intereses_financieros_haber, 0)) as intereses_financieros_haber,
        SUM(COALESCE(tasa_seguridad_poblacional_haber, 0)) as tasa_seguridad_poblacional_haber,
        SUM(COALESCE(gastos_varios_haber, 0)) as gastos_varios_haber,
        SUM(COALESCE(total_debe, 0)) as total_debe,
        SUM(COALESCE(total_haber, 0)) as total_haber,
        SUM(COALESCE(diferencia, 0)) as diferencia
      FROM consolidaciones_generales cg
      LEFT JOIN clientes c ON cg.cliente_id = c.id
      LEFT JOIN users u ON cg.usuario_id = u.id
      ${generalWhereClause}
      GROUP BY cg.cliente_id, c.nombre_empresa, c.rtn, u.username
      HAVING COUNT(*) > 0
    `;
    
    // Consulta para consolidaciones de hoteles (similar pero con ist_4)
    const hotelQuery = `
      SELECT 
        ch.cliente_id,
        c.nombre_empresa as cliente_nombre,
        c.rtn as cliente_rtn,
        u.username as usuario_nombre,
        'hotel' as tipo,
        SUM(COALESCE(caja_bancos_debe, 0)) as caja_bancos_debe,
        SUM(COALESCE(ventas_gravadas_15_debe, 0)) as ventas_gravadas_15_debe,
        SUM(COALESCE(isv_15_ventas_debe, 0)) as isv_15_ventas_debe,
        SUM(COALESCE(ventas_gravadas_18_debe, 0)) as ventas_gravadas_18_debe,
        SUM(COALESCE(isv_18_ventas_debe, 0)) as isv_18_ventas_debe,
        SUM(COALESCE(ist_4_debe, 0)) as ist_4_debe,
        SUM(COALESCE(ventas_exentas_debe, 0)) as ventas_exentas_debe,
        SUM(COALESCE(compras_gravadas_15_debe, 0)) as compras_gravadas_15_debe,
        SUM(COALESCE(isv_15_compras_debe, 0)) as isv_15_compras_debe,
        SUM(COALESCE(compras_gravadas_18_debe, 0)) as compras_gravadas_18_debe,
        SUM(COALESCE(isv_18_compras_debe, 0)) as isv_18_compras_debe,
        SUM(COALESCE(compras_exentas_debe, 0)) as compras_exentas_debe,
        SUM(COALESCE(ingresos_honorarios_debe, 0)) as ingresos_honorarios_debe,
        SUM(COALESCE(sueldos_salarios_debe, 0)) as sueldos_salarios_debe,
        SUM(COALESCE(treceavo_mes_debe, 0)) as treceavo_mes_debe,
        SUM(COALESCE(catorceavo_mes_debe, 0)) as catorceavo_mes_debe,
        SUM(COALESCE(prestaciones_laborales_debe, 0)) as prestaciones_laborales_debe,
        SUM(COALESCE(energia_electrica_debe, 0)) as energia_electrica_debe,
        SUM(COALESCE(suministro_agua_debe, 0)) as suministro_agua_debe,
        SUM(COALESCE(hondutel_debe, 0)) as hondutel_debe,
        SUM(COALESCE(servicio_internet_debe, 0)) as servicio_internet_debe,
        SUM(COALESCE(ihss_debe, 0)) as ihss_debe,
        SUM(COALESCE(aportaciones_infop_debe, 0)) as aportaciones_infop_debe,
        SUM(COALESCE(aportaciones_rap_debe, 0)) as aportaciones_rap_debe,
        SUM(COALESCE(papeleria_utiles_debe, 0)) as papeleria_utiles_debe,
        SUM(COALESCE(alquileres_debe, 0)) as alquileres_debe,
        SUM(COALESCE(combustibles_lubricantes_debe, 0)) as combustibles_lubricantes_debe,
        SUM(COALESCE(seguros_debe, 0)) as seguros_debe,
        SUM(COALESCE(viaticos_gastos_viaje_debe, 0)) as viaticos_gastos_viaje_debe,
        SUM(COALESCE(impuestos_municipales_debe, 0)) as impuestos_municipales_debe,
        SUM(COALESCE(impuestos_estatales_debe, 0)) as impuestos_estatales_debe,
        SUM(COALESCE(honorarios_profesionales_debe, 0)) as honorarios_profesionales_debe,
        SUM(COALESCE(mantenimiento_vehiculos_debe, 0)) as mantenimiento_vehiculos_debe,
        SUM(COALESCE(reparacion_mantenimiento_debe, 0)) as reparacion_mantenimiento_debe,
        SUM(COALESCE(fletes_encomiendas_debe, 0)) as fletes_encomiendas_debe,
        SUM(COALESCE(limpieza_aseo_debe, 0)) as limpieza_aseo_debe,
        SUM(COALESCE(seguridad_vigilancia_debe, 0)) as seguridad_vigilancia_debe,
        SUM(COALESCE(materiales_suministros_debe, 0)) as materiales_suministros_debe,
        SUM(COALESCE(publicidad_propaganda_debe, 0)) as publicidad_propaganda_debe,
        SUM(COALESCE(gastos_bancarios_debe, 0)) as gastos_bancarios_debe,
        SUM(COALESCE(intereses_financieros_debe, 0)) as intereses_financieros_debe,
        SUM(COALESCE(tasa_seguridad_poblacional_debe, 0)) as tasa_seguridad_poblacional_debe,
        SUM(COALESCE(gastos_varios_debe, 0)) as gastos_varios_debe,
        -- HABER
        SUM(COALESCE(caja_bancos_haber, 0)) as caja_bancos_haber,
        SUM(COALESCE(ventas_gravadas_15_haber, 0)) as ventas_gravadas_15_haber,
        SUM(COALESCE(isv_15_ventas_haber, 0)) as isv_15_ventas_haber,
        SUM(COALESCE(ventas_gravadas_18_haber, 0)) as ventas_gravadas_18_haber,
        SUM(COALESCE(isv_18_ventas_haber, 0)) as isv_18_ventas_haber,
        SUM(COALESCE(ist_4_haber, 0)) as ist_4_haber,
        SUM(COALESCE(ventas_exentas_haber, 0)) as ventas_exentas_haber,
        SUM(COALESCE(compras_gravadas_15_haber, 0)) as compras_gravadas_15_haber,
        SUM(COALESCE(isv_15_compras_haber, 0)) as isv_15_compras_haber,
        SUM(COALESCE(compras_gravadas_18_haber, 0)) as compras_gravadas_18_haber,
        SUM(COALESCE(isv_18_compras_haber, 0)) as isv_18_compras_haber,
        SUM(COALESCE(compras_exentas_haber, 0)) as compras_exentas_haber,
        SUM(COALESCE(ingresos_honorarios_haber, 0)) as ingresos_honorarios_haber,
        SUM(COALESCE(sueldos_salarios_haber, 0)) as sueldos_salarios_haber,
        SUM(COALESCE(treceavo_mes_haber, 0)) as treceavo_mes_haber,
        SUM(COALESCE(catorceavo_mes_haber, 0)) as catorceavo_mes_haber,
        SUM(COALESCE(prestaciones_laborales_haber, 0)) as prestaciones_laborales_haber,
        SUM(COALESCE(energia_electrica_haber, 0)) as energia_electrica_haber,
        SUM(COALESCE(suministro_agua_haber, 0)) as suministro_agua_haber,
        SUM(COALESCE(hondutel_haber, 0)) as hondutel_haber,
        SUM(COALESCE(servicio_internet_haber, 0)) as servicio_internet_haber,
        SUM(COALESCE(ihss_haber, 0)) as ihss_haber,
        SUM(COALESCE(aportaciones_infop_haber, 0)) as aportaciones_infop_haber,
        SUM(COALESCE(aportaciones_rap_haber, 0)) as aportaciones_rap_haber,
        SUM(COALESCE(papeleria_utiles_haber, 0)) as papeleria_utiles_haber,
        SUM(COALESCE(alquileres_haber, 0)) as alquileres_haber,
        SUM(COALESCE(combustibles_lubricantes_haber, 0)) as combustibles_lubricantes_haber,
        SUM(COALESCE(seguros_haber, 0)) as seguros_haber,
        SUM(COALESCE(viaticos_gastos_viaje_haber, 0)) as viaticos_gastos_viaje_haber,
        SUM(COALESCE(impuestos_municipales_haber, 0)) as impuestos_municipales_haber,
        SUM(COALESCE(impuestos_estatales_haber, 0)) as impuestos_estatales_haber,
        SUM(COALESCE(honorarios_profesionales_haber, 0)) as honorarios_profesionales_haber,
        SUM(COALESCE(mantenimiento_vehiculos_haber, 0)) as mantenimiento_vehiculos_haber,
        SUM(COALESCE(reparacion_mantenimiento_haber, 0)) as reparacion_mantenimiento_haber,
        SUM(COALESCE(fletes_encomiendas_haber, 0)) as fletes_encomiendas_haber,
        SUM(COALESCE(limpieza_aseo_haber, 0)) as limpieza_aseo_haber,
        SUM(COALESCE(seguridad_vigilancia_haber, 0)) as seguridad_vigilancia_haber,
        SUM(COALESCE(materiales_suministros_haber, 0)) as materiales_suministros_haber,
        SUM(COALESCE(publicidad_propaganda_haber, 0)) as publicidad_propaganda_haber,
        SUM(COALESCE(gastos_bancarios_haber, 0)) as gastos_bancarios_haber,
        SUM(COALESCE(intereses_financieros_haber, 0)) as intereses_financieros_haber,
        SUM(COALESCE(tasa_seguridad_poblacional_haber, 0)) as tasa_seguridad_poblacional_haber,
        SUM(COALESCE(gastos_varios_haber, 0)) as gastos_varios_haber,
        SUM(COALESCE(total_debe, 0)) as total_debe,
        SUM(COALESCE(total_haber, 0)) as total_haber,
        SUM(COALESCE(diferencia, 0)) as diferencia
      FROM consolidaciones_hoteles ch
      LEFT JOIN clientes c ON ch.cliente_id = c.id
      LEFT JOIN users u ON ch.usuario_id = u.id
      ${hotelWhereClause}
      GROUP BY ch.cliente_id, c.nombre_empresa, c.rtn, u.username
      HAVING COUNT(*) > 0
    `;
    
    if (!db.isConnected) {
      await db.init();
    }
    
    const executeQuery = async (query) => {
      const request = db.pool.request();
      for (const [key, value] of Object.entries(params)) {
        if (key === 'year' || key === 'clienteId') {
          request.input(key, require('mssql').Int, value);
        } else if (key === 'startDate' || key === 'endDate') {
          request.input(key, require('mssql').Date, value);
        } else {
          request.input(key, require('mssql').NVarChar(255), value);
        }
      }
      const result = await request.query(query);
      return result.recordset;
    };
    
    const [generalResults, hotelResults] = await Promise.all([
      executeQuery(generalQuery),
      executeQuery(hotelQuery)
    ]);
    
    const allResults = [...generalResults, ...hotelResults];
    res.json(allResults);
    
  } catch (error) {
    console.error('Error obteniendo resúmenes:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
