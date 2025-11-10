@echo off
echo ====================================
echo    DETENIENDO SISTEMA PRODUCCION
echo ====================================
echo.

echo [1/3] Deteniendo servidor backend...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Backend-Produccion*" 2>nul
if errorlevel 1 (
    echo ⚠ No se encontraron procesos de backend corriendo
) else (
    echo ✓ Backend detenido
)
echo.

echo [2/3] Deteniendo servidor frontend...
taskkill /f /im node.exe /fi "WINDOWTITLE eq Frontend-Produccion*" 2>nul
if errorlevel 1 (
    echo ⚠ No se encontraron procesos de frontend corriendo
) else (
    echo ✓ Frontend detenido
)
echo.

echo [3/3] Limpiando procesos adicionales...
REM Buscar y detener procesos node.js que puedan estar corriendo en los puertos de producción
netstat -ano | findstr :3002 >nul 2>&1
if not errorlevel 1 (
    echo Detectado proceso en puerto 3002, intentando detener...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3002') do (
        taskkill /f /pid %%a 2>nul
    )
)

netstat -ano | findstr :4173 >nul 2>&1
if not errorlevel 1 (
    echo Detectado proceso en puerto 4173, intentando detener...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :4173') do (
        taskkill /f /pid %%a 2>nul
    )
)
echo ✓ Limpieza completada
echo.

echo ====================================
echo   SISTEMA DETENIDO COMPLETAMENTE
echo ====================================
echo.
echo Todos los procesos de producción han sido detenidos.
echo Los puertos 3002 (backend) y 4173 (frontend) están libres.
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul