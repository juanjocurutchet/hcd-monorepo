import { sql } from "@/lib/db"
import { isAdmin } from "@/lib/utils/server-utils"; // ✅ Importar
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // ✅ Verificar permisos
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const color = formData.get("color") as string
    const presidentIdStr = formData.get("presidentId") as string
    const presidentId = presidentIdStr === "-1" ? null : Number(presidentIdStr)
    const miembrosStr = formData.get("miembros") as string
    const miembros = miembrosStr ? JSON.parse(miembrosStr) as number[] : []

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Crear el bloque
    const result = await sql`
      INSERT INTO political_blocks (name, president_id, color)
      VALUES (${name}, ${presidentId}, ${color})
      RETURNING *
    `

    const nuevoBloque = result[0]

    // Asignar miembros al bloque
    if (miembros.length > 0) {
      await sql`
        UPDATE council_members
        SET block_id = ${nuevoBloque.id}
        WHERE id = ANY(${miembros})
      `
    }

    return NextResponse.json({ success: true, block: nuevoBloque })
  } catch (error) {
    console.error("Error creando bloque político:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}