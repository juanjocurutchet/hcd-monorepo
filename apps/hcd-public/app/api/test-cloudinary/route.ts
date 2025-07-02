import { NextResponse } from "next/server"
import { v2 as cloudinary } from "cloudinary"

export async function GET() {
  try {
    // Verificar la configuración de Cloudinary
    const config = cloudinary.config()

    // No devolvemos el API Secret por seguridad
    return NextResponse.json({
      status: "success",
      cloudinary: {
        cloud_name: config.cloud_name,
        api_key: config.api_key,
        secure: config.secure,
      },
    })
  } catch (error) {
    console.error("Error al verificar la configuración de Cloudinary:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Error al verificar la configuración de Cloudinary",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
