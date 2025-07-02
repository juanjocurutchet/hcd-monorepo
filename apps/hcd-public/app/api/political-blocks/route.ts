import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Obtener bloques políticos
    const blocks = await sql`
      SELECT pb.id, pb.name, pb.president_id, pb.color,
             cm.name as president_name
      FROM political_blocks pb
      LEFT JOIN council_members cm ON pb.president_id = cm.id
      ORDER BY pb.name
    `

    return NextResponse.json(blocks)
  } catch (error) {
    console.error("Error obteniendo bloques políticos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
