# Sistema de Consolidación Contable

## Configuración de Puertos FIJA

Esta aplicación está configurada para usar **puertos fijos**:

- **Frontend**: Puerto **5174** (no puede cambiarse)
- **Backend**: Puerto **3002** (no puede cambiarse)

## Inicio Rápido

### Desde la raíz del proyecto:

```bash
# Instalar todas las dependencias
npm run install-all

# Inicializar la base de datos
npm run init-db

# Iniciar ambos servicios (backend + frontend)
npm run dev
```

### En Windows:
```cmd
# Usar el script de inicio simplificado
iniciar-aplicacion-simple.bat
```

## Comandos Disponibles

### Desde la raíz (`/consolidacion-contable/`):
- `npm run dev` - Inicia backend (3002) y frontend (5174) simultáneamente
- `npm run install-all` - Instala dependencias en backend y frontend
- `npm run init-db` - Inicializa la base de datos
- `npm run setup` - Instala dependencias + inicializa DB

### Backend específico (`/backend/`):
- `npm run dev` - Solo backend en puerto 3002
- `npm start` - Backend en producción

### Frontend específico (`/frontend/`):
- `npm run dev` - Solo frontend en puerto 5174

## Credenciales por Defecto

- **Email**: `admin@contabilidad.com`
- **Password**: `admin123`

## URLs de Acceso

- **Frontend**: http://localhost:5174
- **Backend API**: http://localhost:3002/api
- **Health Check**: http://localhost:3002/api/health

## Importante

⚠️ **Los puertos están configurados de forma FIJA y no se pueden cambiar automáticamente**

Si algún puerto está en uso, la aplicación fallará. Para resolver:

1. Detén otros procesos en esos puertos
2. En Windows: `taskkill /f /im node.exe`
3. Reinicia la aplicación

## Estructura del Proyecto

```
consolidacion-contable/
├── package.json              # Scripts principales
├── iniciar-aplicacion-simple.bat  # Inicio para Windows
├── backend/                   # Servidor API (Puerto 3002)
├── frontend/                  # Aplicación React (Puerto 5174)
└── README-PUERTOS.md         # Este archivo
```