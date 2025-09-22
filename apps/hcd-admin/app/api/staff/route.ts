import { NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const position = searchParams.get("position")
    let result
    if (position) {
      result = await sql`
        SELECT * FROM staff WHERE position = ${position}
      `
    } else {
      result = await sql`SELECT * FROM staff`
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error en GET /api/staff:", error)
    return NextResponse.json({ error: "Error al obtener staff" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}