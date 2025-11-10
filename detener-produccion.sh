#!/bin/bash

echo "===================================="
echo "    DETENIENDO SISTEMA PRODUCCION   "
echo "===================================="
echo

# Leer PIDs guardados
if [ -f .backend.pid ]; then
    BACKEND_PID=$(cat .backend.pid)
    echo "Deteniendo backend (PID: $BACKEND_PID)..."
    kill $BACKEND_PID 2>/dev/null
    rm .backend.pid
    echo "✓ Backend detenido"
else
    echo "⚠ No se encontró PID del backend"
fi

if [ -f .frontend.pid ]; then
    FRONTEND_PID=$(cat .frontend.pid)
    echo "Deteniendo frontend (PID: $FRONTEND_PID)..."
    kill $FRONTEND_PID 2>/dev/null
    rm .frontend.pid
    echo "✓ Frontend detenido"
else
    echo "⚠ No se encontró PID del frontend"
fi

echo
echo "✓ Sistema detenido completamente"
echo "===================================="