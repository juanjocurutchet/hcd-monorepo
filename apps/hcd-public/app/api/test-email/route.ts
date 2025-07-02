import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function GET() {
  try {
    // Enviar un correo de prueba
    const result = await sendEmail({
      to: process.env.NOTIFICATION_EMAIL || process.env.SMTP_USER || "",
      subject: "Prueba de configuración SMTP",
      text: "Este es un correo de prueba para verificar la configuración SMTP con Gmail.",
    })

    return NextResponse.json({
      status: "success",
      message: "Correo enviado correctamente",
      result,
    })
  } catch (error) {
    console.error("Error al enviar correo de prueba:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al enviar correo de prueba",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
