const Database = require('./Database');
const sql = require('mssql');

class ConsolidacionGenerales {
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
        if (key.includes('_debe') || key.includes('_haber') || key.includes('total')) {
            return sql.Decimal(18, 2);
        }
        if (typeof value === 'boolean') {
            return sql.Bit;
        }
        return sql.NVarChar;
    }

    // Crear nueva consolidación
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

            const query = `
                INSERT INTO consolidaciones_generales (
                    cliente_id, usuario_id, fecha_inicio, fecha_fin, observaciones,
                    caja_bancos_debe, ventas_gravadas_15_debe, isv_15_ventas_debe, ventas_gravadas_18_debe, isv_18_ventas_debe,
                    ventas_exentas_debe, compras_gravadas_15_debe, isv_15_compras_debe, compras_gravadas_18_debe, isv_18_compras_debe,
                    compras_exentas_debe, ingresos_honorarios_debe, sueldos_salarios_debe, treceavo_mes_debe, catorceavo_mes_debe,
                    prestaciones_laborales_debe, energia_electrica_debe, suministro_agua_debe, hondutel_debe, servicio_internet_debe,
                    ihss_debe, aportaciones_infop_debe, aportaciones_rap_debe, papeleria_utiles_debe, alquileres_debe,
                    combustibles_lubricantes_debe, seguros_debe, viaticos_gastos_viaje_debe, impuestos_municipales_debe, impuestos_estatales_debe,
                    honorarios_profesionales_debe, mantenimiento_vehiculos_debe, reparacion_mantenimiento_debe, fletes_encomiendas_debe, limpieza_aseo_debe,
                    seguridad_vigilancia_debe, materiales_suministros_debe, publicidad_propaganda_debe, gastos_bancarios_debe, intereses_financieros_debe,
                    tasa_seguridad_poblacional_debe, gastos_varios_debe,
                    caja_bancos_haber, ventas_gravadas_15_haber, isv_15_ventas_haber, ventas_gravadas_18_haber, isv_18_ventas_haber,
                    ventas_exentas_haber, compras_gravadas_15_haber, isv_15_compras_haber, compras_gravadas_18_haber, isv_18_compras_haber,
                    compras_exentas_haber, ingresos_honorarios_haber, sueldos_salarios_haber, treceavo_mes_haber, catorceavo_mes_haber,
                    prestaciones_laborales_haber, energia_electrica_haber, suministro_agua_haber, hondutel_haber, servicio_internet_haber,
                    ihss_haber, aportaciones_infop_haber, aportaciones_rap_haber, papeleria_utiles_haber, alquileres_haber,
                    combustibles_lubricantes_haber, seguros_haber, viaticos_gastos_viaje_haber, impuestos_municipales_haber, impuestos_estatales_haber,
                    honorarios_profesionales_haber, mantenimiento_vehiculos_haber, reparacion_mantenimiento_haber, fletes_encomiendas_haber, limpieza_aseo_haber,
                    seguridad_vigilancia_haber, materiales_suministros_haber, publicidad_propaganda_haber, gastos_bancarios_haber, intereses_financieros_haber,
                    tasa_seguridad_poblacional_haber, gastos_varios_haber
                )
                OUTPUT INSERTED.id
                VALUES (
                    @cliente_id, @usuario_id, @fecha_inicio, @fecha_fin, @observaciones,
                    @caja_bancos_debe, @ventas_gravadas_15_debe, @isv_15_ventas_debe, @ventas_gravadas_18_debe, @isv_18_ventas_debe,
                    @ventas_exentas_debe, @compras_gravadas_15_debe, @isv_15_compras_debe, @compras_gravadas_18_debe, @isv_18_compras_debe,
                    @compras_exentas_debe, @ingresos_honorarios_debe, @sueldos_salarios_debe, @treceavo_mes_debe, @catorceavo_mes_debe,
                    @prestaciones_laborales_debe, @energia_electrica_debe, @suministro_agua_debe, @hondutel_debe, @servicio_internet_debe,
                    @ihss_debe, @aportaciones_infop_debe, @aportaciones_rap_debe, @papeleria_utiles_debe, @alquileres_debe,
                    @combustibles_lubricantes_debe, @seguros_debe, @viaticos_gastos_viaje_debe, @impuestos_municipales_debe, @impuestos_estatales_debe,
                    @honorarios_profesionales_debe, @mantenimiento_vehiculos_debe, @reparacion_mantenimiento_debe, @fletes_encomiendas_debe, @limpieza_aseo_debe,
                    @seguridad_vigilancia_debe, @materiales_suministros_debe, @publicidad_propaganda_debe, @gastos_bancarios_debe, @intereses_financieros_debe,
                    @tasa_seguridad_poblacional_debe, @gastos_varios_debe,
                    @caja_bancos_haber, @ventas_gravadas_15_haber, @isv_15_ventas_haber, @ventas_gravadas_18_haber, @isv_18_ventas_haber,
                    @ventas_exentas_haber, @compras_gravadas_15_haber, @isv_15_compras_haber, @compras_gravadas_18_haber, @isv_18_compras_haber,
                    @compras_exentas_haber, @ingresos_honorarios_haber, @sueldos_salarios_haber, @treceavo_mes_haber, @catorceavo_mes_haber,
                    @prestaciones_laborales_haber, @energia_electrica_haber, @suministro_agua_haber, @hondutel_haber, @servicio_internet_haber,
                    @ihss_haber, @aportaciones_infop_haber, @aportaciones_rap_haber, @papeleria_utiles_haber, @alquileres_haber,
                    @combustibles_lubricantes_haber, @seguros_haber, @viaticos_gastos_viaje_haber, @impuestos_municipales_haber, @impuestos_estatales_haber,
                    @honorarios_profesionales_haber, @mantenimiento_vehiculos_haber, @reparacion_mantenimiento_haber, @fletes_encomiendas_haber, @limpieza_aseo_haber,
                    @seguridad_vigilancia_haber, @materiales_suministros_haber, @publicidad_propaganda_haber, @gastos_bancarios_haber, @intereses_financieros_haber,
                    @tasa_seguridad_poblacional_haber, @gastos_varios_haber
                )
            `;

            const params = {
                cliente_id, usuario_id, fecha_inicio, fecha_fin, observaciones,
                // DEBE
                caja_bancos_debe, ventas_gravadas_15_debe, isv_15_ventas_debe, ventas_gravadas_18_debe, isv_18_ventas_debe,
                ventas_exentas_debe, compras_gravadas_15_debe, isv_15_compras_debe, compras_gravadas_18_debe, isv_18_compras_debe,
                compras_exentas_debe, ingresos_honorarios_debe, sueldos_salarios_debe, treceavo_mes_debe, catorceavo_mes_debe,
                prestaciones_laborales_debe, energia_electrica_debe, suministro_agua_debe, hondutel_debe, servicio_internet_debe,
                ihss_debe, aportaciones_infop_debe, aportaciones_rap_debe, papeleria_utiles_debe, alquileres_debe,
                combustibles_lubricantes_debe, seguros_debe, viaticos_gastos_viaje_debe, impuestos_municipales_debe, impuestos_estatales_debe,
                honorarios_profesionales_debe, mantenimiento_vehiculos_debe, reparacion_mantenimiento_debe, fletes_encomiendas_debe, limpieza_aseo_debe,
                seguridad_vigilancia_debe, materiales_suministros_debe, publicidad_propaganda_debe, gastos_bancarios_debe, intereses_financieros_debe,
                tasa_seguridad_poblacional_debe, gastos_varios_debe,
                // HABER
                caja_bancos_haber, ventas_gravadas_15_haber, isv_15_ventas_haber, ventas_gravadas_18_haber, isv_18_ventas_haber,
                ventas_exentas_haber, compras_gravadas_15_haber, isv_15_compras_haber, compras_gravadas_18_haber, isv_18_compras_haber,
                compras_exentas_haber, ingresos_honorarios_haber, sueldos_salarios_haber, treceavo_mes_haber, catorceavo_mes_haber,
                prestaciones_laborales_haber, energia_electrica_haber, suministro_agua_haber, hondutel_haber, servicio_internet_haber,
                ihss_haber, aportaciones_infop_haber, aportaciones_rap_haber, papeleria_utiles_haber, alquileres_haber,
                combustibles_lubricantes_haber, seguros_haber, viaticos_gastos_viaje_haber, impuestos_municipales_haber, impuestos_estatales_haber,
                honorarios_profesionales_haber, mantenimiento_vehiculos_haber, reparacion_mantenimiento_haber, fletes_encomiendas_haber, limpieza_aseo_haber,
                seguridad_vigilancia_haber, materiales_suministros_haber, publicidad_propaganda_haber, gastos_bancarios_haber, intereses_financieros_haber,
                tasa_seguridad_poblacional_haber, gastos_varios_haber
            };

            const result = await this.executeQuery(query, params);
            return { id: result[0].id, ...consolidacionData };
        } catch (error) {
            console.error('Error creando consolidación general:', error);
            throw error;
        }
    }

    // Obtener todas las consolidaciones
    async getAll(filters = {}) {
        try {
            let query = `
                SELECT cg.*, c.nombre_empresa as cliente_nombre, u.username as usuario_nombre
                FROM consolidaciones_generales cg
                LEFT JOIN clientes c ON cg.cliente_id = c.id
                LEFT JOIN users u ON cg.usuario_id = u.id
                WHERE cg.activo = 1
            `;
            
            const params = {};
            
            if (filters.cliente_id) {
                query += ' AND cg.cliente_id = @cliente_id';
                params.cliente_id = filters.cliente_id;
            }
            
            if (filters.fecha_desde) {
                query += ' AND cg.fecha_inicio >= @fecha_desde';
                params.fecha_desde = filters.fecha_desde;
            }
            
            if (filters.fecha_hasta) {
                query += ' AND cg.fecha_fin <= @fecha_hasta';
                params.fecha_hasta = filters.fecha_hasta;
            }
            
            query += ' ORDER BY cg.fecha_creacion DESC';
            
            const results = await this.executeQuery(query, params);
            return results;
        } catch (error) {
            console.error('Error obteniendo consolidaciones generales:', error);
            throw error;
        }
    }

    // Obtener consolidación por ID
    async getById(id) {
        try {
            const query = `
                SELECT cg.*, c.nombre_empresa as cliente_nombre, u.username as usuario_nombre
                FROM consolidaciones_generales cg
                LEFT JOIN clientes c ON cg.cliente_id = c.id
                LEFT JOIN users u ON cg.usuario_id = u.id
                WHERE cg.id = @id AND cg.activo = 1
            `;
            
            const result = await this.executeQuery(query, { id });
            return result.length > 0 ? result[0] : null;
        } catch (error) {
            console.error('Error obteniendo consolidación general por ID:', error);
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
                UPDATE consolidaciones_generales 
                SET ${fieldsToUpdate.join(', ')}
                WHERE id = @id AND activo = 1
            `;
            
            await this.executeQuery(query, params);
            return await this.getById(id);
        } catch (error) {
            console.error('Error actualizando consolidación general:', error);
            throw error;
        }
    }

    // Eliminar consolidación (soft delete)
    async delete(id) {
        try {
            const query = `
                UPDATE consolidaciones_generales 
                SET activo = 0, fecha_actualizacion = GETDATE()
                WHERE id = @id
            `;
            
            await this.executeQuery(query, { id });
            return { message: 'Consolidación eliminada exitosamente' };
        } catch (error) {
            console.error('Error eliminando consolidación general:', error);
            throw error;
        }
    }

    // Obtener consolidaciones por cliente
    async getByCliente(clienteId) {
        try {
            return await this.getAll({ cliente_id: clienteId });
        } catch (error) {
            console.error('Error obteniendo consolidaciones por cliente:', error);
            throw error;
        }
    }
}

module.exports = ConsolidacionGenerales;