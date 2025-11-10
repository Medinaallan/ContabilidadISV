#!/bin/bash

echo "===================================="
echo "  INICIANDO SISTEMA EN PRODUCCION  "
echo "===================================="
echo

echo "[1/4] Compilando frontend para produccion..."
cd frontend
npm run build
if [ $? -ne 0 ]; then
    echo "ERROR: Fallo al compilar el frontend"
    exit 1
fi
echo "✓ Frontend compilado exitosamente"
echo

cd ..

echo "[2/4] Iniciando servidor backend en produccion..."
cd backend
NODE_ENV=production npm start &
BACKEND_PID=$!
echo "✓ Backend iniciado (PID: $BACKEND_PID)"
echo

cd ..

echo "[3/4] Esperando que el backend este listo..."
sleep 3
echo "✓ Backend listo"
echo

echo "[4/4] Iniciando preview del frontend..."
cd frontend
npm run preview &
FRONTEND_PID=$!
echo "✓ Frontend preview iniciado (PID: $FRONTEND_PID)"
echo

cd ..

echo "===================================="
echo "  SISTEMA INICIADO EN PRODUCCION   "
echo "===================================="
echo
echo "Backend: http://localhost:3002"
echo "Frontend: http://localhost:4173 (preview)"
echo
echo "PIDs guardados:"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo
echo "Para detener el sistema, ejecuta: ./detener-produccion.sh"
echo

# Guardar PIDs para poder detener después
echo $BACKEND_PID > .backend.pid
echo $FRONTEND_PID > .frontend.pid

# Mantener el script corriendo
wait