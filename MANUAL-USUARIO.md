# Manual de Usuario - Sistema de Consolidación Contable

## 📖 Introducción

El Sistema de Consolidación Contable es una plataforma web diseñada para agencias de contabilidad que permite cargar, procesar y analizar archivos Excel de consolidación contable de manera eficiente y segura.

## 🎯 Características Principales

- ✅ **Autenticación segura** con JWT
- ✅ **Subida de archivos Excel** (.xlsx, .xls)
- ✅ **Procesamiento automático** de datos contables
- ✅ **Historial completo** de archivos subidos
- ✅ **Reportes detallados** con totales calculados
- ✅ **Sistema de logs** para auditoría
- ✅ **Interfaz moderna** y responsive
- ✅ **Acceso multi-usuario** en red local

## 🚀 Primeros Pasos

### Acceso al Sistema

1. **Abrir navegador web** (Chrome, Firefox, Edge, Safari)
2. **Navegar a la dirección:**
   - Local: `http://localhost:5173`
   - Red: `http://[IP-SERVIDOR]:5173`
3. **Iniciar sesión** con las credenciales proporcionadas

### Credenciales por Defecto
- **Email:** admin@contabilidad.com
- **Contraseña:** admin123

> ⚠️ **Importante:** Cambia la contraseña después del primer acceso.

## 📊 Funcionalidades Detalladas

### 1. Dashboard Principal

Al iniciar sesión, accedes al dashboard principal que muestra:

- **Header superior** con navegación principal
- **Reloj en tiempo real** del sistema
- **Información del usuario** logueado
- **Botones principales:** Crear Consolidación, Historial, Reportes, Logs
- **Contenido dinámico** según la sección seleccionada

### 2. Crear Consolidación

#### Subir Archivos Excel

1. **Hacer clic en "Crear Consolidación"**
2. **Arrastrar archivos** a la zona de subida o hacer clic para seleccionar
3. **Formatos soportados:** .xlsx, .xls (máximo 10MB por archivo)
4. **El sistema procesa automáticamente:**
   - Extrae datos de todas las hojas
   - Calcula totales por columnas numéricas
   - Guarda información en la base de datos

#### Instrucciones para Archivos Excel

- **Primera fila:** Debe contener los encabezados de columnas
- **Datos numéricos:** Se calculan automáticamente (suma, promedio, min, max)
- **Formato tabular:** Los datos deben estar organizados en filas y columnas
- **Múltiples hojas:** Todas las hojas del archivo se procesan

### 3. Historial de Archivos

#### Funcionalidades:

- **Lista completa** de archivos subidos
- **Información detallada:** nombre, usuario, fecha, tamaño
- **Búsqueda** por nombre de archivo o usuario
- **Descarga** de archivos originales
- **Visualización** de datos procesados

#### Cómo usar:

1. **Seleccionar "Historial de Archivos"**
2. **Buscar archivos** usando la barra de búsqueda
3. **Descargar archivos** haciendo clic en "Descargar"
4. **Ver datos procesados** haciendo clic en "Ver"

### 4. Reportes

#### Información disponible:

- **Resumen general:** Total de reportes, filas procesadas
- **Totales por consolidación:** Suma, promedio, contador por columna
- **Estadísticas detalladas:** Por archivo y usuario
- **Visualización organizada** por fecha de subida

#### Interpretación de datos:

- **Suma:** Total de todos los valores numéricos de la columna
- **Promedio:** Media aritmética de los valores
- **Contador:** Cantidad de celdas con datos numéricos
- **Min/Max:** Valores mínimo y máximo encontrados

### 5. Logs del Sistema

#### Eventos registrados:

- **Login/Logout** de usuarios
- **Subida de archivos** con detalles
- **Descarga de archivos** 
- **Acciones administrativas**
- **Errores del sistema**

#### Información incluida:

- **Usuario** que realizó la acción
- **Timestamp** exacto del evento
- **Descripción** detallada de la acción
- **Dirección IP** de origen
- **Filtros** por tipo de acción

