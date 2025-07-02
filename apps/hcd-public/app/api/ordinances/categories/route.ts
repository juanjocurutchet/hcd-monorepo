import { sql } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await sql`
      SELECT name, COUNT(*) as count
      FROM ordinance_categories oc
      LEFT JOIN ordinances o ON oc.name = o.category
      GROUP BY oc.name
      ORDER BY oc.name
    `

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error en GET /api/ordinances/categories:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}