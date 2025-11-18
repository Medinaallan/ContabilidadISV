const Database = require('../models/Database');
const SystemLog = require('../models/SystemLog');
const sql = require('mssql');

const allowedTables = [
  'consolidaciones_generales',
  'consolidaciones_hoteles',
  'clientes',
  'users',
  'system_logs',
  'uploaded_files'
];

const adminController = {
  backupTable: async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Permisos insuficientes' });

      const { table } = req.body;
      if (!table || !allowedTables.includes(table)) {
        return res.status(400).json({ error: 'Tabla no permitida' });
      }

      const db = new Database();
      await db.init();

      const date = new Date();
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      const backupName = `${table}_backup_${y}${m}${d}`;

      const query = `SELECT * INTO dbo.${backupName} FROM dbo.${table};`;

      await db.pool.request().query(query);

      // Contar filas del backup
      const countRes = await db.pool.request().query(`SELECT COUNT(*) AS cnt FROM dbo.${backupName}`);
      const count = countRes.recordset[0]?.cnt || 0;

      // Registrar log
      try {
        const sysLog = new SystemLog();
        await sysLog.create({
          user_id: req.user.id,
          action: 'admin_backup',
          description: `Respaldo de tabla ${table} creado: ${backupName} (${count} filas)`,
          ip_address: req.ip,
          user_agent: req.get('User-Agent')
        });
      } catch (e) {
        console.warn('No se pudo registrar log de backup:', e.message);
      }

      res.json({ success: true, backup: backupName, rows: count });
    } catch (error) {
      console.error('Error en adminController.backupTable:', error);
      res.status(500).json({ error: 'Error realizando respaldo', details: error.message });
    }
  },

  deleteTable: async (req, res) => {
    try {
      if (req.user.role !== 'admin') return res.status(403).json({ error: 'Permisos insuficientes' });

      const { table, backupBefore } = req.body;
      if (!table || !allowedTables.includes(table)) {
        return res.status(400).json({ error: 'Tabla no permitida' });
      }

      const db = new Database();
      await db.init();

      // Si el frontend pidió respaldo previo, crearlo
      let backupName = null;
      if (backupBefore) {
        const date = new Date();
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        backupName = `${table}_backup_${y}${m}${d}`;
        await db.pool.request().query(`SELECT * INTO dbo.${backupName} FROM dbo.${table};`);
      }

      // Ejecutar borrado dentro de transacción
      const transaction = new sql.Transaction(db.pool);
      await transaction.begin();
      try {
        const request = transaction.request();
        const result = await request.query(`DELETE FROM dbo.${table};`);
        await transaction.commit();

        // Registrar log
        try {
          const sysLog = new SystemLog();
          await sysLog.create({
            user_id: req.user.id,
            action: 'admin_delete',
            description: `Eliminación completa de tabla ${table} ${backupName ? `con respaldo ${backupName}` : ''}`,
            ip_address: req.ip,
            user_agent: req.get('User-Agent')
          });
        } catch (e) {
          console.warn('No se pudo registrar log de eliminación:', e.message);
        }

        res.json({ success: true, deleted: true, backup: backupName });
      } catch (err) {
        await transaction.rollback();
        throw err;
      }
    } catch (error) {
      console.error('Error en adminController.deleteTable:', error);
      res.status(500).json({ error: 'Error eliminando registros', details: error.message });
    }
  }
};

module.exports = adminController;