## 👥 Gestión de Usuarios

### Tipos de Usuario

1. **Administrador (admin):**
   - Acceso completo al sistema
   - Puede ver archivos de todos los usuarios
   - Acceso a todos los logs del sistema
   - Puede crear logs manuales

2. **Usuario normal (user):**
   - Puede subir y gestionar sus propios archivos
   - Ve solo sus reportes y datos
   - Acceso limitado a logs

### Registro de Nuevos Usuarios

1. **Ir a la página de registro**
2. **Completar el formulario:**
   - Nombre de usuario (3-30 caracteres)
   - Email válido
   - Contraseña segura (mínimo 6 caracteres)
   - Confirmar contraseña
3. **El sistema crea automáticamente** la cuenta como usuario normal

## 🔍 Funciones Avanzadas

### Búsqueda y Filtrado

- **Historial:** Buscar por nombre de archivo o usuario
- **Logs:** Filtrar por tipo de acción
- **Reportes:** Ordenación automática por fecha

### Tiempo Real

- **Reloj actualizado** cada segundo
- **Fecha completa** en español
- **Estado de la sesión** siempre visible

### Seguridad

- **Tokens JWT** con expiración automática
- **Validación de archivos** para prevenir cargas maliciosas
- **Logs de auditoría** completos
- **Sesiones seguras** con logout automático

## 📱 Uso en Red Local

### Configuración Multi-Usuario

1. **El administrador instala** el sistema en un servidor central
2. **Las computadoras clientes acceden** vía navegador web
3. **Cada usuario tiene su cuenta** individual
4. **Los datos se centralizan** en el servidor principal

### Requisitos de Red

- **Todas las computadoras** en la misma red local
- **Firewall configurado** para permitir acceso a los puertos
- **IP fija recomendada** para el servidor principal

## 🚨 Solución de Problemas

### Errores Comunes

#### "Error de conexión"
- Verificar que el backend esté ejecutándose
- Comprobar la URL de la API
- Revisar configuración de red/firewall

#### "Token expirado"
- Cerrar sesión y volver a iniciar
- Los tokens expiran después de 7 días por seguridad

#### "Error subiendo archivo"
- Verificar formato (.xlsx, .xls únicamente)
- Comprobar tamaño (máximo 10MB)
- Asegurarse de que el archivo no esté corrupto

#### "No se pueden cargar datos"
- Refrescar la página
- Verificar conexión a internet/red
- Contactar al administrador del sistema

### Mejores Prácticas

1. **Cierra sesión** cuando termines de trabajar
2. **Usa nombres descriptivos** para los archivos Excel
3. **Mantén los archivos organizados** antes de subirlos
4. **Verifica los datos** en los reportes después de subir
5. **Haz backup regular** de archivos importantes

## 📞 Soporte Técnico

### Información para Soporte

Cuando contactes soporte, proporciona:

- **Descripción del problema** detallada
- **Pasos para reproducir** el error
- **Usuario y hora** cuando ocurrió el problema
- **Tipo de archivo** que intentabas procesar
- **Navegador y versión** que usas

### Contacto

- **Administrador del Sistema:** [Contacto interno]
- **Soporte Técnico:** [Email/Teléfono de soporte]

## 📈 Consejos de Productividad

1. **Organiza archivos** con nombres claros y fechas
2. **Usa la búsqueda** para localizar archivos rápidamente
3. **Revisa reportes regularmente** para validar datos
4. **Mantén backup local** de archivos importantes
5. **Aprovecha el historial** para referencias futuras

## 🔄 Actualizaciones del Sistema

El sistema se actualiza periódicamente con:

- **Nuevas funcionalidades**
- **Mejoras de rendimiento**
- **Correcciones de errores**
- **Actualizaciones de seguridad**

Las actualizaciones las maneja el administrador del sistema y generalmente no requieren acción del usuario final.

---

*Este manual está actualizado a la fecha de instalación. Para la versión más reciente, consulta con el administrador del sistema.*