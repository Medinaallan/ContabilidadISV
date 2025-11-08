const Database = require('./Database');
const sql = require('mssql');

class SystemLog {
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
        // Parámetros numéricos
        if (key.includes('id') || key === 'user_id' || key === 'limit') {
            return sql.Int;
        }
        // Parámetros de acción
        if (key.includes('action')) {
            return sql.NVarChar(100);
        }
        // Parámetros de texto largo
        if (key.includes('description') || key.includes('user_agent')) {
            return sql.NVarChar(sql.MAX);
        }
        // Parámetros de IP
        if (key.includes('ip_address')) {
            return sql.NVarChar(45);
        }
        // Parámetros de fecha
        if (key.includes('date') || key.includes('_at')) {
            return sql.DateTime;
        }
        // Por defecto, string
        return sql.NVarChar;
    }

    // Crear nuevo log
    async create(logData) {
        try {
            const {
                user_id = null,
                action,
                description,
                ip_address,
                user_agent
            } = logData;

            const query = `
                INSERT INTO system_logs (user_id, action, description, ip_address, user_agent)
                OUTPUT INSERTED.id, INSERTED.user_id, INSERTED.action, INSERTED.description, 
                       INSERTED.ip_address, INSERTED.user_agent, INSERTED.created_at
                VALUES (@user_id, @action, @description, @ip_address, @user_agent)
            `;

            const result = await this.executeQuery(query, {
                user_id,
                action,
                description,
                ip_address,
                user_agent
            });

            return result[0];

        } catch (error) {
            console.error('Error en SystemLog.create:', error);
            throw error;
        }
    }

    // Obtener logs con filtros
    async getLogs(limit = 100, filters = {}) {
        try {
            let query = `
                SELECT 
                    sl.id,
                    sl.user_id,
                    sl.action,
                    sl.description,
                    sl.ip_address,
                    sl.user_agent,
                    sl.created_at,
                    u.username,
                    u.email
                FROM system_logs sl
                LEFT JOIN users u ON sl.user_id = u.id
            `;

            const whereConditions = [];
            const params = {};

            // Aplicar filtros
            if (filters.user_id) {
                whereConditions.push('sl.user_id = @user_id');
                params.user_id = filters.user_id;
            }

            if (filters.action) {
                whereConditions.push('sl.action LIKE @action');
                params.action = `%${filters.action}%`;
            }

            if (filters.from_date) {
                whereConditions.push('sl.created_at >= @from_date');
                params.from_date = filters.from_date;
            }

            if (filters.to_date) {
                whereConditions.push('sl.created_at <= @to_date');
                params.to_date = filters.to_date;
            }

            if (whereConditions.length > 0) {
                query += ` WHERE ${whereConditions.join(' AND ')}`;
            }

            query += ` ORDER BY sl.created_at DESC`;

            if (limit) {
                query += ` OFFSET 0 ROWS FETCH NEXT @limit ROWS ONLY`;
                params.limit = limit;
            }

            const result = await this.executeQuery(query, params);
            return result;

        } catch (error) {
            console.error('Error en SystemLog.getLogs:', error);
            throw error;
        }
    }

    // Obtener log por ID
    async getById(id) {
        try {
            const query = `
                SELECT 
                    sl.id,
                    sl.user_id,
                    sl.action,
                    sl.description,
                    sl.ip_address,
                    sl.user_agent,
                    sl.created_at,
                    u.username,
                    u.email
                FROM system_logs sl
                LEFT JOIN users u ON sl.user_id = u.id
                WHERE sl.id = @id
            `;

            const result = await this.executeQuery(query, { id });
            return result[0] || null;

        } catch (error) {
            console.error('Error en SystemLog.getById:', error);
            throw error;
        }
    }

    // Obtener estadísticas de logs
    async getStatistics(filters = {}) {
        try {
            let baseQuery = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(CASE WHEN CAST(created_at AS DATE) = CAST(GETDATE() AS DATE) THEN 1 END) as today,
                    COUNT(CASE WHEN created_at >= DATEADD(week, -1, GETDATE()) THEN 1 END) as this_week
                FROM system_logs
            `;

            const whereConditions = [];
            const params = {};

            if (filters.user_id) {
                whereConditions.push('user_id = @user_id');
                params.user_id = filters.user_id;
            }

            if (whereConditions.length > 0) {
                baseQuery += ` WHERE ${whereConditions.join(' AND ')}`;
            }

            const basicStats = await this.executeQuery(baseQuery, params);

            // Obtener estadísticas por acción
            let actionQuery = `
                SELECT action, COUNT(*) as count
                FROM system_logs
            `;

            if (whereConditions.length > 0) {
                actionQuery += ` WHERE ${whereConditions.join(' AND ')}`;
            }

            actionQuery += ` GROUP BY action ORDER BY count DESC`;

            const actionStats = await this.executeQuery(actionQuery, params);

            // Obtener estadísticas por usuario
            let userQuery = `
                SELECT 
                    COALESCE(u.username, 'Sistema') as username,
                    COUNT(*) as count
                FROM system_logs sl
                LEFT JOIN users u ON sl.user_id = u.id
            `;

            if (whereConditions.length > 0) {
                userQuery += ` WHERE ${whereConditions.join(' AND ')}`;
            }

            userQuery += ` GROUP BY u.username ORDER BY count DESC`;

            const userStats = await this.executeQuery(userQuery, params);

            return {
                total: basicStats[0].total,
                today: basicStats[0].today,
                thisWeek: basicStats[0].this_week,
                byAction: actionStats.reduce((acc, item) => {
                    acc[item.action] = item.count;
                    return acc;
                }, {}),
                byUser: userStats.reduce((acc, item) => {
                    acc[item.username] = item.count;
                    return acc;
                }, {})
            };

        } catch (error) {
            console.error('Error en SystemLog.getStatistics:', error);
            throw error;
        }
    }

    // Eliminar logs antiguos (mantenimiento)
    async deleteOldLogs(daysToKeep = 90) {
        try {
            const query = `
                DELETE FROM system_logs
                WHERE created_at < DATEADD(day, -@daysToKeep, GETDATE())
            `;

            await this.executeQuery(query, { daysToKeep });
            return { success: true };

        } catch (error) {
            console.error('Error en SystemLog.deleteOldLogs:', error);
            throw error;
        }
    }
}

module.exports = SystemLog;