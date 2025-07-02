export function getContactConfirmationTemplate(name: string, subject: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de recepción - HCD Las Flores</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background-color: #0e4c7d; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Honorable Concejo Deliberante</h1>
        <p>Las Flores, Buenos Aires</p>
      </div>
      <div class="content">
        <p>Estimado/a ${name},</p>
        <p>Hemos recibido su mensaje con el asunto <strong>"${subject}"</strong>.</p>
        <p>Gracias por contactar al Honorable Concejo Deliberante de Las Flores. Su mensaje será procesado y le responderemos a la brevedad.</p>
        <p><em>Este es un correo automático, por favor no responda a este mensaje.</em></p>
        <p>Saludos cordiales,<br>
        Honorable Concejo Deliberante de Las Flores</p>
      </div>
      <div class="footer">
        <p>Av. San Martín 320, Las Flores | TE: (2244) 452-123</p>
        <p>secretaria@hcdlasflores.gob.ar</p>
      </div>
    </body>
    </html>
  `
}

export function getAdminNotificationTemplate(
  name: string,
  email: string,
  phone: string | null,
  organization: string | null,
  type: string,
  subject: string,
  message: string,
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Nuevo mensaje de contacto - HCD Las Flores</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
        .header { background-color: #0e4c7d; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .message-box { background-color: #f9f9f9; border-left: 4px solid #0e4c7d; padding: 15px; margin: 15px 0; }
        .footer { background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #666; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .info-table td { padding: 8px; border-bottom: 1px solid #eee; }
        .info-table td:first-child { font-weight: bold; width: 30%; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Nuevo mensaje de contacto</h1>
        <p>HCD Las Flores - Sistema de notificaciones</p>
      </div>
      <div class="content">
        <p>Se ha recibido un nuevo mensaje de contacto con el asunto <strong>"${subject}"</strong>.</p>
        
        <table class="info-table">
          <tr>
            <td>Nombre:</td>
            <td>${name}</td>
          </tr>
          <tr>
            <td>Email:</td>
            <td>${email}</td>
          </tr>
          <tr>
            <td>Teléfono:</td>
            <td>${phone || "No proporcionado"}</td>
          </tr>
          <tr>
            <td>Organización:</td>
            <td>${organization || "No proporcionada"}</td>
          </tr>
          <tr>
            <td>Tipo de contacto:</td>
            <td>${type || "Contacto general"}</td>
          </tr>
        </table>
        
        <h3>Mensaje:</h3>
        <div class="message-box">
          ${message.replace(/\n/g, "<br>")}
        </div>
        
        <p>Puede responder directamente a este correo para contactar al remitente.</p>
      </div>
      <div class="footer">
        <p>Este es un mensaje automático del sistema de notificaciones del HCD Las Flores.</p>
      </div>
    </body>
    </html>
  `
}
