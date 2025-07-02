// app/api/news/[id]/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { getNewsById, updateNews, deleteNews } from "@/lib/services/news-service"
import { getAuthenticatedUserId } from "@/lib/utils/server-utils"

async function validateAdminAndId(request: NextRequest, idParam: string) {
  // ✅ Obtener usuario autenticado (incluye verificación de admin)
  await getAuthenticatedUserId(request)

  const id = Number.parseInt(idParam)
  if (isNaN(id)) {
    throw new Error("ID inválido")
  }

  return { id }
}

// ✅ GET público (obtener noticia individual)
export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const id = Number.parseInt(params.id)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // ✅ Usar tu servicio existente
    const noticia = await getNewsById(id)

    if (!noticia) {
      return NextResponse.json({ error: "Noticia no encontrada" }, { status: 404 })
    }

    return NextResponse.json(noticia)
  } catch (error) {
    console.error(`Error obteniendo noticia con id ${context.params.id}:`, error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// ✅ PUT para actualizar (protegido)
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const { id: numericId } = await validateAdminAndId(request, params.id)

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
    const result = await updateNews({
      id: numericId,
      title,
      content,
      excerpt: excerpt || undefined,
      image: image && image.size > 0 && image.name !== 'undefined' ? image : null,
      isPublished,
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("Error al actualizar noticia:", error)

    // ✅ Manejo específico de errores de autenticación
    if (error.message === "No hay sesión activa" || error.message === "No autorizado") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    if (error.message === "ID inválido") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

// ✅ DELETE para eliminar (protegido)
export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const { id: numericId } = await validateAdminAndId(request, params.id)

    // ✅ Usar tu servicio existente
    const result = await deleteNews(numericId)

    return NextResponse.json({ message: "Noticia eliminada correctamente" })
  } catch (error: any) {
    console.error("Error al eliminar noticia:", error)

    // ✅ Manejo específico de errores de autenticación
    if (error.message === "No hay sesión activa" || error.message === "No autorizado") {
      return NextResponse.json({ error: error.message }, { status: 403 })
    }

    if (error.message === "ID inválido") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}