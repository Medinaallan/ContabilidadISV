# Migración a SQL Server 2022 Express - Sistema de Consolidación Contable

## 📋 Información de la Instalación SQL Server

**Configuración detectada:**
- **Instancia:** `SQLEXPRESS` 
- **Servidor:** `localhost\SQLEXPRESS`
- **Cadena de conexión:** `Server=localhost\SQLEXPRESS;Database=master;Trusted_Connection=True;`
- **Administrador SQL:** `DESKTOP-Q5R38VM\New User`
- **Características:** `SQLENGINE`
- **Versión:** SQL Server 2022 Express Edition

## 🚀 Instalación Automática (Recomendada)

### Opción 1: Instalación Completa Automática
```cmd
# Desde la raíz del proyecto
instalar_sistema_completo.bat
```

Este script realiza todo el proceso automáticamente:
1. ✅ Verifica dependencias (Node.js, npm, sqlcmd)
2. ✅ Instala paquetes de Node.js (backend y frontend) 
3. ✅ Crea la base de datos SQL Server
4. ✅ Inicializa tablas y datos
5. ✅ Configura el sistema para usar SQL Server

### Opción 2: Solo Base de Datos
```cmd
# Solo instalar la base de datos
cd database\sqlserver
instalar_base_datos.bat
```

## 🛠️ Instalación Manual (Paso a Paso)

### Paso 1: Verificar SQL Server
```sql
-- Verificar que SQL Server esté funcionando
sqlcmd -S "localhost\SQLEXPRESS" -E -Q "SELECT @@VERSION"
```

### Paso 2: Crear Base de Datos
```cmd
# Opción A: Script completo
sqlcmd -S "localhost\SQLEXPRESS" -E -i "database\sqlserver\00_install_complete.sql"

# Opción B: Scripts por separado
sqlcmd -S "localhost\SQLEXPRESS" -E -i "database\sqlserver\01_create_database.sql"
sqlcmd -S "localhost\SQLEXPRESS" -E -i "database\sqlserver\02_create_tables.sql"  
sqlcmd -S "localhost\SQLEXPRESS" -E -i "database\sqlserver\03_initial_data.sql"
```

### Paso 3: Instalar Dependencias de Node.js
```cmd
# Backend
cd backend
npm install

# Frontend  
cd frontend
npm install
```

### Paso 4: Configurar Variables de Entorno
```cmd
# Copiar configuración de SQL Server
copy backend\.env.sqlserver backend\.env
```

### Paso 5: Inicializar Sistema Node.js
```cmd
cd backend
node scripts\initSqlServerDatabase.js
```

## 📊 Estructura de Base de Datos

### Tablas Creadas:

1. **`users`** - Usuarios del sistema
   - `id` (INT, PK, IDENTITY)
   - `username` (NVARCHAR(100), UNIQUE)
   - `email` (NVARCHAR(255), UNIQUE) 
   - `password` (NVARCHAR(255))
   - `role` (NVARCHAR(20), DEFAULT 'user')
   - `created_at`, `updated_at` (DATETIME2)

2. **`uploaded_files`** - Archivos Excel subidos
   - `id` (INT, PK, IDENTITY)
   - `user_id` (FK → users.id)
   - `original_name`, `filename`, `filepath`
   - `filesize` (BIGINT)
   - `upload_date` (DATETIME2)

3. **`consolidated_data`** - Datos procesados
   - `id` (INT, PK, IDENTITY)
   - `file_id` (FK → uploaded_files.id)
   - `sheet_name` (NVARCHAR(100))
   - `row_data` (NVARCHAR(MAX)) - JSON
   - `totals` (NVARCHAR(MAX)) - JSON
   - `created_at` (DATETIME2)

4. **`system_logs`** - Logs de auditoría
   - `id` (INT, PK, IDENTITY)
   - `user_id` (FK → users.id)
   - `action`, `description`
   - `ip_address`, `user_agent`
   - `created_at` (DATETIME2)

### Índices Creados:
- `IX_users_email`, `IX_users_username`
- `IX_uploaded_files_user_id`, `IX_uploaded_files_upload_date`
- `IX_consolidated_data_file_id`
- `IX_system_logs_user_id`, `IX_system_logs_created_at`

