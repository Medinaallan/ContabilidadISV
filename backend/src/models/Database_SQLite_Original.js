const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class Database {
  constructor() {
    const dbDir = path.join(__dirname, '..', 'database');
    
    // Crear directorio si no existe
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    
    const dbPath = path.join(dbDir, 'consolidacion.db');
    this.db = new sqlite3.Database(dbPath);
    this.init();
  }

  init() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Tabla de usuarios
        this.db.run(`
          CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `);

        // Tabla de archivos subidos
        this.db.run(`
          CREATE TABLE IF NOT EXISTS uploaded_files (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            original_name TEXT NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            filesize INTEGER NOT NULL,
            upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `);

        // Tabla de datos consolidados
        this.db.run(`
          CREATE TABLE IF NOT EXISTS consolidated_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_id INTEGER NOT NULL,
            sheet_name TEXT,
            row_data TEXT, -- JSON string
            totals TEXT,   -- JSON string con totales calculados
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (file_id) REFERENCES uploaded_files (id)
          )
        `);

        // Tabla de logs del sistema
        this.db.run(`
          CREATE TABLE IF NOT EXISTS system_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action TEXT NOT NULL,
            description TEXT,
            ip_address TEXT,
            user_agent TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
          )
        `, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
    });
  }

  // Métodos para usuarios
  createUser(userData) {
    return new Promise((resolve, reject) => {
      const { username, email, password, role = 'user' } = userData;
      const sql = `INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)`;
      
      this.db.run(sql, [username, email, password, role], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, username, email, role });
        }
      });
    });
  }

  findUserByEmail(email) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM users WHERE email = ?`;
      this.db.get(sql, [email], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  findUserById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, username, email, role, created_at FROM users WHERE id = ?`;
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Obtener todos los usuarios
  getAllUsers() {
    return new Promise((resolve, reject) => {
      const sql = `SELECT id, username, email, role, created_at, updated_at FROM users ORDER BY created_at DESC`;
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Actualizar usuario
  updateUser(id, updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      for (const [key, value] of Object.entries(updateData)) {
        fields.push(`${key} = ?`);
        values.push(value);
      }
      
      if (fields.length === 0) {
        return reject(new Error('No hay campos para actualizar'));
      }
      
      // Agregar updated_at
      fields.push('updated_at = CURRENT_TIMESTAMP');
      values.push(id);
      
      const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
      
      const db = this.db; // Guardar referencia
      db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          // Obtener el usuario actualizado
          const selectSql = `SELECT id, username, email, role, created_at, updated_at FROM users WHERE id = ?`;
          db.get(selectSql, [id], (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row);
            }
          });
        }
      });
    });
  }

  // Eliminar usuario
  deleteUser(id) {
    return new Promise((resolve, reject) => {
      const sql = `DELETE FROM users WHERE id = ?`;
      this.db.run(sql, [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes });
        }
      });
    });
  }

  // Métodos para archivos
  saveUploadedFile(fileData) {
    return new Promise((resolve, reject) => {
      const { user_id, original_name, filename, filepath, filesize } = fileData;
      const sql = `INSERT INTO uploaded_files (user_id, original_name, filename, filepath, filesize) 
                   VALUES (?, ?, ?, ?, ?)`;
      
      this.db.run(sql, [user_id, original_name, filename, filepath, filesize], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...fileData });
        }
      });
    });
  }

  getUploadedFiles(userId = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          uf.id,
          uf.original_name,
          uf.filename,
          uf.filesize,
          uf.upload_date,
          u.username
        FROM uploaded_files uf
        JOIN users u ON uf.user_id = u.id
      `;
      let params = [];

      if (userId) {
        sql += ` WHERE uf.user_id = ?`;
        params.push(userId);
      }

      sql += ` ORDER BY uf.upload_date DESC`;

      this.db.all(sql, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  getFileById(id) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM uploaded_files WHERE id = ?`;
      this.db.get(sql, [id], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Métodos para datos consolidados
  saveConsolidatedData(data) {
    return new Promise((resolve, reject) => {
      const { file_id, sheet_name, row_data, totals } = data;
      const sql = `INSERT INTO consolidated_data (file_id, sheet_name, row_data, totals) 
                   VALUES (?, ?, ?, ?)`;
      
      this.db.run(sql, [
        file_id, 
        sheet_name, 
        JSON.stringify(row_data), 
        JSON.stringify(totals)
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...data });
        }
      });
    });
  }

  getConsolidatedData(fileId) {
    return new Promise((resolve, reject) => {
      const sql = `SELECT * FROM consolidated_data WHERE file_id = ?`;
      this.db.all(sql, [fileId], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Parsear JSON strings
          const parsedRows = rows.map(row => ({
            ...row,
            row_data: JSON.parse(row.row_data),
            totals: JSON.parse(row.totals)
          }));
          resolve(parsedRows);
        }
      });
    });
  }

  getAllTotals() {
    return new Promise((resolve, reject) => {
      const sql = `
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
      `;
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const parsedRows = rows.map(row => ({
            ...row,
            totals: JSON.parse(row.totals)
          }));
          resolve(parsedRows);
        }
      });
    });
  }

  // Métodos para logs
  createLog(logData) {
    return new Promise((resolve, reject) => {
      const { user_id, action, description, ip_address, user_agent } = logData;
      const sql = `INSERT INTO system_logs (user_id, action, description, ip_address, user_agent) 
                   VALUES (?, ?, ?, ?, ?)`;
      
      this.db.run(sql, [user_id, action, description, ip_address, user_agent], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({ id: this.lastID, ...logData });
        }
      });
    });
  }

  getLogs(limit = 100) {
    return new Promise((resolve, reject) => {
      const sql = `
        SELECT 
          sl.*,
          u.username
        FROM system_logs sl
        LEFT JOIN users u ON sl.user_id = u.id
        ORDER BY sl.created_at DESC
        LIMIT ?
      `;
      
      this.db.all(sql, [limit], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        }
        resolve();
      });
    });
  }
}

module.exports = Database;