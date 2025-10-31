const sql = require('mssql');

// Instancia global de la base de datos (singleton)
let dbInstance = null;

class Cliente {
  constructor() {
    if (!dbInstance) {
      const Database = require('./Database_SqlServer');
      dbInstance = new Database();
    }
    this.db = dbInstance;
  }

  // Obtener todos los clientes
  async getAll(activo = null) {
    try {
      // Asegurar que la base de datos esté inicializada
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();
      
      let query = `
        SELECT 
          c.id,
          c.nombre_empresa,
          c.rtn,
          c.rubro,
          c.representante,
          c.telefono,
          c.email,
          c.direccion,
          c.logo_url,
          c.activo,
          c.fecha_registro,
          c.fecha_actualizacion,
          u.username as usuario_creador
        FROM clientes c
        LEFT JOIN users u ON c.usuario_creacion = u.id
      `;

      if (activo !== null) {
        query += ' WHERE c.activo = @activo';
        request.input('activo', sql.Bit, activo);
      }

      query += ' ORDER BY c.nombre_empresa ASC';

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      throw error;
    }
  }

  // Obtener cliente por ID
  async getById(id) {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();
      
      request.input('id', sql.Int, id);
      
      const result = await request.query(`
        SELECT 
          c.id,
          c.nombre_empresa,
          c.rtn,
          c.rubro,
          c.representante,
          c.telefono,
          c.email,
          c.direccion,
          c.logo_url,
          c.activo,
          c.fecha_registro,
          c.fecha_actualizacion,
          u.username as usuario_creador
        FROM clientes c
        LEFT JOIN users u ON c.usuario_creacion = u.id
        WHERE c.id = @id
      `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error obteniendo cliente por ID:', error);
      throw error;
    }
  }

