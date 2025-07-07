# Sistema de Notificaciones de Actividades

Este sistema permite enviar notificaciones por email automáticamente para recordar actividades próximas, similar a Google Calendar.

## Características

- ✅ Notificaciones automáticas configuradas por actividad
- ✅ Múltiples opciones de anticipación (1 hora hasta 1 semana)
- ✅ Múltiples emails por actividad
- ✅ Prevención de notificaciones duplicadas
- ✅ Emails HTML con diseño profesional
- ✅ Pruebas de notificación desde la interfaz
- ✅ Envío manual de notificaciones

## Configuración

### 1. Variables de Entorno

Asegúrate de tener configurado el SMTP en tu archivo `.env`:

```env
# Configuración SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASSWORD=tu-contraseña-de-aplicación
SMTP_FROM="Concejo Deliberante <no-reply@hcdlasflores.gob.ar>"
SMTP_SECURE=false
```

### 2. Base de Datos

Ejecuta la migración para agregar los campos de notificación:

```bash
# Generar migración (ya hecho)
npx drizzle-kit generate

# Aplicar migración
npx drizzle-kit migrate
```

## Uso

### Crear Actividad con Notificaciones

1. Ve a **Actividades > Nueva Actividad**
2. Completa los datos básicos de la actividad
3. En la sección **"Configuración de Notificaciones"**:
   - ✅ Marca "Habilitar notificaciones por email"
   - ⏰ Selecciona la anticipación (ej: 24 horas)
   - 📧 Agrega los emails separados por comas

### Gestionar Notificaciones

Desde **Actividades > Calendario**, encontrarás el panel de gestión de notificaciones con:

- **Enviar todas las notificaciones pendientes**: Ejecuta el proceso automático
- **Enviar notificación inmediata**: Para una actividad específica
- **Probar notificación**: Envía un email de prueba

### Automatización

Para que las notificaciones se envíen automáticamente, configura un cron job:

```bash
# Ejecutar cada hora
0 * * * * cd /path/to/hcd-monorepo/apps/hcd-admin && npm run send-notifications

# Ejecutar cada 30 minutos
*/30 * * * * cd /path/to/hcd-monorepo/apps/hcd-admin && npm run send-notifications
```

O ejecuta manualmente:

```bash
npm run send-notifications
```

## API Endpoints

### POST /api/activities/notifications

```javascript
// Enviar todas las notificaciones pendientes
POST /api/activities/notifications
{
  "action": "send_all"
}

// Enviar notificación inmediata
POST /api/activities/notificaciones
{
  "action": "send_immediate",
  "activityId": 123
}

// Probar notificación
POST /api/activities/notificaciones
{
  "action": "test",
  "activityId": 123,
  "testEmail": "test@ejemplo.com"
}
```

## Estructura de Email

Los emails incluyen:

- 🎯 Título y descripción de la actividad
- 📅 Fecha y hora formateada
- 📍 Ubicación (si está configurada)
- ⏰ Tiempo restante hasta la actividad
- 🎨 Diseño HTML profesional con colores del HCD

## Prevención de Duplicados

El sistema evita enviar notificaciones duplicadas:

- Mínimo 2 horas entre notificaciones para la misma actividad
- Control de `lastNotificationSent` en la base de datos
- Verificación de tiempo antes del envío

## Troubleshooting

### Las notificaciones no se envían

1. Verifica la configuración SMTP en `.env`
2. Revisa los logs del servidor
3. Usa la función "Probar notificación" para verificar
4. Asegúrate de que los emails estén configurados en la actividad

### Error de conexión SMTP

- Verifica que el puerto SMTP esté abierto
- Confirma las credenciales de email
- Para Gmail, usa contraseñas de aplicación
- Verifica que `SMTP_SECURE` esté configurado correctamente

### Notificaciones duplicadas

- El sistema tiene protección automática
- Verifica que no haya múltiples cron jobs ejecutándose
- Revisa el campo `lastNotificationSent` en la base de datos

## Personalización

### Modificar Plantilla de Email

Edita `ActivityNotificationService.generateNotificationEmail()` en:
`lib/services/activity-notification-service.ts`

### Cambiar Configuración por Defecto

Modifica los valores por defecto en el esquema de la base de datos:
`lib/db/schema.ts`

### Agregar Nuevos Tipos de Notificación

Extiende el servicio para incluir:
- Notificaciones por SMS
- Notificaciones push
- Integración con calendarios externos