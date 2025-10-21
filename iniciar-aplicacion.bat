@echo off
title Sistema de Consolidacion Contable

echo ============================================
echo  Sistema de Consolidacion Contable
echo  Iniciando aplicacion completa...
echo ============================================
echo.

REM Verificar si Node.js está instalado
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js no está instalado.
    echo Descarga e instala Node.js desde: https://nodejs.org/
    pause
    exit /b 1
)

REM Obtener la ruta del script
set "SCRIPT_DIR=%~dp0"

echo [1/4] Verificando dependencias del backend...
cd /d "%SCRIPT_DIR%backend"
if not exist "node_modules" (
    echo Instalando dependencias del backend...
    call npm install
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias del backend
        pause
        exit /b 1
    )
)

echo [2/4] Inicializando base de datos...
call npm run init-db
if errorlevel 1 (
    echo ERROR: No se pudo inicializar la base de datos
    pause
    exit /b 1
)

echo [3/4] Verificando dependencias del frontend...
cd /d "%SCRIPT_DIR%frontend"
if not exist "node_modules" (
    echo Instalando dependencias del frontend...
    call npm install
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias del frontend
        pause
        exit /b 1
    )
)

echo [4/4] Iniciando servidores...

REM Iniciar backend en una nueva ventana
cd /d "%SCRIPT_DIR%backend"
start "Backend - Consolidacion Contable" cmd /k "echo Backend iniciado && npm start"

REM Esperar un poco para que el backend se inicie
timeout /t 5 /nobreak >nul

REM Iniciar frontend en una nueva ventana
cd /d "%SCRIPT_DIR%frontend"
start "Frontend - Consolidacion Contable" cmd /k "echo Frontend iniciado && npm run dev"

echo.
echo ============================================
echo  ¡Aplicacion iniciada exitosamente!
echo ============================================
echo.
echo Backend corriendo en: http://localhost:3001
echo Frontend corriendo en: http://localhost:5174
echo.
echo Para acceder desde otras computadoras en la red:
echo Backend: http://[IP-LOCAL]:3001
echo Frontend: http://[IP-LOCAL]:5174
echo.
echo Usuario por defecto:
echo Email: admin@contabilidad.com
echo Password: admin123
echo.
echo Presiona cualquier tecla para abrir la aplicacion en el navegador...
pause >nul

REM Abrir en el navegador
start "" "http://localhost:5174"

echo.
echo Para detener la aplicacion, cierra las ventanas del backend y frontend.
pause