import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await sql`
      SELECT name, COUNT(*) as count
      FROM ordinance_types ot
      LEFT JOIN ordinances o ON ot.name = o.type
      GROUP BY ot.name
      ORDER BY ot.name
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error en GET /api/ordinances/types:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}