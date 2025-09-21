# 🔧 Configuración Gmail para Notificaciones HCD

## ❌ Error Actual
```
Invalid login: 535-5.7.8 Username and Password not accepted
```

Esto es normal con Gmail. Necesitas configurar la seguridad de la cuenta.

## ✅ Soluciones (Elige UNA opción)

### **Opción 1: Contraseña de Aplicación (RECOMENDADO)**

1. **Habilitar 2FA en la cuenta Gmail**:
   - Ve a [myaccount.google.com](https://myaccount.google.com)
   - Seguridad → Verificación en 2 pasos
   - Sigue los pasos para habilitar 2FA

2. **Generar contraseña de aplicación**:
   - Seguridad → Contraseñas de aplicaciones
   - Seleccionar app: "Correo"
   - Seleccionar dispositivo: "Otro (nombre personalizado)"
   - Nombre: "HCD Sistema Notificaciones"
   - **Copiar la contraseña generada** (ej: "abcd efgh ijkl mnop")

3. **Actualizar .env**:
   ```bash
   SMTP_PASSWORD=abcd efgh ijkl mnop  # La contraseña de aplicación generada
   ```

### **Opción 2: Acceso de Apps Menos Seguras (NO RECOMENDADO)**

1. Ve a [myaccount.google.com](https://myaccount.google.com)
2. Seguridad → Acceso de aplicaciones menos seguras
3. Activar "Permitir aplicaciones menos seguras"

⚠️ **No recomendado por seguridad**

### **Opción 3: Gmail para Organizaciones (G Suite)**

Si es una cuenta de organización:
1. Admin Console → Seguridad → API controls
2. Habilitar "Less secure app access"

## 🧪 Después de Configurar

1. **Reiniciar el servidor**:
   ```bash
   # Ctrl+C para detener
   npm run dev
   ```

2. **Probar la configuración**:
   - Ve a: http://localhost:5002/admin-panel-dashboard/notificaciones
   - Debe aparecer "✅ SMTP Configurado" en verde
   - Envía un email de prueba

3. **Probar manualmente**:
   ```bash
   curl -X POST http://localhost:5002/api/test-email \
     -H "Content-Type: application/json" \
     -d '{"to":"bloquefrentedetodosxlasflores@gmail.com"}'
   ```

## 📧 Estados de Configuración

### ✅ **Funcionando Correctamente**
```json
{
  "success": true,
  "message": "Email de prueba enviado correctamente"
}
```

### ❌ **Credenciales Incorrectas**
```json
{
  "success": false,
  "error": "Invalid login: Username and Password not accepted"
}
```

### ❌ **Configuración Incompleta**
```json
{
  "configured": false,
  "message": "Configuración SMTP incompleta"
}
```

## 🔄 Alternativas si Gmail No Funciona

### **Outlook/Hotmail**
```bash
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=tu-email@outlook.com
SMTP_PASSWORD=tu-contraseña
SMTP_SECURE=false
```

### **Yahoo Mail**
```bash
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_USER=tu-email@yahoo.com
SMTP_PASSWORD=contraseña-de-aplicacion
SMTP_SECURE=false
```

### **SMTP Personalizado**
```bash
SMTP_HOST=mail.hcdlasflores.gob.ar
SMTP_PORT=587
SMTP_USER=notificaciones@hcdlasflores.gob.ar
SMTP_PASSWORD=contraseña
SMTP_SECURE=false
```

## 🚀 Una Vez Funcionando

El sistema automáticamente:
1. ✅ Ocultará actividades pasadas de la página principal
2. ✅ Enviará notificaciones según la configuración de cada actividad
3. ✅ Evitará notificaciones duplicadas
4. ✅ Funcionará como Google Calendar

### Para automatizar completamente:
```bash
# Cron job - ejecutar cada hora
0 * * * * cd /path/to/hcd-admin && npm run send-notifications
```

---

**📞 Si necesitas ayuda adicional:**
- Ve al panel de notificaciones: `/admin-panel-dashboard/notificaciones`
- Revisa los logs del servidor
- Verifica que la cuenta Gmail permita aplicaciones de terceros