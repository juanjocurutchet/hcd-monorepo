import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit
    const councilMemberId = searchParams.get("councilMemberId")

    // Construir consulta base
    let query = `
      SELECT id, title, description, date, image_url, is_published
      FROM activities
      WHERE is_published = true
    `

    const params: any[] = []

    // Agregar filtros
    if (councilMemberId) {
      query = `
        SELECT a.id, a.title, a.description, a.date, a.image_url, a.is_published
        FROM activities a
        JOIN activity_participants ap ON a.id = ap.activity_id
        WHERE a.is_published = true
        AND ap.council_member_id = $${params.length + 1}
      `
      params.push(Number.parseInt(councilMemberId))
    }

    // Agregar ordenamiento y paginación
    query += ` ORDER BY date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
    params.push(limit, offset)

    // Ejecutar consulta
    const activities = await sql`
      ${query}
    `

    // Obtener total de actividades
    let countQuery = sql`
      SELECT COUNT(*) as count
      FROM activities
      WHERE is_published = true
    `

    const countParams = []

    if (councilMemberId) {
      countQuery = sql`
        SELECT COUNT(DISTINCT a.id) as count
        FROM activities a
        JOIN activity_participants ap ON a.id = ap.activity_id
        WHERE a.is_published = true
        AND ap.council_member_id = ${Number.parseInt(councilMemberId)}
      `
      countParams.push(Number.parseInt(councilMemberId))
    }

    const [{ count }] = await sql`
      ${countQuery}
    `

    return NextResponse.json({
      data: activities,
      pagination: {
        total: Number.parseInt(count),
        page,
        limit,
        totalPages: Math.ceil(Number.parseInt(count) / limit),
      },
    })
  } catch (error) {
    console.error("Error obteniendo actividades:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}