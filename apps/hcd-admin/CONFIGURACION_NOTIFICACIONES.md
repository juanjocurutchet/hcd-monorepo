# 🔧 Configuración del Sistema de Notificaciones

## ✅ Problemas Resueltos

### 1. **Actividades Pasadas Ya No Se Muestran**
- ✅ La API ahora filtra automáticamente actividades futuras
- ✅ Solo muestra actividades publicadas por defecto
- ✅ Comportamiento similar a Google Calendar

### 2. **Sistema de Notificaciones Mejorado**
- ✅ Detección automática de configuración SMTP
- ✅ Panel de pruebas integrado en el admin
- ✅ Endpoints para testing y debugging

## 🚀 Configuración Requerida

### 1. Variables de Entorno

Copia `.env.example` a `.env` y configura:

```bash
# SMTP para Gmail (recomendado)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-contraseña-de-aplicacion"  # ⚠️ Usar contraseña de aplicación, no la normal
SMTP_SECURE="false"
SMTP_FROM="Concejo Deliberante <no-reply@hcdlasflores.gob.ar>"
```

### 2. Configuración Gmail (Recomendado)

1. **Habilitar 2FA** en tu cuenta Gmail
2. **Generar contraseña de aplicación**:
   - Ve a [Configuración de cuenta Google](https://myaccount.google.com/)
   - Seguridad → Verificación en 2 pasos → Contraseñas de aplicaciones
   - Genera una nueva contraseña para "HCD Sistema"
   - Usa esa contraseña en `SMTP_PASSWORD`

### 3. Otras Opciones SMTP

#### Outlook/Hotmail
```bash
SMTP_HOST="smtp-mail.outlook.com"
SMTP_PORT="587"
SMTP_SECURE="false"
```

#### SMTP Personalizado
```bash
SMTP_HOST="mail.tu-dominio.com"
SMTP_PORT="465"
SMTP_SECURE="true"  # Para puerto 465
```

## 🧪 Pruebas y Verificación

### 1. Panel de Administración
- Ve a `/admin-panel-dashboard/notificaciones`
- Verifica el estado de configuración SMTP
- Envía emails de prueba
- Prueba notificaciones de actividades específicas

### 2. Comandos Manuales

```bash
# Verificar configuración SMTP
curl http://localhost:5002/api/test-email

# Enviar email de prueba
curl -X POST http://localhost:5002/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"tu-email@gmail.com"}'

# Ejecutar notificaciones manualmente
npm run send-notifications

# Forzar envío de todas las notificaciones pendientes
curl -X POST http://localhost:5002/api/activities/notifications \
  -H "Content-Type: application/json" \
  -d '{"action":"send_all"}'
```

## ⚙️ Automatización (Producción)

### 1. Cron Job (Linux/Mac)
```bash
# Editar crontab
crontab -e

# Agregar línea para ejecutar cada hora
0 * * * * cd /path/to/hcd-monorepo/apps/hcd-admin && npm run send-notifications >> /var/log/hcd-notifications.log 2>&1

# O cada 30 minutos para mayor precisión
*/30 * * * * cd /path/to/hcd-monorepo/apps/hcd-admin && npm run send-notifications >> /var/log/hcd-notifications.log 2>&1
```

### 2. Servicio de Windows
```bash
# Usando Task Scheduler de Windows
# Programa: node
# Argumentos: scripts/send-activity-notifications.ts
# Directorio: C:\path\to\hcd-admin
# Frecuencia: Cada hora
```

### 3. PM2 (Node.js Process Manager)
```bash
# Instalar PM2
npm install -g pm2

# Crear archivo ecosystem.config.js
module.exports = {
  apps: [{
    name: 'hcd-notifications',
    script: 'scripts/send-activity-notifications.ts',
    cron_restart: '0 * * * *',  // Cada hora
    autorestart: false,
    max_memory_restart: '100M'
  }]
}

# Iniciar con PM2
pm2 start ecosystem.config.js
```

## 🔍 Debugging

### Logs Útiles
```bash
# Ver logs del servidor Next.js
npm run dev

# Ver logs de notificaciones (en producción)
tail -f /var/log/hcd-notifications.log

# Verificar configuración actual
curl http://localhost:5002/api/test-email | jq
```

### Problemas Comunes

1. **"Configuration SMTP not found"**
   - Verifica que todas las variables SMTP estén en `.env`
   - Reinicia el servidor después de cambiar `.env`

2. **"Authentication failed"**
   - Usa contraseña de aplicación de Gmail (no la normal)
   - Verifica usuario y contraseña

3. **"Connection timeout"**
   - Verifica SMTP_HOST y SMTP_PORT
   - Revisa firewall/antivirus

4. **Notificaciones no se envían automáticamente**
   - Configura cron job o servicio
   - Verifica que el script se ejecute sin errores

## 📱 Uso del Sistema

### 1. Crear Actividad con Notificaciones
1. Ir a **Actividades → Nueva Actividad**
2. Completar datos básicos
3. ✅ Marcar "Habilitar notificaciones por email"
4. Seleccionar anticipación (ej: "24 horas")
5. Agregar emails separados por comas
6. Guardar

### 2. La actividad se comportará como Google Calendar:
- ✅ Aparece en la página principal hasta la fecha/hora
- ✅ Envía notificaciones automáticas según configuración
- ✅ Se oculta automáticamente cuando pasa la fecha
- ✅ Evita notificaciones duplicadas

## 🎯 Características Actuales

- ✅ Filtrado automático de actividades futuras
- ✅ Notificaciones por email con diseño profesional
- ✅ Panel de administración para pruebas
- ✅ Múltiples opciones de anticipación
- ✅ Soporte para múltiples emails por actividad
- ✅ Prevención de notificaciones duplicadas
- ✅ Zona horaria Argentina configurada
- ✅ Logs detallados para debugging

El sistema ya está completamente funcional. Solo necesita la configuración SMTP para comenzar a enviar notificaciones automáticamente.