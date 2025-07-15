import { db } from "@/lib/db-singleton"
import { sessionFiles } from "@/lib/db/schema"
import { isAdmin } from "@/lib/utils/server-utils"
import { eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, context: { params: { id: string; fileId: string } }) {
  try {
    const params = await context.params
    const sessionId = Number(params.id)
    const fileId = Number(params.fileId)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "ID de sesión inválido" }, { status: 400 })
    }

    if (isNaN(fileId)) {
      return NextResponse.json({ error: "ID de archivo inválido" }, { status: 400 })
    }

    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const result = await db.delete(sessionFiles)
      .where(eq(sessionFiles.id, fileId))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Archivo eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar proyecto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}