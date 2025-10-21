#!/bin/bash

echo "============================================"
echo " Sistema de Consolidación Contable"
echo " Iniciando aplicación completa..."
echo "============================================"
echo

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado."
    echo "Instala Node.js desde: https://nodejs.org/"
    exit 1
fi

# Obtener la ruta del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "[1/4] Verificando dependencias del backend..."
cd "$SCRIPT_DIR/backend"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del backend..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: No se pudieron instalar las dependencias del backend"
        exit 1
    fi
fi

echo "[2/4] Inicializando base de datos..."
npm run init-db
if [ $? -ne 0 ]; then
    echo "ERROR: No se pudo inicializar la base de datos"
    exit 1
fi

echo "[3/4] Verificando dependencias del frontend..."
cd "$SCRIPT_DIR/frontend"
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias del frontend..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: No se pudieron instalar las dependencias del frontend"
        exit 1
    fi
fi

echo "[4/4] Iniciando servidores..."

# Iniciar backend en segundo plano
cd "$SCRIPT_DIR/backend"
npm start &
BACKEND_PID=$!

# Esperar un poco para que el backend se inicie
sleep 5

# Iniciar frontend en segundo plano
cd "$SCRIPT_DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo
echo "============================================"
echo " ¡Aplicación iniciada exitosamente!"
echo "============================================"
echo
echo "Backend corriendo en: http://localhost:3001"
echo "Frontend corriendo en: http://localhost:5173"
echo
echo "Para acceder desde otras computadoras en la red:"
echo "Backend: http://[IP-LOCAL]:3001"
echo "Frontend: http://[IP-LOCAL]:5173"
echo
echo "Usuario por defecto:"
echo "Email: admin@contabilidad.com"
echo "Password: admin123"
echo
echo "Presiona Ctrl+C para detener la aplicación..."

# Función para limpiar procesos al salir
cleanup() {
    echo
    echo "Deteniendo aplicación..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Aplicación detenida."
    exit 0
}

# Capturar señal de interrupción
trap cleanup SIGINT

# Mantener el script corriendo
wait