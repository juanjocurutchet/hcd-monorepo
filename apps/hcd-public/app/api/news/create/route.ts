// app/api/news/create/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { createNews } from "@/lib/services/news-service"
import { getAuthenticatedUserId } from "@/lib/utils/server-utils"

export async function POST(request: NextRequest) {
  try {
    // ✅ Obtener usuario autenticado con NextAuth (incluye verificación de admin)
    const authorId = await getAuthenticatedUserId(request)

    const formData = await request.formData()

    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string | null
    const image = formData.get("image") as File | null
    const isPublished = formData.get("isPublished") === "true"

    if (!title || !content) {
      return NextResponse.json({ error: "Título y contenido son requeridos" }, { status: 400 })
    }

    // ✅ Usar tu servicio existente
    const result = await createNews({
      title,
      content,
      excerpt: excerpt || undefined,
      image: image && image.size > 0 && image.name !== 'undefined' ? image : null,
      authorId,
      isPublished,
    })

    return NextResponse.json({
      success: true,
      id: result.id,
    })
  } catch (error: any) {
    console.error("Error al crear noticia:", error)

    // ✅ Manejo específico de errores de autenticación
    if (error.message === "No hay sesión activa" || error.message === "No autorizado") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}