import { sql } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { type NextRequest, NextResponse } from "next/server"

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

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params;
    const idParam = params.id;
    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error

    const formData = await request.formData()
    const name = formData.get("name") as string
    const position = formData.get("position") as string
    const blockIdRaw = formData.get("blockId") as string | null
    const block_id = blockIdRaw && blockIdRaw !== "-1" ? Number(blockIdRaw) : null
    const mandate = formData.get("mandate") as string
    const bio = formData.get("bio") as string
    const isActiveRaw = formData.getAll("isActive")
    const isActive = isActiveRaw.includes("true")
    const image = formData.get("image") as File | null
    const seniorPosition = formData.get("seniorPosition") as string | null

    const current = await sql`SELECT image_url FROM council_members WHERE id = ${numericId}`
    let image_url = current[0]?.image_url || null

    if (image && image.size > 0) {
      image_url = await uploadFile(image, "concejales")
    }

    const result = await sql`
      UPDATE council_members
      SET name = ${name},
          position = ${position},
          senior_position = ${seniorPosition},
          block_id = ${block_id},
          mandate = ${mandate},
          image_url = ${image_url},
          bio = ${bio},
          is_active = ${isActive}
      WHERE id = ${numericId}
      RETURNING *
    `

    return result.length
      ? NextResponse.json(result[0])
      : NextResponse.json({ error: "Concejal no encontrado" }, { status: 404 })

  } catch (error) {
    console.error("Error en PUT:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error

    // Desvincular como presidente en committees
    await sql`
      UPDATE committees
      SET president_id = NULL
      WHERE president_id = ${numericId}
    `

    // Desvincular como secretario en committees
    await sql`
      UPDATE committees
      SET secretary_id = NULL
      WHERE secretary_id = ${numericId}
    `

    // Eliminar participación en committee_members
    await sql`
      DELETE FROM committee_members
      WHERE council_member_id = ${numericId}
    `

    // Eliminar participación en activity_participants
    await sql`
      DELETE FROM activity_participants
      WHERE council_member_id = ${numericId}
    `

    // Finalmente, eliminar el concejal
    const result = await sql`
      DELETE FROM council_members
      WHERE id = ${numericId}
      RETURNING *
    `

    return result.length
      ? NextResponse.json({ message: "Concejal eliminado correctamente" })
      : NextResponse.json({ error: "Concejal no encontrado" }, { status: 404 })
  } catch (error) {
    console.error("Error al eliminar:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}