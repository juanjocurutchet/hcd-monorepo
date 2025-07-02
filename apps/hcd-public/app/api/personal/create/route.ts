import { sql } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }
    const formData = await request.formData()
    const name = formData.get("name") as string
    const position = formData.get("position") as string
    const blockIdRaw = formData.get("blockId") as string | null
    const blockId = blockIdRaw && blockIdRaw !== "-1" ? Number(blockIdRaw) : null
    const bio = formData.get("bio") as string | null
    const image = formData.get("image") as File | null
    const email = formData.get("email") as string | null
    const telefono = formData.get("telefono") as string | null
    const facebook = formData.get("facebook") as string | null
    const instagram = formData.get("instagram") as string | null
    const twitter = formData.get("twitter") as string | null
    let imageUrl = null
    if (image && image.size > 0 && image.name !== 'undefined') {
      imageUrl = await uploadFile(image, "staff")
    }
    const result = await sql`
      INSERT INTO staff (name, position, block_id, bio, image_url, email, telefono, facebook, instagram, twitter)
      VALUES (${name}, ${position}, ${blockId}, ${bio}, ${imageUrl}, ${email}, ${telefono}, ${facebook}, ${instagram}, ${twitter})
      RETURNING id
    `
    return NextResponse.json({ success: true, id: result[0].id })
  } catch (error: any) {
    console.error("Error al crear personal:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}