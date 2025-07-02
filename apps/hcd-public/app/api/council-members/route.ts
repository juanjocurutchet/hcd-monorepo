import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const blockId = searchParams.get("blockId")
    const isActive = searchParams.get("isActive") !== "false"

    let query = sql`
      SELECT cm.id, cm.name, cm.position, cm.block_id, cm.mandate, cm.image_url, cm.bio, cm.is_active,
             pb.name as block_name, pb.color as block_color
      FROM council_members cm
      LEFT JOIN political_blocks pb ON cm.block_id = pb.id
      WHERE 1=1    `


    if (blockId) {
      query = sql`${query} AND cm.block_id = ${Number.parseInt(blockId)}`
    }

    if (isActive) {
      query = sql`${query} AND cm.is_active = true`
    }

    query = sql`${query}
      ORDER BY
        CASE
          WHEN cm.position = 'Presidente' THEN 1
          WHEN cm.position LIKE 'Vicepresidente%' THEN 2
          ELSE 3
        END,
        cm.name
    `

    const members = await query

    return NextResponse.json(members)
  } catch (error) {
    console.error("Error obteniendo concejales:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
