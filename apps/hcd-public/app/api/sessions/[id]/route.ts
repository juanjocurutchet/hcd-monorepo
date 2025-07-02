import { type NextRequest, NextResponse } from "next/server"
import { updateSession, deleteSession, getSessionById } from "@/lib/services/session-service"
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

// /api/sessions/[id]/route.ts - Añadir logs temporales
export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    console.log("🔍 PUT endpoint called with ID:", idParam) // Debug

    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error

    // Verificar que la sesión existe
    const existingSession = await getSessionById(numericId)
    if (!existingSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    console.log("🔍 Existing session found:", existingSession.id) // Debug

    const formData = await request.formData()

    const dateStr = formData.get("date") as string
    const type = formData.get("type") as string
    const videoUrl = formData.get("videoUrl") as string | null
    const isPublished = formData.get("isPublished") === "true"

    console.log("🔍 Form data received:", { dateStr, type, videoUrl, isPublished }) // Debug

    if (!dateStr || !type) {
      return NextResponse.json({ error: "Fecha y tipo son requeridos" }, { status: 400 })
    }

    // ✅ Crear fecha sin timezone para evitar conversiones
    const [year, month, day] = dateStr.split('-').map(Number)
    const date = new Date(year, month - 1, day)

    console.log("🔍 Processed date:", date) // Debug

    const agendaFile = formData.get("agendaFile") as File | null
    const minutesFile = formData.get("minutesFile") as File | null
    const audioFile = formData.get("audioFile") as File | null

    console.log("🔍 About to call updateSession...") // Debug

    const result = await updateSession({
      id: numericId,
      date,
      type,
      agendaFile: (agendaFile && agendaFile.size > 0) ? agendaFile : null,
      minutesFile: (minutesFile && minutesFile.size > 0) ? minutesFile : null,
      audioFile: (audioFile && audioFile.size > 0) ? audioFile : null,
      videoUrl: videoUrl || undefined,
      isPublished,
    })

    console.log("✅ updateSession completed:", result?.id) // Debug

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("❌ Error in PUT endpoint:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error

    // Verificar que la sesión existe
    const existingSession = await getSessionById(numericId)
    if (!existingSession) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 })
    }

    await deleteSession(numericId)

    return NextResponse.json({ message: "Sesión eliminada correctamente" })
  } catch (error: any) {
    console.error("Error al eliminar sesión:", error)
    return NextResponse.json({ error: error.message || "Error interno del servidor" }, { status: 500 })
  }
}