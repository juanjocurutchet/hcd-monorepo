import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    let query = `SELECT id, approval_number, title, year FROM ordinances WHERE 1=1`
    const params: any[] = []
    if (search) {
      query += ` AND (CAST(approval_number AS TEXT) ILIKE $1 OR title ILIKE $1)`
      params.push(`%${search}%`)
    }
    query += ` ORDER BY year DESC, approval_number DESC LIMIT 50`
    const result = await sql.query(query, params)
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error en GET /api/ordinances/lista-simple:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}