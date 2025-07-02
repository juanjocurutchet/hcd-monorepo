import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const committees = await sql`
      SELECT
        c.*,
        p.name as president_name,
        s.name as secretary_name,
        COALESCE(
          json_agg(
            json_build_object(
              'id', cm.council_member_id,
              'name', m.name
            ) ORDER BY m.name
          ) FILTER (WHERE cm.council_member_id IS NOT NULL),
          '[]'::json
        ) as members
      FROM committees c
      LEFT JOIN council_members p ON c.president_id = p.id
      LEFT JOIN council_members s ON c.secretary_id = s.id
      LEFT JOIN committee_members cm ON c.id = cm.committee_id
      LEFT JOIN council_members m ON cm.council_member_id = m.id
      GROUP BY c.id, p.name, s.name
      ORDER BY c.name
    `

    return NextResponse.json(committees)
  } catch (error) {
    console.error("Error al obtener comisiones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}