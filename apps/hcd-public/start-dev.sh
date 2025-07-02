#!/bin/bash

echo "🔄 Liberando puerto 3005..."

# Liberar puerto 3005 si está ocupado
sudo fuser -k 3005/tcp 2>/dev/null || true
lsof -ti:3005 | xargs kill -9 2>/dev/null || true

# También verificar procesos de Node.js
pkill -f "next dev" 2>/dev/null || true
pkill -f "node.*3005" 2>/dev/null || true

echo "⏳ Esperando que el puerto se libere..."
sleep 2

# Verificar si el puerto está libre
if lsof -Pi :3005 -sTCP:LISTEN -t >/dev/null ; then
    echo "❌ El puerto 3005 aún está ocupado. Intentando liberar nuevamente..."
    sudo fuser -k 3005/tcp 2>/dev/null || true
    sleep 2
fi

echo "🚀 Iniciando la aplicación en puerto 3005..."
npm run dev
