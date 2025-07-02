import { Resend } from "resend"

type EmailOptions = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // Verificar si hay configuración de Resend
  if (!process.env.RESEND_API_KEY) {
    console.warn("API Key de Resend no encontrada. No se enviará el email.")
    return null
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  // Enviar el correo
  const { data, error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Concejo Deliberante <no-reply@hcdlasflores.gob.ar>",
    to: [to],
    subject,
    text,
    html: html || text.replace(/\n/g, "<br>"),
  })

  if (error) {
    console.error("Error al enviar email:", error)
    throw error
  }

  return data
}
