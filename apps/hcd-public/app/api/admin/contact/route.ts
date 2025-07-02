import { type NextRequest, NextResponse } from "next/server"
import { getContactMessages } from "@/lib/services/contact-service"
import { isAdmin } from "@/lib/utils/server-utils"

export async function GET(request: NextRequest) {
  try {
    // Verificar permisos
    if (!isAdmin(request)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const type = searchParams.get("type") || undefined

    // Obtener mensajes
    const messages = await getContactMessages(limit, offset, type)

    // TODO: Implementar conteo de mensajes en el servicio
    // Por ahora, simplemente devolvemos los mensajes sin paginación
    return NextResponse.json({
      data: messages,
    })
  } catch (error) {
    console.error("Error obteniendo mensajes de contacto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
