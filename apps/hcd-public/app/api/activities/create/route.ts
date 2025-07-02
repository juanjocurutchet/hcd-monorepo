import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"

export async function POST(request: NextRequest) {
  try {
    // ✅ Verificar permisos con await
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
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

    // ✅ Procesar fecha correctamente
    const date = new Date(dateStr)

    // ✅ Subir imagen si existe y tiene contenido
    let imageUrl = null
    if (image && image.size > 0 && image.name !== 'undefined') {
      imageUrl = await uploadFile(image, "activities")
    }

    // Crear actividad
    const result = await sql`
      INSERT INTO activities (
        title, description, date, image_url, is_published
      ) VALUES (
        ${title}, ${description}, ${date}, ${imageUrl}, ${isPublished}
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      id: result[0].id,
    })
  } catch (error: any) {
    console.error("Error al crear actividad:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}