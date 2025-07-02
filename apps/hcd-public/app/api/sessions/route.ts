import { type NextRequest, NextResponse } from "next/server"
import { getSessions, getSessionsCount } from "@/lib/services/session-service"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const year = searchParams.get("year") ? Number.parseInt(searchParams.get("year")!) : undefined
    const type = searchParams.get("type") as "ordinaria" | "extraordinaria" | "especial" | "preparatoria" | undefined
    const onlyPublished = searchParams.get("onlyPublished") !== "false"

    // Obtener sesiones
    const sessions = await getSessions({
      year,
      type,
      limit,
      offset,
      onlyPublished,
    })

    // Obtener total de sesiones
    const count = await getSessionsCount({
      year,
      type,
      onlyPublished,
    })

    return NextResponse.json({
      data: sessions,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo sesiones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