### Triggers:
- `tr_users_updated_at` - Actualiza `updated_at` automáticamente

## 🔑 Credenciales por Defecto

**Usuario Administrador:**
- **Email:** `admin@contabilidad.com`
- **Contraseña:** `admin123`
- **Rol:** `admin`

> ⚠️ **IMPORTANTE:** Cambia esta contraseña después del primer login en producción.

## 🌐 Configuración de Conexión

### Variables de Entorno (.env)
```env
# SQL Server Configuration
DB_SERVER=localhost\SQLEXPRESS
DB_NAME=ContabilidadISV
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

### Cadena de Conexión Completa
```
Server=localhost\SQLEXPRESS;Database=ContabilidadISV;Trusted_Connection=True;TrustServerCertificate=True;
```

## 🚦 Iniciar la Aplicación

### Después de la Instalación:
```cmd
# Opción 1: Script de inicio simple
iniciar-aplicacion-simple.bat

# Opción 2: Comando npm desde la raíz
npm run dev

# Opción 3: Servicios por separado
cd backend && npm run dev    # Puerto 3002
cd frontend && npm run dev   # Puerto 5174
```

### URLs de Acceso:
- **Frontend:** http://localhost:5174
- **Backend API:** http://localhost:3002/api
- **Health Check:** http://localhost:3002/api/health

## 🔧 Solución de Problemas

### Error: "No se puede conectar a SQL Server"
1. Verifica que SQL Server Express esté instalado
2. Verifica que el servicio esté ejecutándose:
   ```cmd
   services.msc
   # Buscar: "SQL Server (SQLEXPRESS)" 
   # Estado: Ejecutándose
   ```
3. Verifica la configuración de red de SQL Server

### Error: "sqlcmd no encontrado"
Instala SQL Server Command Line Tools:
- Download: https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility
- O agrega sqlcmd al PATH del sistema

### Error: "Base de datos no existe"
Ejecuta primero la instalación de la base de datos:
```cmd
database\sqlserver\instalar_base_datos.bat
```

### Error: "Dependencias no instaladas"  
```cmd
# Instalar dependencias
cd backend && npm install
cd frontend && npm install
```

## 📝 Cambios Realizados

### Archivos Modificados:
1. ✅ `backend/package.json` - Agregada dependencia `mssql`
2. ✅ `backend/.env.sqlserver` - Nueva configuración SQL Server

### Archivos Creados:
1. ✅ `backend/src/models/Database_SqlServer.js` - Nuevo modelo para SQL Server
2. ✅ `backend/scripts/initSqlServerDatabase.js` - Script de inicialización
3. ✅ `database/sqlserver/` - Scripts SQL completos
4. ✅ `instalar_sistema_completo.bat` - Instalador automático

### Archivos Originales (Preservados):
- ✅ `backend/src/models/Database.js` - Modelo SQLite original (como backup)
- ✅ `backend/.env.example` - Configuración original

## 🔄 Migración de Datos

Si tienes datos existentes en SQLite, puedes migrarlos con:
```cmd
# TODO: Script de migración SQLite → SQL Server
# (Próxima implementación si es necesario)
```

## ✅ Verificación de la Instalación

Ejecuta estos comandos para verificar que todo esté funcionando:

```cmd
# Verificar conexión a SQL Server
sqlcmd -S "localhost\SQLEXPRESS" -E -Q "SELECT COUNT(*) as TablesCount FROM ContabilidadISV.INFORMATION_SCHEMA.TABLES"

# Verificar usuario administrador
sqlcmd -S "localhost\SQLEXPRESS" -E -d "ContabilidadISV" -Q "SELECT username, email, role FROM users WHERE email='admin@contabilidad.com'"

# Iniciar sistema
npm run dev
```

## 🎯 Próximos Pasos

Después de completar la instalación:

1. ✅ **Cambiar contraseña de admin** en primer login
2. ✅ **Probar carga de archivos** Excel
3. ✅ **Verificar generación de reportes**  
4. ✅ **Revisar logs del sistema**
5. ✅ **Configurar respaldos automáticos** (recomendado para producción)