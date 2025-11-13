const Database = require('./Database');
const sql = require('mssql');

class ConsolidacionHoteles {
    constructor() {
        this.db = new Database();
    }

    // Método helper para ejecutar consultas
    async executeQuery(query, params = {}) {
        if (!this.db.isConnected) {
            await this.db.init();
        }

        const request = this.db.pool.request();
        
        // Agregar parámetros
        for (const [key, value] of Object.entries(params)) {
            request.input(key, this.getSqlType(key, value), value);
        }

        const result = await request.query(query);
        return result.recordset;
    }

    // Método helper para determinar el tipo SQL
    getSqlType(key, value) {
        if (key.includes('id') || key === 'usuario_id' || key === 'cliente_id') {
            return sql.Int;
        }
        if (key.includes('fecha')) {
            return sql.Date;
        }
        if (key.includes('_debe') || key.includes('_haber') || key.includes('total') || key === 'diferencia') {
            return sql.Decimal(18, 2);
        }
        if (typeof value === 'boolean' || key === 'balanceado') {
            return sql.Bit;
        }
        return sql.NVarChar;
    }

    // Crear nueva consolidación de hotel
    async create(consolidacionData) {
        try {
            const {
                cliente_id,
                usuario_id,
                fecha_inicio,
                fecha_fin,
                observaciones = null,
                // Campos DEBE
                caja_bancos_debe = 0,
                ventas_gravadas_15_debe = 0,
                isv_15_ventas_debe = 0,
                ventas_gravadas_18_debe = 0,
                isv_18_ventas_debe = 0,
                ist_4_debe = 0, // Solo hoteles
                ventas_exentas_debe = 0,
                compras_gravadas_15_debe = 0,
                isv_15_compras_debe = 0,
                compras_gravadas_18_debe = 0,
                isv_18_compras_debe = 0,
                compras_exentas_debe = 0,
                ingresos_honorarios_debe = 0,
                sueldos_salarios_debe = 0,
                treceavo_mes_debe = 0,
                catorceavo_mes_debe = 0,
                prestaciones_laborales_debe = 0,
                energia_electrica_debe = 0,
                suministro_agua_debe = 0,
                hondutel_debe = 0,
                servicio_internet_debe = 0,
                ihss_debe = 0,
                aportaciones_infop_debe = 0,
                aportaciones_rap_debe = 0,
                papeleria_utiles_debe = 0,
                alquileres_debe = 0,
                combustibles_lubricantes_debe = 0,
                seguros_debe = 0,
                viaticos_gastos_viaje_debe = 0,
                impuestos_municipales_debe = 0,
                impuestos_estatales_debe = 0,
                honorarios_profesionales_debe = 0,
                mantenimiento_vehiculos_debe = 0,
                reparacion_mantenimiento_debe = 0,
                fletes_encomiendas_debe = 0,
                limpieza_aseo_debe = 0,
                seguridad_vigilancia_debe = 0,
                materiales_suministros_debe = 0,
                publicidad_propaganda_debe = 0,
                gastos_bancarios_debe = 0,
                intereses_financieros_debe = 0,
                tasa_seguridad_poblacional_debe = 0,
                gastos_varios_debe = 0,
                // Campos HABER
                caja_bancos_haber = 0,
                ventas_gravadas_15_haber = 0,
                isv_15_ventas_haber = 0,
                ventas_gravadas_18_haber = 0,
                isv_18_ventas_haber = 0,
                ist_4_haber = 0, // Solo hoteles
                ventas_exentas_haber = 0,
                compras_gravadas_15_haber = 0,
                isv_15_compras_haber = 0,
                compras_gravadas_18_haber = 0,
                isv_18_compras_haber = 0,
                compras_exentas_haber = 0,
                ingresos_honorarios_haber = 0,
                sueldos_salarios_haber = 0,
                treceavo_mes_haber = 0,
                catorceavo_mes_haber = 0,
                prestaciones_laborales_haber = 0,
                energia_electrica_haber = 0,
                suministro_agua_haber = 0,
                hondutel_haber = 0,
                servicio_internet_haber = 0,
                ihss_haber = 0,
                aportaciones_infop_haber = 0,
                aportaciones_rap_haber = 0,
                papeleria_utiles_haber = 0,
                alquileres_haber = 0,
                combustibles_lubricantes_haber = 0,
                seguros_haber = 0,
                viaticos_gastos_viaje_haber = 0,
                impuestos_municipales_haber = 0,
                impuestos_estatales_haber = 0,
                honorarios_profesionales_haber = 0,
                mantenimiento_vehiculos_haber = 0,
                reparacion_mantenimiento_haber = 0,
                fletes_encomiendas_haber = 0,
                limpieza_aseo_haber = 0,
                seguridad_vigilancia_haber = 0,
                materiales_suministros_haber = 0,
                publicidad_propaganda_haber = 0,
                gastos_bancarios_haber = 0,
                intereses_financieros_haber = 0,
                tasa_seguridad_poblacional_haber = 0,
                gastos_varios_haber = 0
            } = consolidacionData;

            // Calcular totales
            const total_debe = (parseFloat(caja_bancos_debe) || 0) + (parseFloat(ventas_gravadas_15_debe) || 0) + (parseFloat(isv_15_ventas_debe) || 0) +
                (parseFloat(ventas_gravadas_18_debe) || 0) + (parseFloat(isv_18_ventas_debe) || 0) + (parseFloat(ist_4_debe) || 0) +
                (parseFloat(ventas_exentas_debe) || 0) + (parseFloat(compras_gravadas_15_debe) || 0) + (parseFloat(isv_15_compras_debe) || 0) +
                (parseFloat(compras_gravadas_18_debe) || 0) + (parseFloat(isv_18_compras_debe) || 0) + (parseFloat(compras_exentas_debe) || 0) +
                (parseFloat(ingresos_honorarios_debe) || 0) + (parseFloat(sueldos_salarios_debe) || 0) + (parseFloat(treceavo_mes_debe) || 0) +
                (parseFloat(catorceavo_mes_debe) || 0) + (parseFloat(prestaciones_laborales_debe) || 0) + (parseFloat(energia_electrica_debe) || 0) +
                (parseFloat(suministro_agua_debe) || 0) + (parseFloat(hondutel_debe) || 0) + (parseFloat(servicio_internet_debe) || 0) +
                (parseFloat(ihss_debe) || 0) + (parseFloat(aportaciones_infop_debe) || 0) + (parseFloat(aportaciones_rap_debe) || 0) +
                (parseFloat(papeleria_utiles_debe) || 0) + (parseFloat(alquileres_debe) || 0) + (parseFloat(combustibles_lubricantes_debe) || 0) +
                (parseFloat(seguros_debe) || 0) + (parseFloat(viaticos_gastos_viaje_debe) || 0) + (parseFloat(impuestos_municipales_debe) || 0) +
                (parseFloat(impuestos_estatales_debe) || 0) + (parseFloat(honorarios_profesionales_debe) || 0) + (parseFloat(mantenimiento_vehiculos_debe) || 0) +
                (parseFloat(reparacion_mantenimiento_debe) || 0) + (parseFloat(fletes_encomiendas_debe) || 0) + (parseFloat(limpieza_aseo_debe) || 0) +
                (parseFloat(seguridad_vigilancia_debe) || 0) + (parseFloat(materiales_suministros_debe) || 0) + (parseFloat(publicidad_propaganda_debe) || 0) +
                (parseFloat(gastos_bancarios_debe) || 0) + (parseFloat(intereses_financieros_debe) || 0) + (parseFloat(tasa_seguridad_poblacional_debe) || 0) +
                (parseFloat(gastos_varios_debe) || 0);

            const total_haber = (parseFloat(caja_bancos_haber) || 0) + (parseFloat(ventas_gravadas_15_haber) || 0) + (parseFloat(isv_15_ventas_haber) || 0) +
                (parseFloat(ventas_gravadas_18_haber) || 0) + (parseFloat(isv_18_ventas_haber) || 0) + (parseFloat(ist_4_haber) || 0) +
                (parseFloat(ventas_exentas_haber) || 0) + (parseFloat(compras_gravadas_15_haber) || 0) + (parseFloat(isv_15_compras_haber) || 0) +
                (parseFloat(compras_gravadas_18_haber) || 0) + (parseFloat(isv_18_compras_haber) || 0) + (parseFloat(compras_exentas_haber) || 0) +
                (parseFloat(ingresos_honorarios_haber) || 0) + (parseFloat(sueldos_salarios_haber) || 0) + (parseFloat(treceavo_mes_haber) || 0) +
                (parseFloat(catorceavo_mes_haber) || 0) + (parseFloat(prestaciones_laborales_haber) || 0) + (parseFloat(energia_electrica_haber) || 0) +
                (parseFloat(suministro_agua_haber) || 0) + (parseFloat(hondutel_haber) || 0) + (parseFloat(servicio_internet_haber) || 0) +
                (parseFloat(ihss_haber) || 0) + (parseFloat(aportaciones_infop_haber) || 0) + (parseFloat(aportaciones_rap_haber) || 0) +
                (parseFloat(papeleria_utiles_haber) || 0) + (parseFloat(alquileres_haber) || 0) + (parseFloat(combustibles_lubricantes_haber) || 0) +
                (parseFloat(seguros_haber) || 0) + (parseFloat(viaticos_gastos_viaje_haber) || 0) + (parseFloat(impuestos_municipales_haber) || 0) +
                (parseFloat(impuestos_estatales_haber) || 0) + (parseFloat(honorarios_profesionales_haber) || 0) + (parseFloat(mantenimiento_vehiculos_haber) || 0) +
                (parseFloat(reparacion_mantenimiento_haber) || 0) + (parseFloat(fletes_encomiendas_haber) || 0) + (parseFloat(limpieza_aseo_haber) || 0) +
                (parseFloat(seguridad_vigilancia_haber) || 0) + (parseFloat(materiales_suministros_haber) || 0) + (parseFloat(publicidad_propaganda_haber) || 0) +
                (parseFloat(gastos_bancarios_haber) || 0) + (parseFloat(intereses_financieros_haber) || 0) + (parseFloat(tasa_seguridad_poblacional_haber) || 0) +
                (parseFloat(gastos_varios_haber) || 0);

            // Validar que los totales sean números válidos
            const validTotalDebe = isNaN(total_debe) || !isFinite(total_debe) ? 0 : parseFloat(total_debe.toFixed(2));
            const validTotalHaber = isNaN(total_haber) || !isFinite(total_haber) ? 0 : parseFloat(total_haber.toFixed(2));
            
            // Calcular diferencia con validación adicional
            let diferencia = validTotalDebe - validTotalHaber;
            diferencia = isNaN(diferencia) || !isFinite(diferencia) ? 0 : parseFloat(diferencia.toFixed(2));
            
            const balanceado = Math.abs(diferencia) < 0.01; // Considerar balanceado si la diferencia es menor a 1 centavo
            
            // Debug logging
            console.log('Valores calculados (hoteles):', {
                total_debe: validTotalDebe,
                total_haber: validTotalHaber,
                diferencia: diferencia,
                balanceado: balanceado
            });

            const query = `
                INSERT INTO consolidaciones_hoteles (
                    cliente_id, usuario_id, fecha_inicio, fecha_fin, observaciones,
                    caja_bancos_debe, ventas_gravadas_15_debe, isv_15_ventas_debe, ventas_gravadas_18_debe, isv_18_ventas_debe,
                    ist_4_debe, ventas_exentas_debe, compras_gravadas_15_debe, isv_15_compras_debe, compras_gravadas_18_debe, 
                    isv_18_compras_debe, compras_exentas_debe, ingresos_honorarios_debe, sueldos_salarios_debe, treceavo_mes_debe, 
                    catorceavo_mes_debe, prestaciones_laborales_debe, energia_electrica_debe, suministro_agua_debe, hondutel_debe, 
                    servicio_internet_debe, ihss_debe, aportaciones_infop_debe, aportaciones_rap_debe, papeleria_utiles_debe, 
                    alquileres_debe, combustibles_lubricantes_debe, seguros_debe, viaticos_gastos_viaje_debe, impuestos_municipales_debe, 
                    impuestos_estatales_debe, honorarios_profesionales_debe, mantenimiento_vehiculos_debe, reparacion_mantenimiento_debe, 
                    fletes_encomiendas_debe, limpieza_aseo_debe, seguridad_vigilancia_debe, materiales_suministros_debe, 
                    publicidad_propaganda_debe, gastos_bancarios_debe, intereses_financieros_debe, tasa_seguridad_poblacional_debe, 
                    gastos_varios_debe,
                    caja_bancos_haber, ventas_gravadas_15_haber, isv_15_ventas_haber, ventas_gravadas_18_haber, isv_18_ventas_haber,
                    ist_4_haber, ventas_exentas_haber, compras_gravadas_15_haber, isv_15_compras_haber, compras_gravadas_18_haber, 
                    isv_18_compras_haber, compras_exentas_haber, ingresos_honorarios_haber, sueldos_salarios_haber, treceavo_mes_haber, 
                    catorceavo_mes_haber, prestaciones_laborales_haber, energia_electrica_haber, suministro_agua_haber, hondutel_haber, 
                    servicio_internet_haber, ihss_haber, aportaciones_infop_haber, aportaciones_rap_haber, papeleria_utiles_haber, 
                    alquileres_haber, combustibles_lubricantes_haber, seguros_haber, viaticos_gastos_viaje_haber, impuestos_municipales_haber, 
                    impuestos_estatales_haber, honorarios_profesionales_haber, mantenimiento_vehiculos_haber, reparacion_mantenimiento_haber, 
                    fletes_encomiendas_haber, limpieza_aseo_haber, seguridad_vigilancia_haber, materiales_suministros_haber, 
                    publicidad_propaganda_haber, gastos_bancarios_haber, intereses_financieros_haber, tasa_seguridad_poblacional_haber, 
                    gastos_varios_haber,
                    total_debe, total_haber, diferencia, balanceado
                )
                OUTPUT INSERTED.id
                VALUES (
                    @cliente_id, @usuario_id, @fecha_inicio, @fecha_fin, @observaciones,
                    @caja_bancos_debe, @ventas_gravadas_15_debe, @isv_15_ventas_debe, @ventas_gravadas_18_debe, @isv_18_ventas_debe,
                    @ist_4_debe, @ventas_exentas_debe, @compras_gravadas_15_debe, @isv_15_compras_debe, @compras_gravadas_18_debe, 
                    @isv_18_compras_debe, @compras_exentas_debe, @ingresos_honorarios_debe, @sueldos_salarios_debe, @treceavo_mes_debe, 
                    @catorceavo_mes_debe, @prestaciones_laborales_debe, @energia_electrica_debe, @suministro_agua_debe, @hondutel_debe, 
                    @servicio_internet_debe, @ihss_debe, @aportaciones_infop_debe, @aportaciones_rap_debe, @papeleria_utiles_debe, 
                    @alquileres_debe, @combustibles_lubricantes_debe, @seguros_debe, @viaticos_gastos_viaje_debe, @impuestos_municipales_debe, 
                    @impuestos_estatales_debe, @honorarios_profesionales_debe, @mantenimiento_vehiculos_debe, @reparacion_mantenimiento_debe, 
                    @fletes_encomiendas_debe, @limpieza_aseo_debe, @seguridad_vigilancia_debe, @materiales_suministros_debe, 
                    @publicidad_propaganda_debe, @gastos_bancarios_debe, @intereses_financieros_debe, @tasa_seguridad_poblacional_debe, 
                    @gastos_varios_debe,
                    @caja_bancos_haber, @ventas_gravadas_15_haber, @isv_15_ventas_haber, @ventas_gravadas_18_haber, @isv_18_ventas_haber,
                    @ist_4_haber, @ventas_exentas_haber, @compras_gravadas_15_haber, @isv_15_compras_haber, @compras_gravadas_18_haber, 
                    @isv_18_compras_haber, @compras_exentas_haber, @ingresos_honorarios_haber, @sueldos_salarios_haber, @treceavo_mes_haber, 
                    @catorceavo_mes_haber, @prestaciones_laborales_haber, @energia_electrica_haber, @suministro_agua_haber, @hondutel_haber, 
                    @servicio_internet_haber, @ihss_haber, @aportaciones_infop_haber, @aportaciones_rap_haber, @papeleria_utiles_haber, 
                    @alquileres_haber, @combustibles_lubricantes_haber, @seguros_haber, @viaticos_gastos_viaje_haber, @impuestos_municipales_haber, 
                    @impuestos_estatales_haber, @honorarios_profesionales_haber, @mantenimiento_vehiculos_haber, @reparacion_mantenimiento_haber, 
                    @fletes_encomiendas_haber, @limpieza_aseo_haber, @seguridad_vigilancia_haber, @materiales_suministros_haber, 
                    @publicidad_propaganda_haber, @gastos_bancarios_haber, @intereses_financieros_haber, @tasa_seguridad_poblacional_haber, 
                    @gastos_varios_haber,
                    @total_debe, @total_haber, @diferencia, @balanceado
                )
            `;

            const params = {
                cliente_id, usuario_id, fecha_inicio, fecha_fin, observaciones,
                // DEBE
                caja_bancos_debe, ventas_gravadas_15_debe, isv_15_ventas_debe, ventas_gravadas_18_debe, isv_18_ventas_debe,
                ist_4_debe, ventas_exentas_debe, compras_gravadas_15_debe, isv_15_compras_debe, compras_gravadas_18_debe,
                isv_18_compras_debe, compras_exentas_debe, ingresos_honorarios_debe, sueldos_salarios_debe, treceavo_mes_debe,
                catorceavo_mes_debe, prestaciones_laborales_debe, energia_electrica_debe, suministro_agua_debe, hondutel_debe,
                servicio_internet_debe, ihss_debe, aportaciones_infop_debe, aportaciones_rap_debe, papeleria_utiles_debe,
                alquileres_debe, combustibles_lubricantes_debe, seguros_debe, viaticos_gastos_viaje_debe, impuestos_municipales_debe,
                impuestos_estatales_debe, honorarios_profesionales_debe, mantenimiento_vehiculos_debe, reparacion_mantenimiento_debe,
                fletes_encomiendas_debe, limpieza_aseo_debe, seguridad_vigilancia_debe, materiales_suministros_debe,
                publicidad_propaganda_debe, gastos_bancarios_debe, intereses_financieros_debe, tasa_seguridad_poblacional_debe,
                gastos_varios_debe,
                // HABER
                caja_bancos_haber, ventas_gravadas_15_haber, isv_15_ventas_haber, ventas_gravadas_18_haber, isv_18_ventas_haber,
                ist_4_haber, ventas_exentas_haber, compras_gravadas_15_haber, isv_15_compras_haber, compras_gravadas_18_haber,
                isv_18_compras_haber, compras_exentas_haber, ingresos_honorarios_haber, sueldos_salarios_haber, treceavo_mes_haber,
                catorceavo_mes_haber, prestaciones_laborales_haber, energia_electrica_haber, suministro_agua_haber, hondutel_haber,
                servicio_internet_haber, ihss_haber, aportaciones_infop_haber, aportaciones_rap_haber, papeleria_utiles_haber,
                alquileres_haber, combustibles_lubricantes_haber, seguros_haber, viaticos_gastos_viaje_haber, impuestos_municipales_haber,
                impuestos_estatales_haber, honorarios_profesionales_haber, mantenimiento_vehiculos_haber, reparacion_mantenimiento_haber,
                fletes_encomiendas_haber, limpieza_aseo_haber, seguridad_vigilancia_haber, materiales_suministros_haber,
                publicidad_propaganda_haber, gastos_bancarios_haber, intereses_financieros_haber, tasa_seguridad_poblacional_haber,
                gastos_varios_haber,
                // TOTALES CALCULADOS
                total_debe: validTotalDebe, total_haber: validTotalHaber, diferencia, balanceado
            };

            const result = await this.executeQuery(query, params);
            return { id: result[0].id, ...consolidacionData };
        } catch (error) {
            console.error('Error creando consolidación de hotel:', error);
            throw error;
        }
    }

