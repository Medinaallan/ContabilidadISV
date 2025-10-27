const sql = require('mssql');
require('dotenv').config();

class Database {
  constructor() {
    // Configuración de conexión a SQL Server
    this.config = {
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_NAME || 'ContabilidadISV',
      user: process.env.DB_USER, // Si no se especifica, usa Windows Authentication
      password: process.env.DB_PASSWORD,
      options: {
        encrypt: process.env.DB_ENCRYPT === 'true' || false, // Para Azure
        trustServerCertificate: process.env.DB_TRUST_CERT === 'false' ? false : true, // Para desarrollo local
        enableArithAbort: true,
        instanceName: process.env.DB_INSTANCE || 'SQLEXPRESS',
      },
      connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
      requestTimeout: 30000,
    };

    // Si no hay usuario especificado, usar Windows Authentication
    if (!this.config.user) {
      this.config.authentication = {
        type: 'default'
      };
    }

    this.pool = null;
    this.isConnected = false;
  }

  async init() {
    try {
      console.log('Conectando a SQL Server...');
      console.log(`Servidor: ${this.config.server}`);
      console.log(`Base de datos: ${this.config.database}`);
      
      // Crear pool de conexiones
      this.pool = await sql.connect(this.config);
      this.isConnected = true;
      
      console.log('✅ Conectado a SQL Server correctamente');
      
      // Verificar que las tablas existan
      await this.verifyTables();
      
      return true;
    } catch (error) {
      console.error('❌ Error conectando a SQL Server:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async verifyTables() {
    try {
      const result = await this.pool.request().query(`
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        AND TABLE_NAME IN ('users', 'uploaded_files', 'consolidated_data', 'system_logs')
        ORDER BY TABLE_NAME
      `);
      
      const expectedTables = ['consolidated_data', 'system_logs', 'uploaded_files', 'users'];
      const existingTables = result.recordset.map(row => row.TABLE_NAME);
      
      const missingTables = expectedTables.filter(table => !existingTables.includes(table));
      
      if (missingTables.length > 0) {
        console.warn('⚠️  Tablas faltantes:', missingTables.join(', '));
        console.warn('Ejecuta los scripts de instalación de la base de datos');
      } else {
        console.log('✅ Todas las tablas están presentes');
      }
      
    } catch (error) {
      console.error('Error verificando tablas:', error.message);
    }
  }

  // ============================================
  // MÉTODOS PARA USUARIOS
  // ============================================

  async createUser(userData) {
    try {
      const { username, email, password, role = 'user' } = userData;
      
      const result = await this.pool.request()
        .input('username', sql.NVarChar(100), username)
        .input('email', sql.NVarChar(255), email)
        .input('password', sql.NVarChar(255), password)
        .input('role', sql.NVarChar(20), role)
        .query(`
          INSERT INTO users (username, email, password, role) 
          OUTPUT INSERTED.id, INSERTED.username, INSERTED.email, INSERTED.role
          VALUES (@username, @email, @password, @role)
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  async findUserByEmail(email) {
    try {
      console.log('🔍 findUserByEmail called with email:', email);
      console.log('🔍 findUserByEmail - pool status:', this.pool ? 'available' : 'null');
      console.log('🔍 findUserByEmail - isConnected:', this.isConnected);
      
      if (!this.pool || !this.isConnected) {
        console.log('⚠️  Pool no disponible, intentando reconectar...');
        await this.init();
      }
      
      const result = await this.pool.request()
        .input('email', sql.NVarChar(255), email)
        .query('SELECT * FROM users WHERE email = @email');
      
      console.log('📊 Query result recordset length:', result.recordset.length);
      if (result.recordset.length > 0) {
        console.log('👤 Found user with ID:', result.recordset[0].id, 'Email:', result.recordset[0].email);
      }
      
      return result.recordset[0] || null;
    } catch (error) {
      console.error('❌ Error en findUserByEmail:', error.message);
      throw this.handleSqlError(error);
    }
  }

  async findUserById(id) {
    try {
      if (!this.pool || !this.isConnected) {
        console.log('⚠️  Pool no disponible en findUserById, intentando reconectar...');
        await this.init();
      }
      
      const result = await this.pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM users WHERE id = @id');
      
      return result.recordset[0] || null;
    } catch (error) {
      console.error('❌ Error en findUserById:', error.message);
      throw this.handleSqlError(error);
    }
  }

  async getAllUsers() {
    try {
      const result = await this.pool.request()
        .query('SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC');
      
      return result.recordset;
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  async updateUser(id, updateData) {
    try {
      const fields = [];
      const request = this.pool.request();
      
      // Construir la consulta dinámicamente
      for (const [key, value] of Object.entries(updateData)) {
        if (key !== 'id') {
          fields.push(`${key} = @${key}`);
          request.input(key, this.getSqlType(key), value);
        }
      }
      
      if (fields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }
      
      request.input('id', sql.Int, id);
      
      const query = `
        UPDATE users 
        SET ${fields.join(', ')} 
        WHERE id = @id;
        
        SELECT id, username, email, role, created_at, updated_at 
        FROM users 
        WHERE id = @id;
      `;
      
      const result = await request.query(query);
      return result.recordset[0];
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  async deleteUser(id) {
    try {
      const result = await this.pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM users WHERE id = @id; SELECT @@ROWCOUNT as rowsAffected');
      
      return result.recordset[0].rowsAffected > 0;
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  // ============================================
  // MÉTODOS PARA ARCHIVOS
  // ============================================

  async saveUploadedFile(fileData) {
    try {
      const { user_id, original_name, filename, filepath, filesize } = fileData;
      
      const result = await this.pool.request()
        .input('user_id', sql.Int, user_id)
        .input('original_name', sql.NVarChar(255), original_name)
        .input('filename', sql.NVarChar(255), filename)
        .input('filepath', sql.NVarChar(500), filepath)
        .input('filesize', sql.BigInt, filesize)
        .query(`
          INSERT INTO uploaded_files (user_id, original_name, filename, filepath, filesize) 
          OUTPUT INSERTED.*
          VALUES (@user_id, @original_name, @filename, @filepath, @filesize)
        `);
      
      return result.recordset[0];
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  async getUploadedFiles(userId = null) {
    try {
      const request = this.pool.request();
      let query = `
        SELECT uf.*, u.username 
        FROM uploaded_files uf
        JOIN users u ON uf.user_id = u.id
      `;
      
      if (userId) {
        query += ' WHERE uf.user_id = @userId';
        request.input('userId', sql.Int, userId);
      }
      
      query += ' ORDER BY uf.upload_date DESC';
      
      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  async getFileById(id) {
    try {
      const result = await this.pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM uploaded_files WHERE id = @id');
      
      return result.recordset[0] || null;
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  // ============================================
  // MÉTODOS PARA DATOS CONSOLIDADOS
  // ============================================

  async saveConsolidatedData(data) {
    try {
      const { file_id, sheet_name, row_data, totals } = data;
      
      const result = await this.pool.request()
        .input('file_id', sql.Int, file_id)
        .input('sheet_name', sql.NVarChar(100), sheet_name)
        .input('row_data', sql.NVarChar(sql.MAX), JSON.stringify(row_data))
        .input('totals', sql.NVarChar(sql.MAX), JSON.stringify(totals))
        .query(`
          INSERT INTO consolidated_data (file_id, sheet_name, row_data, totals) 
          OUTPUT INSERTED.*
          VALUES (@file_id, @sheet_name, @row_data, @totals)
        `);
      
      const record = result.recordset[0];
      // Parsear JSON para mantener compatibilidad
      record.row_data = JSON.parse(record.row_data);
      record.totals = JSON.parse(record.totals);
      
      return record;
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  async getConsolidatedData(fileId) {
    try {
      const result = await this.pool.request()
        .input('fileId', sql.Int, fileId)
        .query('SELECT * FROM consolidated_data WHERE file_id = @fileId');
      
      // Parsear JSON strings para mantener compatibilidad
      const parsedRows = result.recordset.map(row => ({
        ...row,
        row_data: JSON.parse(row.row_data),
        totals: JSON.parse(row.totals)
      }));
      
      return parsedRows;
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  async getAllTotals() {
    try {
      const result = await this.pool.request()
        .query(`
          SELECT 
            cd.id,
            cd.totals,
            cd.created_at,
            uf.original_name,
            u.username
          FROM consolidated_data cd
          JOIN uploaded_files uf ON cd.file_id = uf.id
          JOIN users u ON uf.user_id = u.id
          ORDER BY cd.created_at DESC
        `);
      
      // Parsear JSON strings
      const parsedRows = result.recordset.map(row => ({
        ...row,
        totals: JSON.parse(row.totals)
      }));
      
      return parsedRows;
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  // ============================================
  // MÉTODOS PARA LOGS
  // ============================================

  async createLog(logData) {
    try {
      if (!this.pool || !this.isConnected) {
        console.log('⚠️  Pool no disponible en createLog, intentando reconectar...');
        await this.init();
      }
      
      const { user_id, action, description, ip_address, user_agent } = logData;
      
      const result = await this.pool.request()
        .input('user_id', sql.Int, user_id)
        .input('action', sql.NVarChar(100), action)
        .input('description', sql.NVarChar(sql.MAX), description)
        .input('ip_address', sql.NVarChar(45), ip_address)
        .input('user_agent', sql.NVarChar(500), user_agent)
        .query(`
          INSERT INTO system_logs (user_id, action, description, ip_address, user_agent) 
          OUTPUT INSERTED.*
          VALUES (@user_id, @action, @description, @ip_address, @user_agent)
        `);
      
      return result.recordset[0];
    } catch (error) {
      console.error('❌ Error en createLog:', error.message);
      throw this.handleSqlError(error);
    }
  }

  async getLogs(limit = 100) {
    try {
      const result = await this.pool.request()
        .input('limit', sql.Int, limit)
        .query(`
          SELECT TOP(@limit)
            sl.*,
            u.username
          FROM system_logs sl
          LEFT JOIN users u ON sl.user_id = u.id
          ORDER BY sl.created_at DESC
        `);
      
      return result.recordset;
    } catch (error) {
      throw this.handleSqlError(error);
    }
  }

  // ============================================
  // MÉTODOS UTILITARIOS
  // ============================================

  getSqlType(fieldName) {
    const typeMap = {
      username: sql.NVarChar(100),
      email: sql.NVarChar(255),
      password: sql.NVarChar(255),
      role: sql.NVarChar(20),
      id: sql.Int
    };
    
    return typeMap[fieldName] || sql.NVarChar(255);
  }

  handleSqlError(error) {
    // Manejar errores específicos de SQL Server
    if (error.number === 2627 || error.number === 2601) {
      // Violación de restricción UNIQUE
      const newError = new Error('Ya existe un registro con esos datos');
      newError.code = 'SQLITE_CONSTRAINT_UNIQUE'; // Mantener compatibilidad
      return newError;
    }
    
    if (error.number === 547) {
      // Violación de clave foránea
      const newError = new Error('Violación de integridad referencial');
      newError.code = 'SQLITE_CONSTRAINT_FOREIGNKEY';
      return newError;
    }
    
    return error;
  }

  async close() {
    try {
      if (this.pool && this.isConnected) {
        await this.pool.close();
        this.isConnected = false;
        console.log('Conexión a SQL Server cerrada');
      }
    } catch (error) {
      console.error('Error cerrando conexión:', error.message);
    }
  }

  // Método para verificar el estado de la conexión
  isConnectionActive() {
    return this.isConnected && this.pool && this.pool.connected;
  }
}

module.exports = Database;