  // Obtener cliente por RTN
  async getByRTN(rtn) {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();
      
      request.input('rtn', sql.VarChar(50), rtn);
      
      const result = await request.query(`
        SELECT 
          c.id,
          c.nombre_empresa,
          c.rtn,
          c.rubro,
          c.representante,
          c.telefono,
          c.email,
          c.direccion,
          c.logo_url,
          c.activo,
          c.fecha_registro,
          c.fecha_actualizacion,
          u.username as usuario_creador
        FROM clientes c
        LEFT JOIN users u ON c.usuario_creacion = u.id
        WHERE c.rtn = @rtn
      `);

      return result.recordset[0] || null;
    } catch (error) {
      console.error('Error obteniendo cliente por RTN:', error);
      throw error;
    }
  }

  // Crear nuevo cliente
  async create(clienteData) {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();

      // Validar que el RTN no exista
      const existingClient = await this.getByRTN(clienteData.rtn);
      if (existingClient) {
        throw new Error('Ya existe un cliente con este RTN');
      }

      request.input('nombre_empresa', sql.NVarChar(255), clienteData.nombre_empresa);
      request.input('rtn', sql.NVarChar(50), clienteData.rtn);
      request.input('rubro', sql.NVarChar(100), clienteData.rubro);
      request.input('representante', sql.NVarChar(255), clienteData.representante);
      request.input('telefono', sql.NVarChar(20), clienteData.telefono);
      request.input('email', sql.NVarChar(255), clienteData.email);
      request.input('direccion', sql.NVarChar(500), clienteData.direccion);
      request.input('logo_url', sql.NVarChar(500), clienteData.logo_url || null);
      request.input('usuario_creacion', sql.Int, clienteData.usuario_creacion);

      const result = await request.query(`
        INSERT INTO clientes (
          nombre_empresa, rtn, rubro, representante, telefono, 
          email, direccion, logo_url, usuario_creacion
        )
        OUTPUT INSERTED.id
        VALUES (
          @nombre_empresa, @rtn, @rubro, @representante, @telefono,
          @email, @direccion, @logo_url, @usuario_creacion
        )
      `);

      const newId = result.recordset[0].id;
      return await this.getById(newId);
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  }

  // Actualizar cliente
  async update(id, clienteData) {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();

      // Verificar que el cliente existe
      const existingClient = await this.getById(id);
      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      // Si se está actualizando el RTN, verificar que no exista otro cliente con ese RTN
      if (clienteData.rtn && clienteData.rtn !== existingClient.rtn) {
        const clientWithRTN = await this.getByRTN(clienteData.rtn);
        if (clientWithRTN && clientWithRTN.id !== id) {
          throw new Error('Ya existe otro cliente con este RTN');
        }
      }

      // Construir query dinámicamente solo con los campos que se van a actualizar
      const updateFields = [];
      const fieldsMap = {
        nombre_empresa: { type: sql.NVarChar(255), value: clienteData.nombre_empresa },
        rtn: { type: sql.NVarChar(50), value: clienteData.rtn },
        rubro: { type: sql.NVarChar(100), value: clienteData.rubro },
        representante: { type: sql.NVarChar(255), value: clienteData.representante },
        telefono: { type: sql.NVarChar(20), value: clienteData.telefono },
        email: { type: sql.NVarChar(255), value: clienteData.email },
        direccion: { type: sql.NVarChar(500), value: clienteData.direccion },
        logo_url: { type: sql.NVarChar(500), value: clienteData.logo_url },
        activo: { type: sql.Bit, value: clienteData.activo }
      };

      for (const [field, config] of Object.entries(fieldsMap)) {
        if (config.value !== undefined) {
          updateFields.push(`${field} = @${field}`);
          request.input(field, config.type, config.value);
        }
      }

      if (updateFields.length === 0) {
        throw new Error('No hay campos para actualizar');
      }

      request.input('id', sql.Int, id);

      await request.query(`
        UPDATE clientes 
        SET ${updateFields.join(', ')}
        WHERE id = @id
      `);

      return await this.getById(id);
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      throw error;
    }
  }

  // Eliminar cliente (soft delete)
  async delete(id) {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();

      // Verificar que el cliente existe
      const existingClient = await this.getById(id);
      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      request.input('id', sql.Int, id);

      await request.query(`
        UPDATE clientes 
        SET activo = 0
        WHERE id = @id
      `);

      return { message: 'Cliente desactivado correctamente' };
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      throw error;
    }
  }

  // Eliminar cliente permanentemente (hard delete)
  async deleteHard(id) {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();

      // Verificar que el cliente existe
      const existingClient = await this.getById(id);
      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      request.input('id', sql.Int, id);

      await request.query(`
        DELETE FROM clientes 
        WHERE id = @id
      `);

      return { message: 'Cliente eliminado permanentemente' };
    } catch (error) {
      console.error('Error eliminando cliente permanentemente:', error);
      throw error;
    }
  }

  // Buscar clientes
  async search(searchTerm, activo = null) {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();

      let query = `
        SELECT 
          c.id,
          c.nombre_empresa,
          c.rtn,
          c.rubro,
          c.representante,
          c.telefono,
          c.email,
          c.direccion,
          c.logo_url,
          c.activo,
          c.fecha_registro,
          c.fecha_actualizacion,
          u.username as usuario_creador
        FROM clientes c
        LEFT JOIN users u ON c.usuario_creacion = u.id
        WHERE (
          c.nombre_empresa LIKE @searchTerm OR
          c.rtn LIKE @searchTerm OR
          c.rubro LIKE @searchTerm OR
          c.representante LIKE @searchTerm OR
          c.email LIKE @searchTerm
        )
      `;

      if (activo !== null) {
        query += ' AND c.activo = @activo';
        request.input('activo', sql.Bit, activo);
      }

      query += ' ORDER BY c.nombre_empresa ASC';

      request.input('searchTerm', sql.NVarChar(255), `%${searchTerm}%`);

      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      console.error('Error buscando clientes:', error);
      throw error;
    }
  }

  // Cambiar estado del cliente
  async toggleStatus(id) {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();

      // Verificar que el cliente existe
      const existingClient = await this.getById(id);
      if (!existingClient) {
        throw new Error('Cliente no encontrado');
      }

      request.input('id', sql.Int, id);
      request.input('newStatus', sql.Bit, !existingClient.activo);

      await request.query(`
        UPDATE clientes 
        SET activo = @newStatus
        WHERE id = @id
      `);

      return await this.getById(id);
    } catch (error) {
      console.error('Error cambiando estado del cliente:', error);
      throw error;
    }
  }

  // Obtener estadísticas de clientes
  async getStats() {
    try {
      if (!this.db.isConnected) {
        await this.db.init();
      }
      
      const request = this.db.pool.request();

      const result = await request.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN activo = 1 THEN 1 ELSE 0 END) as activos,
          SUM(CASE WHEN activo = 0 THEN 1 ELSE 0 END) as inactivos,
          COUNT(DISTINCT rubro) as rubros_diferentes
        FROM clientes
      `);

      return result.recordset[0];
    } catch (error) {
      console.error('Error obteniendo estadísticas de clientes:', error);
      throw error;
    }
  }
}

module.exports = Cliente;