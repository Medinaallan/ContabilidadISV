# Guía de Instalación - Sistema de Consolidación Contable

## 📋 Requisitos del Sistema

### Requisitos Mínimos
- **Sistema Operativo:** Windows 10/11, macOS 10.15+, o Linux Ubuntu 18.04+
- **RAM:** 4GB mínimo (8GB recomendado)
- **Espacio en disco:** 2GB disponibles
- **Red:** Conexión a internet para instalación inicial

### Software Requerido
- **Node.js** versión 16 o superior
  - Descargar desde: https://nodejs.org/
  - Incluye npm (Node Package Manager)

## 🚀 Instalación Paso a Paso

### 1. Descargar el Proyecto
```bash
# Si tienes git instalado:
git clone [URL_DEL_REPOSITORIO]

# O descarga el archivo ZIP y extráelo
```

### 2. Instalación Automática (Recomendado)

#### En Windows:
1. Haz doble clic en `iniciar-aplicacion.bat`
2. El script instalará dependencias e iniciará la aplicación automáticamente

#### En Linux/Mac:
```bash
# Dar permisos de ejecución
chmod +x iniciar-aplicacion.sh

# Ejecutar
./iniciar-aplicacion.sh
```

### 3. Instalación Manual

#### Backend:
```bash
# Navegar al directorio del backend
cd backend

# Instalar dependencias
npm install

# Inicializar base de datos
npm run init-db

# Iniciar servidor
npm start
```

#### Frontend:
```bash
# En otra terminal, navegar al directorio del frontend
cd frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

## 🌐 Configuración de Red Local

### Para acceso desde múltiples computadoras:

1. **Identifica la IP del servidor principal:**
   ```bash
   # En Windows
   ipconfig
   
   # En Linux/Mac
   ifconfig
   ```

2. **Configura el firewall:**
   - **Windows:** Permitir las aplicaciones Node.js en el firewall
   - **Linux/Mac:** Configurar iptables o usar ufw

3. **Accede desde otras computadoras:**
   - Reemplaza `localhost` con la IP del servidor
   - Ejemplo: `http://192.168.1.100:5173`

## 🔧 Configuración de Variables de Entorno

### Backend (.env):
```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# JWT
JWT_SECRET=tu_clave_secreta_super_segura_cambiar_en_produccion_2024
JWT_EXPIRES_IN=7d

# Base de datos
DB_PATH=./database/consolidacion.db

# Archivos
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env):
```env
VITE_API_URL=http://localhost:3001/api
```

## 👤 Usuario por Defecto

**Email:** admin@contabilidad.com  
**Contraseña:** admin123

> ⚠️ **Importante:** Cambia esta contraseña después del primer login en producción.

## 🔍 Verificación de Instalación

### Comprobar que todo funciona:

1. **Backend activo:**
   - Visita: `http://localhost:3001/api/health`
   - Deberías ver: `{"status":"OK",...}`

2. **Frontend activo:**
   - Visita: `http://localhost:5173`
   - Deberías ver la pantalla de login

3. **Base de datos:**
   - Se crea automáticamente en: `backend/database/consolidacion.db`

## 🚨 Solución de Problemas Comunes

### Error: "Cannot find module"
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

### Error: "Port already in use"
```bash
# Cambiar puertos en los archivos .env
# Backend: PORT=3002
# Frontend: modifica vite.config.ts
```

### Error: "Permission denied" (Linux/Mac)
```bash
# Dar permisos a los scripts
sudo chown -R $USER:$USER .
chmod +x iniciar-aplicacion.sh
```

### Error de conexión a la base de datos
```bash
# Reinicializar la base de datos
cd backend
npm run init-db
```

## 📱 Scripts Disponibles

### Backend:
- `npm start` - Iniciar servidor de producción
- `npm run dev` - Iniciar servidor de desarrollo
- `npm run init-db` - Inicializar base de datos

### Frontend:
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Compilar para producción
- `npm run preview` - Vista previa de producción

## 🔄 Actualización

Para actualizar el sistema:

1. **Detener la aplicación**
2. **Hacer backup de la base de datos:**
   ```bash
   cp backend/database/consolidacion.db backup-fecha.db
   ```
3. **Actualizar código**
4. **Reinstalar dependencias:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
5. **Reiniciar aplicación**

## 📞 Soporte

Si encuentras problemas durante la instalación:

1. Revisa los logs en las consolas del backend y frontend
2. Verifica que Node.js esté correctamente instalado
3. Asegúrate de que los puertos 3001 y 5173 estén disponibles
4. Comprueba la configuración del firewall

## 📁 Estructura de Archivos

```
consolidacion-contable/
├── backend/                 # Servidor Node.js
│   ├── src/
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── middleware/      # Middleware Express
│   │   ├── models/         # Modelos de datos
│   │   └── routes/         # Rutas de la API
│   ├── database/           # Base de datos SQLite
│   ├── uploads/           # Archivos subidos
│   └── server.js          # Punto de entrada
├── frontend/               # Aplicación React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   └── types/         # Tipos TypeScript
│   └── public/            # Archivos estáticos
└── iniciar-aplicacion.*   # Scripts de inicio
```