import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
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

// ✅ GET público (mantener como está)
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Obtener actividad
    const activities = await sql`
      SELECT id, title, description, date, image_url as "imageUrl", is_published as "isPublished"
      FROM activities
      WHERE id = ${id}
    `

    if (activities.length === 0) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 })
    }

    // Obtener participantes
    const participants = await sql`
      SELECT cm.id, cm.name, cm.position, cm.block_id as "blockId", pb.name as "blockName"
      FROM activity_participants ap
      JOIN council_members cm ON ap.council_member_id = cm.id
      LEFT JOIN political_blocks pb ON cm.block_id = pb.id
      WHERE ap.activity_id = ${id}
      ORDER BY cm.name
    `

    return NextResponse.json({
      ...activities[0],
      participants,
    })
  } catch (error) {
    console.error(`Error obteniendo actividad con id ${context.params.id}:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// ✅ PUT para actualizar (protegido)
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error

    // Verificar que la actividad existe
    const existing = await sql`SELECT id FROM activities WHERE id = ${numericId}`
    if (existing.length === 0) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 })
    }

    const formData = await request.formData()

    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const dateStr = formData.get("date") as string
    const image = formData.get("image") as File | null
    const isPublished = formData.get("isPublished") === "true"

    if (!title || !description || !dateStr) {
      return NextResponse.json({ error: "Título, descripción y fecha son requeridos" }, { status: 400 })
    }

    const date = new Date(dateStr)

    // Obtener imagen actual
    const current = await sql`SELECT image_url FROM activities WHERE id = ${numericId}`
    let imageUrl = current[0]?.image_url || null

    // Subir nueva imagen si se proporciona
    if (image && image.size > 0 && image.name !== 'undefined') {
      imageUrl = await uploadFile(image, "activities")
    }

    // Actualizar actividad
    const result = await sql`
      UPDATE activities
      SET title = ${title},
          description = ${description},
          date = ${date},
          image_url = ${imageUrl},
          is_published = ${isPublished}
      WHERE id = ${numericId}
      RETURNING *
    `

    return NextResponse.json(result[0])
  } catch (error: any) {
    console.error("Error al actualizar actividad:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

// ✅ DELETE para eliminar (protegido)
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error

    // Verificar que la actividad existe
    const existing = await sql`SELECT id FROM activities WHERE id = ${numericId}`
    if (existing.length === 0) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 })
    }

    // Eliminar participantes primero (foreign key constraint)
    await sql`DELETE FROM activity_participants WHERE activity_id = ${numericId}`

    // Eliminar actividad
    await sql`DELETE FROM activities WHERE id = ${numericId}`

    return NextResponse.json({ message: "Actividad eliminada correctamente" })
  } catch (error: any) {
    console.error("Error al eliminar actividad:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}