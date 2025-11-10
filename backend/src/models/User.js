const Database = require('./Database');
const sql = require('mssql');

class User {
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
        if (key.includes('id') || key === 'user_id') {
            return sql.Int;
        }
        if (key.includes('password')) {
            return sql.NVarChar(255);
        }
        if (key.includes('email')) {
            return sql.NVarChar(255);
        }
        return sql.NVarChar;
    }

    // Crear nuevo usuario
    async create(userData) {
        try {
            const {
                username,
                email,
                password,
                role = 'user'
            } = userData;

            // Primero insertar sin OUTPUT
            const insertQuery = `
                INSERT INTO users (username, email, password, role)
                VALUES (@username, @email, @password, @role)
            `;

            await this.executeQuery(insertQuery, {
                username,
                email,
                password,
                role
            });

            // Luego obtener el usuario creado por email (único)
            const selectQuery = `
                SELECT id, username, email, role, created_at, updated_at
                FROM users
                WHERE email = @email
            `;

            const result = await this.executeQuery(selectQuery, { email });
            return result[0];

        } catch (error) {
            console.error('Error en User.create:', error);
            throw error;
        }
    }

    // Obtener todos los usuarios
    async getAll() {
        try {
            const query = `
                SELECT id, username, email, role, created_at, updated_at
                FROM users
                ORDER BY created_at DESC
            `;

            const result = await this.executeQuery(query);
            return result;

        } catch (error) {
            console.error('Error en User.getAll:', error);
            throw error;
        }
    }

    // Obtener usuario por ID
    async getById(id) {
        try {
            const query = `
                SELECT id, username, email, role, created_at, updated_at
                FROM users
                WHERE id = @id
            `;

            const result = await this.executeQuery(query, { id });
            return result[0] || null;

        } catch (error) {
            console.error('Error en User.getById:', error);
            throw error;
        }
    }

    // Obtener usuario por email
    async findByEmail(email) {
        try {
            const query = `
                SELECT id, username, email, password, role, created_at, updated_at
                FROM users
                WHERE email = @email
            `;

            const result = await this.executeQuery(query, { email });
            return result[0] || null;

        } catch (error) {
            console.error('Error en User.findByEmail:', error);
            throw error;
        }
    }

    // Obtener usuario por username
    async findByUsername(username) {
        try {
            const query = `
                SELECT id, username, email, password, role, created_at, updated_at
                FROM users
                WHERE username = @username
            `;

            const result = await this.executeQuery(query, { username });
            return result[0] || null;

        } catch (error) {
            console.error('Error en User.findByUsername:', error);
            throw error;
        }
    }

    // Actualizar usuario
    async update(id, updateData) {
        try {
            const allowedFields = ['username', 'email', 'password', 'role'];
            const updateFields = [];
            const params = { id };

            for (const [key, value] of Object.entries(updateData)) {
                if (allowedFields.includes(key) && value !== undefined) {
                    updateFields.push(`${key} = @${key}`);
                    params[key] = value;
                }
            }

            if (updateFields.length === 0) {
                throw new Error('No hay campos válidos para actualizar');
            }

            // Agregar updated_at
            updateFields.push('updated_at = GETDATE()');

            // Primero actualizar sin OUTPUT
            const updateQuery = `
                UPDATE users
                SET ${updateFields.join(', ')}
                WHERE id = @id
            `;

            await this.executeQuery(updateQuery, params);

            // Luego obtener el usuario actualizado
            const selectQuery = `
                SELECT id, username, email, role, created_at, updated_at
                FROM users
                WHERE id = @id
            `;

            const result = await this.executeQuery(selectQuery, { id });
            return result[0] || null;

        } catch (error) {
            console.error('Error en User.update:', error);
            throw error;
        }
    }

    // Eliminar usuario
    async delete(id) {
        try {
            const query = `
                DELETE FROM users
                WHERE id = @id
            `;

            await this.executeQuery(query, { id });
            return { success: true };

        } catch (error) {
            console.error('Error en User.delete:', error);
            throw error;
        }
    }

    // Verificar si email existe
    async emailExists(email, excludeId = null) {
        try {
            let query = `
                SELECT COUNT(*) as count
                FROM users
                WHERE email = @email
            `;
            const params = { email };

            if (excludeId) {
                query += ` AND id != @excludeId`;
                params.excludeId = excludeId;
            }

            const result = await this.executeQuery(query, params);
            return result[0].count > 0;

        } catch (error) {
            console.error('Error en User.emailExists:', error);
            throw error;
        }
    }

    // Verificar si username existe
    async usernameExists(username, excludeId = null) {
        try {
            let query = `
                SELECT COUNT(*) as count
                FROM users
                WHERE username = @username
            `;
            const params = { username };

            if (excludeId) {
                query += ` AND id != @excludeId`;
                params.excludeId = excludeId;
            }

            const result = await this.executeQuery(query, params);
            return result[0].count > 0;

        } catch (error) {
            console.error('Error en User.usernameExists:', error);
            throw error;
        }
    }
}

module.exports = User;