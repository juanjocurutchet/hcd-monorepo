import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { isAdmin } from "@/lib/utils/server-utils"

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

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id, error } = await validateAdminAndId(request, params.id)
    if (error) return error

    const messages = await sql`
      SELECT id, name, email, phone, organization, subject, message, type, is_read, created_at
      FROM contact_messages
      WHERE id = ${id}
    `

    if (messages.length === 0) {
      return NextResponse.json({ error: "Mensaje no encontrado" }, { status: 404 })
    }

    return NextResponse.json(messages[0])
  } catch (error: any) {
    console.error(`Error obteniendo mensaje con id ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id, error } = await validateAdminAndId(request, params.id)
    if (error) return error

    await sql`
      UPDATE contact_messages
      SET is_read = true, updated_at = NOW()
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error actualizando mensaje con id ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id, error } = await validateAdminAndId(request, params.id)
    if (error) return error

    await sql`
      DELETE FROM contact_messages
      WHERE id = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error(`Error eliminando mensaje con id ${params.id}:`, error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}
