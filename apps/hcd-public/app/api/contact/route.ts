import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { contactMessages } from "@/lib/db/schema"
import { sendEmail } from "@/lib/email"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, organization, subject, message, type = "contact" } = await request.json()

    // Validar datos
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Nombre, email, asunto y mensaje son requeridos" }, { status: 400 })
    }

    // Guardar mensaje
    const result = await db.query(
      `INSERT INTO contactMessages (name, email, phone, organization, subject, message, type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, email, phone, organization, subject, message, type]
    )

    // Intentar enviar confirmación al remitente
    try {
      if (process.env.SMTP_HOST) {
        await sendEmail({
          to: email,
          subject: `Confirmación de recepción - HCD Las Flores`,
          text: `
            Estimado/a ${name},

            Hemos recibido su mensaje con el asunto "${subject}".

            Gracias por contactar al Honorable Concejo Deliberante de Las Flores.
            Su mensaje será procesado y le responderemos a la brevedad.

            Este es un correo automático, por favor no responda a este mensaje.

            Saludos cordiales,
            Honorable Concejo Deliberante de Las Flores
          `,
        })
      }
    } catch (emailError) {
      console.error("Error enviando email de confirmación:", emailError)
      // No fallamos la petición si el email falla
    }

    // Intentar enviar notificación por email si está configurado
    try {
      if (process.env.NOTIFICATION_EMAIL && process.env.SMTP_HOST) {
        await sendEmail({
          to: process.env.NOTIFICATION_EMAIL,
          subject: `Nuevo mensaje de contacto: ${subject}`,
          text: `
            Nombre: ${name}
            Email: ${email}
            Teléfono: ${phone || "No proporcionado"}
            Organización: ${organization || "No proporcionada"}
            Tipo: ${type || "Contacto"}

            Mensaje:
            ${message}
          `,
        })
      }
    } catch (emailError) {
      console.error("Error enviando email de notificación:", emailError)
      // No fallamos la petición si el email falla
    }

    return NextResponse.json({
      success: true,
      id: result[0].id,
    })
  } catch (error: any) {
    console.error("Error guardando mensaje de contacto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
