@echo off
echo ====================================
echo  INICIANDO SISTEMA EN PRODUCCION
echo ====================================
echo.

echo [1/4] Compilando frontend para produccion...
cd frontend
call npm run build
if errorlevel 1 (
    echo ERROR: Fallo al compilar el frontend
    pause
    exit /b 1
)
echo ✓ Frontend compilado exitosamente
echo.

cd ..

echo [2/4] Iniciando servidor backend en produccion...
start "Backend-Produccion" cmd /k "cd backend && set NODE_ENV=production && npm start"
echo ✓ Backend iniciado en segundo plano
echo.

echo [3/4] Esperando que el backend este listo...
timeout /t 3 /nobreak > nul
echo ✓ Backend listo
echo.

echo [4/4] Iniciando preview del frontend...
cd frontend
start "Frontend-Produccion" cmd /k "npm run preview"
echo ✓ Frontend preview iniciado
echo.

cd ..

echo ====================================
echo  SISTEMA INICIADO EN PRODUCCION
echo ====================================
echo.
echo Backend: http://localhost:3002
echo Frontend: http://localhost:4173 (preview)
echo.
echo Presiona cualquier tecla para cerrar esta ventana...
pause > nul