    // Obtener todas las consolidaciones de hoteles
    async getAll(filters = {}) {
        try {
            let query = `
                SELECT ch.*, 
                       c.nombre_empresa as cliente_nombre, 
                       c.rtn as cliente_rtn,
                       u.username as usuario_nombre,
                       -- Calcular total DEBE (incluye IST para hoteles)
                       (ch.caja_bancos_debe + ch.ventas_gravadas_15_debe + ch.isv_15_ventas_debe + 
                        ch.ventas_gravadas_18_debe + ch.isv_18_ventas_debe + ch.ist_4_debe + 
                        ch.ventas_exentas_debe + ch.compras_gravadas_15_debe + ch.isv_15_compras_debe + 
                        ch.compras_gravadas_18_debe + ch.isv_18_compras_debe + ch.compras_exentas_debe + 
                        ch.ingresos_honorarios_debe + ch.sueldos_salarios_debe + ch.treceavo_mes_debe + 
                        ch.catorceavo_mes_debe + ch.prestaciones_laborales_debe + ch.energia_electrica_debe + 
                        ch.suministro_agua_debe + ch.hondutel_debe + ch.servicio_internet_debe + ch.ihss_debe + 
                        ch.aportaciones_infop_debe + ch.aportaciones_rap_debe + ch.papeleria_utiles_debe + 
                        ch.alquileres_debe + ch.combustibles_lubricantes_debe + ch.seguros_debe + 
                        ch.viaticos_gastos_viaje_debe + ch.impuestos_municipales_debe + ch.impuestos_estatales_debe + 
                        ch.honorarios_profesionales_debe + ch.mantenimiento_vehiculos_debe + ch.reparacion_mantenimiento_debe + 
                        ch.fletes_encomiendas_debe + ch.limpieza_aseo_debe + ch.seguridad_vigilancia_debe + 
                        ch.materiales_suministros_debe + ch.publicidad_propaganda_debe + ch.gastos_bancarios_debe + 
                        ch.intereses_financieros_debe + ch.tasa_seguridad_poblacional_debe + ch.gastos_varios_debe) as total_debe,
                       -- Calcular total HABER (incluye IST para hoteles)
                       (ch.caja_bancos_haber + ch.ventas_gravadas_15_haber + ch.isv_15_ventas_haber + 
                        ch.ventas_gravadas_18_haber + ch.isv_18_ventas_haber + ch.ist_4_haber + 
                        ch.ventas_exentas_haber + ch.compras_gravadas_15_haber + ch.isv_15_compras_haber + 
                        ch.compras_gravadas_18_haber + ch.isv_18_compras_haber + ch.compras_exentas_haber + 
                        ch.ingresos_honorarios_haber + ch.sueldos_salarios_haber + ch.treceavo_mes_haber + 
                        ch.catorceavo_mes_haber + ch.prestaciones_laborales_haber + ch.energia_electrica_haber + 
                        ch.suministro_agua_haber + ch.hondutel_haber + ch.servicio_internet_haber + ch.ihss_haber + 
                        ch.aportaciones_infop_haber + ch.aportaciones_rap_haber + ch.papeleria_utiles_haber + 
                        ch.alquileres_haber + ch.combustibles_lubricantes_haber + ch.seguros_haber + 
                        ch.viaticos_gastos_viaje_haber + ch.impuestos_municipales_haber + ch.impuestos_estatales_haber + 
                        ch.honorarios_profesionales_haber + ch.mantenimiento_vehiculos_haber + ch.reparacion_mantenimiento_haber + 
                        ch.fletes_encomiendas_haber + ch.limpieza_aseo_haber + ch.seguridad_vigilancia_haber + 
                        ch.materiales_suministros_haber + ch.publicidad_propaganda_haber + ch.gastos_bancarios_haber + 
                        ch.intereses_financieros_haber + ch.tasa_seguridad_poblacional_haber + ch.gastos_varios_haber) as total_haber
                FROM consolidaciones_hoteles ch
                LEFT JOIN clientes c ON ch.cliente_id = c.id
                LEFT JOIN users u ON ch.usuario_id = u.id
                WHERE ch.activo = 1
            `;
            
            const params = {};
            
            if (filters.cliente_id) {
                query += ' AND ch.cliente_id = @cliente_id';
                params.cliente_id = filters.cliente_id;
            }
            
            if (filters.fecha_desde) {
                query += ' AND ch.fecha_inicio >= @fecha_desde';
                params.fecha_desde = filters.fecha_desde;
            }
            
            if (filters.fecha_hasta) {
                query += ' AND ch.fecha_fin <= @fecha_hasta';
                params.fecha_hasta = filters.fecha_hasta;
            }
            
            if (filters.usuario_id) {
                query += ' AND ch.usuario_id = @usuario_id';
                params.usuario_id = filters.usuario_id;
            }
            
            query += ' ORDER BY ch.fecha_creacion DESC';
            
            const results = await this.executeQuery(query, params);
            return results;
        } catch (error) {
            console.error('Error obteniendo consolidaciones de hoteles:', error);
            throw error;
        }
    }

