const Database = require('../models/Database');

class ReportsController {
  
  // Obtener métricas de consolidaciones
  async getMetrics(req, res) {
    try {
      const { year, clienteId } = req.query;
      
      let whereConditions = ['cg.activo = 1', 'ch.activo = 1'];
      let params = {};
      
      // Filtro por año
      if (year && year !== 'todos') {
        whereConditions.push('YEAR(cg.fecha_creacion) = @year');
        whereConditions.push('YEAR(ch.fecha_creacion) = @year');
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
      
      const result = await Database.executeQuery(query, params);
      
      const metrics = {
        consolidacionesGenerales: result[0].consolidacionesGenerales,
        consolidacionesHoteles: result[0].consolidacionesHoteles,
        totalConsolidaciones: result[0].consolidacionesGenerales + result[0].consolidacionesHoteles
      };
      
      res.json(metrics);
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  
  // Obtener ranking de clientes
  async getRanking(req, res) {
    try {
      const { year } = req.query;
      
      let whereCondition = '';
      let params = {};
      
      if (year && year !== 'todos') {
        whereCondition = `WHERE YEAR(cg.fecha_creacion) = @year OR YEAR(ch.fecha_creacion) = @year`;
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
            WHERE cg.activo = 1 ${year && year !== 'todos' ? 'AND YEAR(cg.fecha_creacion) = @year' : ''}
            GROUP BY cliente_id
          ) cg_count ON c.id = cg_count.cliente_id
          LEFT JOIN (
            SELECT cliente_id, COUNT(*) as total 
            FROM consolidaciones_hoteles ch
            WHERE ch.activo = 1 ${year && year !== 'todos' ? 'AND YEAR(ch.fecha_creacion) = @year' : ''}
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
      
      const result = await Database.executeQuery(query, params);
      res.json(result);
    } catch (error) {
      console.error('Error obteniendo ranking:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
  
  // Obtener resúmenes por cliente
  async getSummaries(req, res) {
    try {
      const { year, clienteId } = req.query;
      
      let whereConditions = [];
      let params = {};
      
      // Filtro por año
      if (year && year !== 'todos') {
        whereConditions.push('YEAR(fecha_creacion) = @year');
        params.year = parseInt(year);
      }
      
      // Filtro por cliente
      if (clienteId && clienteId !== 'todos') {
        whereConditions.push('cliente_id = @clienteId');
        params.clienteId = parseInt(clienteId);
      }
      
      whereConditions.push('activo = 1');
      const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';
      
      // Consulta para consolidaciones generales
      const generalQuery = `
        SELECT 
          cliente_id,
          c.nombre_empresa as cliente_nombre,
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
        ${whereClause}
        GROUP BY cliente_id, c.nombre_empresa
        HAVING COUNT(*) > 0
      `;
      
      // Consulta para consolidaciones de hoteles (similar pero con ist_4)
      const hotelQuery = `
        SELECT 
          cliente_id,
          c.nombre_empresa as cliente_nombre,
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
        ${whereClause}
        GROUP BY cliente_id, c.nombre_empresa
        HAVING COUNT(*) > 0
      `;
      
      const [generalResults, hotelResults] = await Promise.all([
        Database.executeQuery(generalQuery, params),
        Database.executeQuery(hotelQuery, params)
      ]);
      
      const allResults = [...generalResults, ...hotelResults];
      res.json(allResults);
      
    } catch (error) {
      console.error('Error obteniendo resúmenes:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
}

module.exports = new ReportsController();
