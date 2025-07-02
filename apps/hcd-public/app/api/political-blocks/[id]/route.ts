import { sql } from "@/lib/db"
import { isAdmin } from "@/lib/utils/server-utils"; // ✅ Importar
import { NextRequest, NextResponse } from "next/server"

// ✅ Función de validación compartida
async function validateAdminAndId(request: NextRequest, idParam: string) {
  if (!(await isAdmin(request))) {
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) }
  }

  const id = Number.parseInt(idParam)
  if (isNaN(id)) {
    return { error: NextResponse.json({ error: "ID inválido" }, { status: 400 }) }
  }

  return { id }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { id: numericId, error } = await validateAdminAndId(request, id)
    if (error) return error

    await sql`DELETE FROM political_blocks WHERE id = ${numericId}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar bloque:", error)
    return NextResponse.json({ error: "Error al eliminar bloque" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { id: numericId, error } = await validateAdminAndId(request, id)
    if (error) return error

    const formData = await request.formData()
    const name = formData.get("name") as string
    const color = formData.get("color") as string
    const presidentIdStr = formData.get("presidentId") as string
    const presidentId = presidentIdStr === "-1" ? null : Number.parseInt(presidentIdStr)
    const miembrosStr = formData.get("miembros") as string
    const miembros = miembrosStr ? JSON.parse(miembrosStr) as number[] : []

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Actualizar el bloque
    await sql`
      UPDATE political_blocks
      SET
        name = ${name},
        color = ${color},
        president_id = ${presidentId}
      WHERE id = ${numericId}
    `

    // Primero, quitar todos los concejales de este bloque
    await sql`
      UPDATE council_members
      SET block_id = NULL
      WHERE block_id = ${numericId}
    `

    // Luego, asignar los nuevos miembros
    if (miembros.length > 0) {
      await sql`
        UPDATE council_members
        SET block_id = ${numericId}
        WHERE id = ANY(${miembros})
      `
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando bloque político:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}