    // Obtener consolidación por ID
    async getById(id) {
        try {
            const query = `
                SELECT ch.*, 
                       c.nombre_empresa as cliente_nombre, 
                       c.rtn as cliente_rtn,
                       u.username as usuario_nombre,
                       -- Calcular total DEBE (incluye IST para hoteles)
                       (ch.caja_bancos_debe + ch.ventas_gravadas_15_debe + ch.isv_15_ventas_debe + 
                        ch.ventas_gravadas_18_debe + ch.isv_18_ventas_debe + ch.ist_4_debe + 
                        ch.ventas_exentas_debe + ch.compras_gravadas_15_debe + ch.isv_15_compras_debe + 
                        ch.compras_gravadas_18_debe + ch.isv_18_compras_debe + ch.compras_exentas_debe + 
                        ch.ingresos_honorarios_debe + ch.sueldos_salarios_debe + ch.treceavo_mes_debe + 
                        ch.catorceavo_mes_debe + ch.prestaciones_laborales_debe + ch.energia_electrica_debe + 
                        ch.suministro_agua_debe + ch.hondutel_debe + ch.servicio_internet_debe + ch.ihss_debe + 
                        ch.aportaciones_infop_debe + ch.aportaciones_rap_debe + ch.papeleria_utiles_debe + 
                        ch.alquileres_debe + ch.combustibles_lubricantes_debe + ch.seguros_debe + 
                        ch.viaticos_gastos_viaje_debe + ch.impuestos_municipales_debe + ch.impuestos_estatales_debe + 
                        ch.honorarios_profesionales_debe + ch.mantenimiento_vehiculos_debe + ch.reparacion_mantenimiento_debe + 
                        ch.fletes_encomiendas_debe + ch.limpieza_aseo_debe + ch.seguridad_vigilancia_debe + 
                        ch.materiales_suministros_debe + ch.publicidad_propaganda_debe + ch.gastos_bancarios_debe + 
                        ch.intereses_financieros_debe + ch.tasa_seguridad_poblacional_debe + ch.gastos_varios_debe) as total_debe,
                       -- Calcular total HABER (incluye IST para hoteles)
                       (ch.caja_bancos_haber + ch.ventas_gravadas_15_haber + ch.isv_15_ventas_haber + 
                        ch.ventas_gravadas_18_haber + ch.isv_18_ventas_haber + ch.ist_4_haber + 
                        ch.ventas_exentas_haber + ch.compras_gravadas_15_haber + ch.isv_15_compras_haber + 
                        ch.compras_gravadas_18_haber + ch.isv_18_compras_haber + ch.compras_exentas_haber + 
                        ch.ingresos_honorarios_haber + ch.sueldos_salarios_haber + ch.treceavo_mes_haber + 
                        ch.catorceavo_mes_haber + ch.prestaciones_laborales_haber + ch.energia_electrica_haber + 
                        ch.suministro_agua_haber + ch.hondutel_haber + ch.servicio_internet_haber + ch.ihss_haber + 
                        ch.aportaciones_infop_haber + ch.aportaciones_rap_haber + ch.papeleria_utiles_haber + 
                        ch.alquileres_haber + ch.combustibles_lubricantes_haber + ch.seguros_haber + 
                        ch.viaticos_gastos_viaje_haber + ch.impuestos_municipales_haber + ch.impuestos_estatales_haber + 
                        ch.honorarios_profesionales_haber + ch.mantenimiento_vehiculos_haber + ch.reparacion_mantenimiento_haber + 
                        ch.fletes_encomiendas_haber + ch.limpieza_aseo_haber + ch.seguridad_vigilancia_haber + 
                        ch.materiales_suministros_haber + ch.publicidad_propaganda_haber + ch.gastos_bancarios_haber + 
                        ch.intereses_financieros_haber + ch.tasa_seguridad_poblacional_haber + ch.gastos_varios_haber) as total_haber
                FROM consolidaciones_hoteles ch
                LEFT JOIN clientes c ON ch.cliente_id = c.id
                LEFT JOIN users u ON ch.usuario_id = u.id
                WHERE ch.id = @id AND ch.activo = 1
            `;
            
            const result = await this.executeQuery(query, { id });
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error obteniendo consolidación de hotel por ID:', error);
            throw error;
        }
    }

