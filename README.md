# Sistema de Consolidación Contable

Una plataforma web completa para el control de versiones y consolidaciones contables desarrollada para agencias de contabilidad.

![Sistema de Consolidación Contable](https://img.shields.io/badge/Version-1.0.0-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![React](https://img.shields.io/badge/React-18+-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6)

## 🚀 Tecnologías Utilizadas

- **Backend:** Node.js + Express + JWT + SQLite
- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Base de Datos:** SQLite (local)
- **API:** REST

## 📁 Estructura del Proyecto

```
consolidacion-contable/
├── backend/                    # Servidor Node.js
│   ├── src/
│   │   ├── controllers/        # Lógica de negocio
│   │   ├── middleware/         # Middleware Express
│   │   ├── models/            # Modelos de datos (SQLite)
│   │   └── routes/            # Rutas de la API
│   ├── database/              # Base de datos SQLite
│   ├── uploads/               # Archivos Excel subidos
│   ├── scripts/               # Scripts de inicialización
│   └── server.js              # Punto de entrada del servidor
├── frontend/                   # Aplicación React
│   ├── src/
│   │   ├── components/        # Componentes React reutilizables
│   │   ├── pages/            # Páginas principales (Login, Dashboard)
│   │   ├── services/         # Servicios API y utilidades
│   │   ├── contexts/         # Contextos de React (Auth)
│   │   └── types/            # Definiciones de tipos TypeScript
│   ├── public/               # Archivos estáticos
│   └── vite.config.ts        # Configuración de Vite
├── iniciar-aplicacion.bat      # Script de inicio para Windows
├── iniciar-aplicacion.sh       # Script de inicio para Linux/Mac
├── INSTALACION.md             # Guía detallada de instalación
├── MANUAL-USUARIO.md          # Manual completo de usuario
└── README.md                  # Este archivo
```

## 🛠️ Instalación Rápida

### Método 1: Instalación Automática (Recomendado)

#### En Windows:
1. Haz doble clic en `iniciar-aplicacion.bat`
2. El script se encarga de todo automáticamente

#### En Linux/Mac:
```bash
chmod +x iniciar-aplicacion.sh
./iniciar-aplicacion.sh
```

### Método 2: Instalación Manual

#### 1. Requisitos Previos
- Node.js v16 o superior
- npm (incluido con Node.js)

#### 2. Backend
```bash
cd backend
npm install
npm run init-db
npm start
```

#### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

## 🌐 Acceso al Sistema

### Local
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3001/api

### Red Local
- **Frontend:** http://[IP-SERVIDOR]:5173
- **Backend API:** http://[IP-SERVIDOR]:3001/api

### Usuario por Defecto
- **Email:** admin@contabilidad.com
- **Contraseña:** admin123

> ⚠️ **Importante:** Cambia la contraseña después del primer acceso.

## 📊 Funcionalidades Principales

### ✅ Autenticación y Seguridad
- Sistema de login/registro con JWT
- Tokens con expiración automática (7 días)
- Middleware de autenticación en todas las rutas protegidas
- Logs de auditoría completos

### ✅ Gestión de Archivos Excel
- Subida de archivos .xlsx y .xls (máximo 10MB)
- Procesamiento automático de datos tabulares
- Cálculo de totales (suma, promedio, min, max) por columnas numéricas
- Almacenamiento seguro con nombres únicos

### ✅ Dashboard Interactivo
- Interfaz moderna y responsive
- Reloj en tiempo real
- Navegación por pestañas (Crear, Historial, Reportes, Logs)
- Información del usuario en sesión

### ✅ Historial y Reportes
- Lista completa de archivos subidos por todos los usuarios
- Búsqueda por nombre de archivo o usuario
- Descarga de archivos originales
- Reportes con totales calculados automáticamente

### ✅ Sistema de Logs
- Registro automático de todas las acciones
- Información detallada: usuario, timestamp, IP, descripción
- Filtrado por tipo de acción
- Herramienta de auditoría completa

### ✅ Multi-usuario en Red Local
- Acceso simultáneo desde múltiples computadoras
- Datos centralizados en servidor principal
- Cada usuario ve sus propios archivos (excepto admin)
- Configuración CORS para red local

## 🔧 Configuración Avanzada

### Variables de Entorno

#### Backend (.env):
```env
NODE_ENV=development
PORT=3001
HOST=0.0.0.0
JWT_SECRET=tu_clave_secreta_cambiar_en_produccion
JWT_EXPIRES_IN=7d
DB_PATH=./database/consolidacion.db
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env):
```env
VITE_API_URL=http://localhost:3001/api
```

### Automatización de Inicio

#### Windows (Task Scheduler):
1. Abrir Task Scheduler
2. Crear tarea básica
3. Configurar para ejecutar `iniciar-aplicacion.bat` al inicio del sistema

#### Linux (systemd):
```bash
# Crear servicio
sudo nano /etc/systemd/system/consolidacion-contable.service

# Habilitar servicio
sudo systemctl enable consolidacion-contable.service
```

## � API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro de usuario
- `POST /api/auth/login` - Inicio de sesión
- `GET /api/auth/profile` - Perfil del usuario
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/validate` - Validar token

### Archivos
- `POST /api/files/upload` - Subir archivo Excel
- `GET /api/files/history` - Historial de archivos
- `GET /api/files/download/:id` - Descargar archivo
- `GET /api/files/data/:id` - Obtener datos procesados

### Reportes
- `GET /api/reports/totals` - Obtener todos los totales
- `GET /api/reports/dashboard` - Resumen del dashboard

### Logs
- `GET /api/logs` - Obtener logs del sistema
- `POST /api/logs` - Crear log manual (solo admin)

### Salud del Sistema
- `GET /api/health` - Estado del servidor

## 🚨 Solución de Problemas

### Errores Comunes

#### "Cannot find module"
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### "Port already in use"
```bash
# Cambiar puerto en .env del backend
PORT=3002
```

#### "Permission denied" (Linux/Mac)
```bash
sudo chown -R $USER:$USER .
chmod +x iniciar-aplicacion.sh
```

### Logs de Depuración
- **Backend:** Consola del servidor muestra errores detallados
- **Frontend:** Consola del navegador (F12) para errores del cliente
- **Base de datos:** Archivo `backend/database/consolidacion.db`

## 📋 Scripts Disponibles

### Backend
```bash
npm start          # Servidor de producción
npm run dev        # Servidor de desarrollo (con nodemon)
npm run init-db    # Inicializar/resetear base de datos
```

### Frontend
```bash
npm run dev        # Servidor de desarrollo con hot reload
npm run build      # Compilar para producción
npm run preview    # Vista previa de compilación
npm run lint       # Verificar código con ESLint
```

## 🔄 Actualización del Sistema

1. **Hacer backup de la base de datos:**
```bash
cp backend/database/consolidacion.db backup-$(date +%Y%m%d).db
```

2. **Actualizar dependencias:**
```bash
cd backend && npm update
cd ../frontend && npm update
```

3. **Reiniciar servicios**

## 🔐 Seguridad y Mejores Prácticas

- **JWT con expiración:** Tokens seguros de 7 días
- **Validación de archivos:** Solo Excel, máximo 10MB
- **Sanitización de datos:** Validación en backend y frontend
- **Logs de auditoría:** Registro completo de acciones
- **CORS configurado:** Solo dominios permitidos
- **Rate limiting:** Protección contra ataques de fuerza bruta
- **Helmet.js:** Headers de seguridad HTTP

## � Documentación Adicional

- [**INSTALACION.md**](INSTALACION.md) - Guía completa de instalación paso a paso
- [**MANUAL-USUARIO.md**](MANUAL-USUARIO.md) - Manual detallado para usuarios finales

## 🤝 Contribución

Para contribuir al proyecto:

1. Fork del repositorio
2. Crear rama para feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit de cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver archivo `LICENSE` para más detalles.

## 📧 Soporte

- **Documentación:** Ver archivos MD incluidos
- **Issues:** Reportar problemas en el repositorio
- **Email:** [contacto@ejemplo.com]
- **Wiki:** [Enlace a la wiki del proyecto]

## 🎯 Roadmap

### Versión 1.1 (Próximamente)
- [ ] Exportación de reportes a PDF/Excel
- [ ] Gráficos y visualizaciones
- [ ] Notificaciones en tiempo real
- [ ] API para integraciones externas

### Versión 1.2 (Futuro)
- [ ] Dashboard administrativo avanzado
- [ ] Configuración de roles personalizados
- [ ] Backup automático de base de datos
- [ ] Integración con servicios en la nube

---

**Desarrollado para agencias de contabilidad** 📊  
**Versión:** 1.0.0 | **Última actualización:** Octubre 2024