import { sql } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // ✅ Verificar permisos con await
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()

    const name = formData.get("name") as string
    const position = formData.get("position") as string | null
    const blockIdRaw = formData.get("blockId") as string | null
    const blockId = blockIdRaw && blockIdRaw !== "-1" ? Number(blockIdRaw) : null
    const mandate = formData.get("mandate") as string | null
    const bio = formData.get("bio") as string | null
    const image = formData.get("image") as File | null
    const isActiveRaw = formData.getAll("isActive")
    const isActive = isActiveRaw.includes("true")
    const seniorPosition = formData.get("seniorPosition") as string | null

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // ✅ Validación mejorada de imagen
    let imageUrl = null
    if (image && image.size > 0 && image.name !== 'undefined') {
      console.log(`Subiendo imagen: ${image.name}, tamaño: ${image.size} bytes`)
      imageUrl = await uploadFile(image, "council-members")
    } else if (image) {
      console.log(`Archivo inválido detectado: nombre="${image.name}", tamaño=${image.size}`)
    }

    // Crear concejal
    const result = await sql`
      INSERT INTO council_members (
        name, position, senior_position, block_id, mandate, image_url, bio, is_active
      ) VALUES (
        ${name}, ${position}, ${seniorPosition}, ${blockId}, ${mandate}, ${imageUrl}, ${bio}, ${isActive}
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      id: result[0].id,
    })
  } catch (error: any) {
    console.error("Error al crear concejal:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}