    // Actualizar consolidación
    async update(id, consolidacionData) {
        try {
            const fieldsToUpdate = [];
            const params = { id };
            
            // Construir dinámicamente los campos a actualizar
            Object.keys(consolidacionData).forEach(key => {
                if (key !== 'id' && consolidacionData[key] !== undefined) {
                    fieldsToUpdate.push(`${key} = @${key}`);
                    params[key] = consolidacionData[key];
                }
            });
            
            if (fieldsToUpdate.length === 0) {
                throw new Error('No hay campos para actualizar');
            }
            
            const query = `
                UPDATE consolidaciones_hoteles 
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = @id AND activo = 1
            `;
            
            await this.executeQuery(query, params);
            return await this.getById(id);
        } catch (error) {
            console.error('Error actualizando consolidación de hotel:', error);
            throw error;
        }
    }

    // Eliminar consolidación (soft delete)
    async delete(id) {
        try {
            const query = `
                UPDATE consolidaciones_hoteles 
                SET activo = 0, fecha_actualizacion = GETDATE()
                WHERE id = @id
            `;
            
            await this.executeQuery(query, { id });
            return { message: 'Consolidación eliminada exitosamente' };
        } catch (error) {
            console.error('Error eliminando consolidación de hotel:', error);
            throw error;
        }
    }

