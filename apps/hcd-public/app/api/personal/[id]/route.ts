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

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const { id: idParam } = context.params
    const id = Number.parseInt(idParam)
    if (isNaN(id)) return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    const result = await sql`SELECT * FROM staff WHERE id = ${id}`
    return result.length
      ? NextResponse.json(result[0])
      : NextResponse.json({ error: "Personal no encontrado" }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
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
    const blockId = blockIdRaw && blockIdRaw !== "-1" ? Number(blockIdRaw) : null
    const bio = formData.get("bio") as string
    const image = formData.get("image") as File | null
    const email = formData.get("email") as string | null
    const telefono = formData.get("telefono") as string | null
    const facebook = formData.get("facebook") as string | null
    const instagram = formData.get("instagram") as string | null
    const twitter = formData.get("twitter") as string | null
    const current = await sql`SELECT image_url FROM staff WHERE id = ${numericId}`
    let imageUrl = current[0]?.image_url || null
    if (image && image.size > 0) {
      imageUrl = await uploadFile(image, "staff")
    }
    const result = await sql`
      UPDATE staff
      SET name = ${name},
          position = ${position},
          block_id = ${blockId},
          bio = ${bio},
          image_url = ${imageUrl},
          email = ${email},
          telefono = ${telefono},
          facebook = ${facebook},
          instagram = ${instagram},
          twitter = ${twitter}
      WHERE id = ${numericId}
      RETURNING *
    `
    return result.length
      ? NextResponse.json(result[0])
      : NextResponse.json({ error: "Personal no encontrado" }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error
    const result = await sql`
      DELETE FROM staff
      WHERE id = ${numericId}
      RETURNING *
    `
    return result.length
      ? NextResponse.json({ message: "Personal eliminado correctamente" })
      : NextResponse.json({ error: "Personal no encontrado" }, { status: 404 })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}