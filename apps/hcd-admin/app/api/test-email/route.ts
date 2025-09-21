import { sendEmail } from "@/lib/email"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { to, subject = "Prueba de email del sistema HCD" } = await request.json()
    
    if (!to) {
      return NextResponse.json({ error: "Se requiere email de destino" }, { status: 400 })
    }

    // Verificar configuración SMTP
    const smtpConfig = {
      host: process.env.SMTP_HOST,
      user: process.env.SMTP_USER,
      password: process.env.SMTP_PASSWORD,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE,
      from: process.env.SMTP_FROM
    }

    const missingConfig = Object.entries(smtpConfig)
      .filter(([key, value]) => !value)
      .map(([key]) => key)

    if (missingConfig.length > 0) {
      return NextResponse.json({ 
        error: "Configuración SMTP incompleta", 
        missing: missingConfig,
        current: Object.fromEntries(
          Object.entries(smtpConfig).map(([key, value]) => [key, value ? '***configurado***' : 'NO CONFIGURADO'])
        )
      }, { status: 400 })
    }

    const testEmailContent = {
      text: `
🔧 PRUEBA DE EMAIL - Sistema HCD Las Flores

Este es un email de prueba del sistema de notificaciones.

Configuración verificada:
- SMTP Host: ${process.env.SMTP_HOST}
- SMTP Port: ${process.env.SMTP_PORT}
- SMTP User: ${process.env.SMTP_USER}
- SMTP Secure: ${process.env.SMTP_SECURE}

Si recibes este email, la configuración está funcionando correctamente.

Fecha y hora: ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}
      `.trim(),
      
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Prueba de Email</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #0e4c7d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background: #f9f9f9; }
            .config { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #0e4c7d; }
            .success { background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔧 Prueba de Email</h1>
              <p>Sistema HCD Las Flores</p>
            </div>

            <div class="content">
              <div class="success">
                ✅ <strong>Configuración SMTP Correcta</strong><br>
                El sistema de emails está funcionando correctamente.
              </div>

              <div class="config">
                <h3>Configuración verificada:</h3>
                <ul>
                  <li><strong>SMTP Host:</strong> ${process.env.SMTP_HOST}</li>
                  <li><strong>SMTP Port:</strong> ${process.env.SMTP_PORT}</li>
                  <li><strong>SMTP User:</strong> ${process.env.SMTP_USER}</li>
                  <li><strong>SMTP Secure:</strong> ${process.env.SMTP_SECURE}</li>
                </ul>
              </div>

              <p>Si recibes este email, las notificaciones automáticas deberían funcionar correctamente.</p>
              
              <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' })}</p>
            </div>

            <div class="footer">
              <p>Este es un email de prueba del sistema de notificaciones del HCD Las Flores.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    const result = await sendEmail({
      to,
      subject,
      ...testEmailContent
    })

    if (result) {
      return NextResponse.json({ 
        success: true, 
        message: "Email de prueba enviado correctamente",
        messageId: result.messageId 
      })
    } else {
      return NextResponse.json({ 
        success: false, 
        error: "No se pudo enviar el email (posible configuración SMTP faltante)" 
      })
    }

  } catch (error) {
    console.error("Error enviando email de prueba:", error)
    return NextResponse.json({ 
      success: false, 
      error: "Error al enviar email de prueba", 
      details: error instanceof Error ? error.message : 'Error desconocido' 
    }, { status: 500 })
  }
}

export async function GET() {
  // Verificar solo la configuración sin enviar email
  const smtpConfig = {
    SMTP_HOST: process.env.SMTP_HOST || 'NO CONFIGURADO',
    SMTP_PORT: process.env.SMTP_PORT || 'NO CONFIGURADO',
    SMTP_USER: process.env.SMTP_USER || 'NO CONFIGURADO',
    SMTP_PASSWORD: process.env.SMTP_PASSWORD ? '***configurado***' : 'NO CONFIGURADO',
    SMTP_SECURE: process.env.SMTP_SECURE || 'NO CONFIGURADO',
    SMTP_FROM: process.env.SMTP_FROM || 'NO CONFIGURADO'
  }

  const isConfigured = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD

  return NextResponse.json({
    configured: isConfigured,
    config: smtpConfig,
    message: isConfigured 
      ? "Configuración SMTP completa" 
      : "Configuración SMTP incompleta - las notificaciones no funcionarán"
  })
}