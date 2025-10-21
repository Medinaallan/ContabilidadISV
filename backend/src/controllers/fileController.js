const multer = require('multer');
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const Database = require('../models/Database');

const db = new Database();

// Configuración de multer para subida de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadsDir = path.join(__dirname, '../../uploads');
    
    // Crear directorio si no existe
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generar nombre único manteniendo la extensión
    const uniqueName = `${Date.now()}_${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

// Filtros para archivos Excel
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos Excel (.xlsx, .xls)'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB por defecto
  }
});

const fileController = {
  // Subir archivo Excel
  uploadFile: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          error: 'No se proporcionó ningún archivo'
        });
      }

      const filePath = req.file.path;
      const fileData = {
        user_id: req.user.id,
        original_name: req.file.originalname,
        filename: req.file.filename,
        filepath: filePath,
        filesize: req.file.size
      };

      // Guardar información del archivo en la base de datos
      const savedFile = await db.saveUploadedFile(fileData);

      // Procesar el archivo Excel
      try {
        await fileController.processExcelFile(savedFile.id, filePath);
      } catch (processError) {
        console.error('Error procesando Excel:', processError);
        // El archivo se guardó pero no se pudo procesar
      }

      // Registrar log
      await db.createLog({
        user_id: req.user.id,
        action: 'FILE_UPLOAD',
        description: `Archivo subido: ${req.file.originalname}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.status(201).json({
        message: 'Archivo subido exitosamente',
        file: {
          id: savedFile.id,
          original_name: savedFile.original_name,
          filename: savedFile.filename,
          filesize: savedFile.filesize,
          upload_date: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Error subiendo archivo:', error);
      
      // Limpiar archivo si hubo error
      if (req.file && req.file.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Procesar archivo Excel y extraer datos
  processExcelFile: async (fileId, filePath) => {
    try {
      // Leer archivo Excel
      const workbook = XLSX.readFile(filePath);
      const sheetNames = workbook.SheetNames;

      for (const sheetName of sheetNames) {
        const sheet = workbook.Sheets[sheetName];
        
        // Convertir hoja a JSON
        const rawData = XLSX.utils.sheet_to_json(sheet, { 
          header: 1,
          defval: '',
          raw: false 
        });

        // Procesar datos y calcular totales
        const processedData = fileController.processSheetData(rawData);
        
        // Guardar datos consolidados
        await db.saveConsolidatedData({
          file_id: fileId,
          sheet_name: sheetName,
          row_data: processedData.rows,
          totals: processedData.totals
        });
      }

    } catch (error) {
      console.error('Error procesando Excel:', error);
      throw error;
    }
  },

  // Procesar datos de la hoja y calcular totales
  processSheetData: (rawData) => {
    const rows = [];
    const totals = {
      totalRows: 0,
      numericColumns: {},
      summary: {}
    };

    if (rawData.length === 0) {
      return { rows, totals };
    }

    // Primera fila como headers
    const headers = rawData[0] || [];
    
    // Procesar filas de datos
    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      if (!row || row.length === 0) continue;

      const rowData = {};
      
      // Mapear datos con headers
      for (let j = 0; j < Math.max(headers.length, row.length); j++) {
        const header = headers[j] || `Columna_${j + 1}`;
        const value = row[j] || '';
        
        rowData[header] = value;
        
        // Si es un número, agregarlo a los totales
        const numValue = parseFloat(value);
        if (!isNaN(numValue) && value !== '') {
          if (!totals.numericColumns[header]) {
            totals.numericColumns[header] = {
              sum: 0,
              count: 0,
              min: numValue,
              max: numValue
            };
          }
          
          totals.numericColumns[header].sum += numValue;
          totals.numericColumns[header].count += 1;
          totals.numericColumns[header].min = Math.min(totals.numericColumns[header].min, numValue);
          totals.numericColumns[header].max = Math.max(totals.numericColumns[header].max, numValue);
        }
      }
      
      rows.push(rowData);
    }

    // Calcular promedios
    Object.keys(totals.numericColumns).forEach(column => {
      const col = totals.numericColumns[column];
      col.average = col.count > 0 ? col.sum / col.count : 0;
    });

    totals.totalRows = rows.length;
    totals.summary = {
      headers: headers,
      totalDataRows: rows.length,
      numericColumnsCount: Object.keys(totals.numericColumns).length
    };

    return { rows, totals };
  },

  // Obtener historial de archivos
  getFileHistory: async (req, res) => {
    try {
      const { userId } = req.query;
      
      // Si el usuario no es admin, solo puede ver sus archivos
      let searchUserId = null;
      if (req.user.role !== 'admin') {
        searchUserId = req.user.id;
      } else if (userId) {
        searchUserId = parseInt(userId);
      }

      const files = await db.getUploadedFiles(searchUserId);

      res.json({
        files: files.map(file => ({
          id: file.id,
          original_name: file.original_name,
          filename: file.filename,
          filesize: file.filesize,
          upload_date: file.upload_date,
          username: file.username
        }))
      });

    } catch (error) {
      console.error('Error obteniendo historial:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Descargar archivo
  downloadFile: async (req, res) => {
    try {
      const { fileId } = req.params;
      
      const file = await db.getFileById(fileId);
      if (!file) {
        return res.status(404).json({
          error: 'Archivo no encontrado'
        });
      }

      // Verificar permisos
      if (req.user.role !== 'admin' && file.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'No tienes permisos para descargar este archivo'
        });
      }

      const filePath = file.filepath;
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          error: 'Archivo físico no encontrado'
        });
      }

      // Registrar log
      await db.createLog({
        user_id: req.user.id,
        action: 'FILE_DOWNLOAD',
        description: `Descarga de archivo: ${file.original_name}`,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.download(filePath, file.original_name, (err) => {
        if (err) {
          console.error('Error en descarga:', err);
          res.status(500).json({
            error: 'Error descargando archivo'
          });
        }
      });

    } catch (error) {
      console.error('Error descargando archivo:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  },

  // Obtener datos consolidados de un archivo
  getConsolidatedData: async (req, res) => {
    try {
      const { fileId } = req.params;
      
      const file = await db.getFileById(fileId);
      if (!file) {
        return res.status(404).json({
          error: 'Archivo no encontrado'
        });
      }

      // Verificar permisos
      if (req.user.role !== 'admin' && file.user_id !== req.user.id) {
        return res.status(403).json({
          error: 'No tienes permisos para ver este archivo'
        });
      }

      const consolidatedData = await db.getConsolidatedData(fileId);

      res.json({
        file: {
          id: file.id,
          original_name: file.original_name,
          upload_date: file.upload_date
        },
        data: consolidatedData
      });

    } catch (error) {
      console.error('Error obteniendo datos consolidados:', error);
      res.status(500).json({
        error: 'Error interno del servidor'
      });
    }
  }
};

// Middleware de multer
fileController.uploadMiddleware = upload.single('excelFile');

module.exports = fileController;