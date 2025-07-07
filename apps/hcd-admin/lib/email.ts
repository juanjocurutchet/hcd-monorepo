import nodemailer from "nodemailer"

type EmailOptions = {
  to: string
  subject: string
  text: string
  html?: string
}

export async function sendEmail({ to, subject, text, html }: EmailOptions) {
  // Verificar si hay configuración SMTP
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
    console.warn("Configuración SMTP no encontrada. No se enviará el email.")
    return null
  }

  // Configurar el transporte de correo
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number.parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  // Enviar el correo
  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || '"Concejo Deliberante" <no-reply@hcdlasflores.gob.ar>',
    to,
    subject,
    text,
    html: html || text.replace(/\n/g, "<br>"),
  })

  return info
}
