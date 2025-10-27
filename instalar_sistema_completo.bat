REM ===================================================================
REM INSTALADOR COMPLETO DEL SISTEMA DE CONSOLIDACIÓN CONTABLE
REM SQL Server 2022 Express Edition
REM 
REM Este script realiza la instalación completa:
REM 1. Instala dependencias de Node.js
REM 2. Crea la base de datos en SQL Server
REM 3. Inicializa los datos del sistema
REM ===================================================================

@echo off
cls
color 0A
echo.
echo =========================================================
echo    INSTALADOR COMPLETO
echo    Sistema de Consolidacion Contable
echo    SQL Server 2022 Express Edition
echo =========================================================
echo.

REM Verificar que estamos en el directorio correcto
if not exist "backend\package.json" (
    echo ERROR: No se encuentra el archivo backend\package.json
    echo.
    echo Asegurate de ejecutar este script desde la raiz del proyecto:
    echo ^> cd D:\ITSystems\ContabilidadISV
    echo ^> instalar_sistema_completo.bat
    echo.
    pause
    exit /b 1
)

echo [PASO 1/4] Verificando dependencias del sistema...
echo.

REM Verificar Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no encontrado
    echo.
    echo Instala Node.js desde: https://nodejs.org/
    echo Version recomendada: 18.x o superior
    echo.
    pause
    exit /b 1
)

REM Verificar npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm no encontrado
    echo.
    echo npm deberia venir incluido con Node.js
    echo Reinstala Node.js desde: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Verificar sqlcmd
sqlcmd -? >nul 2>&1
if errorlevel 1 (
    echo ERROR: sqlcmd no encontrado
    echo.
    echo Instala SQL Server Command Line Tools desde:
    echo https://docs.microsoft.com/en-us/sql/tools/sqlcmd-utility
    echo.
    pause
    exit /b 1
)

echo ✓ Node.js encontrado: 
node --version
echo ✓ npm encontrado:
npm --version
echo ✓ sqlcmd encontrado
echo.

echo [PASO 2/4] Instalando dependencias de Node.js...
echo.

REM Instalar dependencias del backend
echo Instalando dependencias del backend...
cd backend
npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias del backend
    pause
    exit /b 1
)
cd..

REM Instalar dependencias del frontend
echo.
echo Instalando dependencias del frontend...
cd frontend
npm install
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de dependencias del frontend
    cd..
    pause
    exit /b 1
)
cd..

echo ✓ Dependencias instaladas correctamente
echo.

echo [PASO 3/4] Configurando base de datos SQL Server...
echo.

REM Verificar conexión a SQL Server
sqlcmd -S "localhost\SQLEXPRESS" -E -Q "SELECT @@VERSION" >nul 2>&1
if errorlevel 1 (
    echo ERROR: No se puede conectar a SQL Server
    echo.
    echo Verifica que:
    echo - SQL Server Express este instalado
    echo - El servicio SQL Server ^(SQLEXPRESS^) este ejecutandose
    echo - La instancia sea accesible: localhost\SQLEXPRESS
    echo.
    echo Para verificar servicios ejecuta: services.msc
    echo Busca: SQL Server ^(SQLEXPRESS^)
    echo.
    pause
    exit /b 1
)

echo ✓ Conexion a SQL Server establecida
echo.

REM Ejecutar instalación de la base de datos
echo Creando base de datos y tablas...
call database\sqlserver\instalar_base_datos.bat
if errorlevel 1 (
    echo ERROR: Fallo la instalacion de la base de datos
    pause
    exit /b 1
)

echo.
echo [PASO 4/4] Inicializando sistema con Node.js...
echo.

REM Copiar archivo de configuración
copy backend\.env.sqlserver backend\.env >nul 2>&1
echo ✓ Configuracion de SQL Server aplicada

REM Inicializar sistema desde Node.js
cd backend
node scripts\initSqlServerDatabase.js
if errorlevel 1 (
    echo ERROR: Fallo la inicializacion del sistema desde Node.js
    cd..
    pause
    exit /b 1
)
cd..

echo.
color 0F
echo =========================================================
echo    INSTALACION COMPLETADA EXITOSAMENTE
echo =========================================================
echo.
echo ✓ Dependencias de Node.js instaladas
echo ✓ Base de datos SQL Server configurada  
echo ✓ Sistema inicializado correctamente
echo.
echo ========== INFORMACION DE ACCESO ==========
echo.
echo 🌐 URLs de la aplicacion:
echo    Frontend:  http://localhost:5174
echo    Backend:   http://localhost:3002/api
echo.
echo 👤 Credenciales de acceso:
echo    Email:     admin@contabilidad.com
echo    Password:  admin123
echo    Rol:       admin
echo.
echo 🗄️  Base de datos:
echo    Servidor:  localhost\SQLEXPRESS
echo    Base:      ContabilidadISV
echo    Auth:      Windows Authentication
echo.
echo ========== COMANDOS DE INICIO ==========
echo.
echo Para iniciar la aplicacion:
echo    ^> iniciar-aplicacion-simple.bat
echo.
echo Para desarrollo:
echo    ^> npm run dev          ^(desde la raiz^)
echo    ^> cd backend ^&^& npm run dev  ^(solo backend^)
echo    ^> cd frontend ^&^& npm run dev ^(solo frontend^)
echo.
echo ¡El sistema esta listo para usar!
echo.
pause