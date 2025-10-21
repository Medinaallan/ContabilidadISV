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

echo Verificando directorio de trabajo...
cd /d "%SCRIPT_DIR%"

REM Verificar si existe node_modules en la raíz
if not exist "node_modules" (
    echo Instalando dependencias principales...
    npm install
    if errorlevel 1 (
        echo ERROR: No se pudieron instalar las dependencias principales.
        pause
        exit /b 1
    )
)

echo.
echo ============================================
echo  Iniciando backend (Puerto 3002) y frontend (Puerto 5174)...
echo ============================================
echo.
echo Backend corriendo en: http://localhost:3002
echo Frontend corriendo en: http://localhost:5174
echo.
echo Usuario por defecto:
echo Email: admin@contabilidad.com
echo Password: admin123
echo.

REM Iniciar ambos servicios con un solo comando
npm run dev

echo.
echo Presiona Ctrl+C para detener la aplicacion.
pause