    // Obtener consolidaciones por cliente
    async getByCliente(clienteId) {
        try {
            return await this.getAll({ cliente_id: clienteId });
        } catch (error) {
            console.error('Error obteniendo consolidaciones de hotel por cliente:', error);
            throw error;
        }
    }

    // Método específico para obtener estadísticas de I.S.T.
    async getISTStatistics(filters = {}) {
        try {
            let query = `
                SELECT 
                    COUNT(*) as total_consolidaciones,
                    SUM(ist_4_debe) as total_ist_debe,
                    SUM(ist_4_haber) as total_ist_haber,
                    AVG(ist_4_haber) as promedio_ist,
                    MAX(ist_4_haber) as maximo_ist,
                    MIN(ist_4_haber) as minimo_ist
                FROM consolidaciones_hoteles 
                WHERE activo = 1
            `;
            
            const params = {};
            
            if (filters.cliente_id) {
                query += ' AND cliente_id = @cliente_id';
                params.cliente_id = filters.cliente_id;
            }
            
            if (filters.fecha_desde) {
                query += ' AND fecha_inicio >= @fecha_desde';
                params.fecha_desde = filters.fecha_desde;
            }
            
            if (filters.fecha_hasta) {
                query += ' AND fecha_fin <= @fecha_hasta';
                params.fecha_hasta = filters.fecha_hasta;
            }
            
            const result = await this.executeQuery(query, params);
            return result[0];
        } catch (error) {
            console.error('Error obteniendo estadísticas de I.S.T.:', error);
            throw error;
        }
    }
}

module.exports = ConsolidacionHoteles;