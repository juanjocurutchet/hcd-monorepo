import { db } from "@/lib/db-singleton"
import { sessionFiles } from "@/lib/db/schema"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const sessionId = Number(params.id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "ID de sesión inválido" }, { status: 400 })
    }

    const files = await db
      .select()
      .from(sessionFiles)
      .where(eq(sessionFiles.sessionId, sessionId))
      .orderBy(sessionFiles.fechaEntrada)

    return NextResponse.json(files)
  } catch (error) {
    console.error("Error al obtener archivos de sesión:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const sessionId = Number(params.id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "ID de sesión inválido" }, { status: 400 })
    }

    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const numeroExpediente = formData.get("numeroExpediente") as string
    const fechaEntrada = formData.get("fechaEntrada") as string
    const titulo = formData.get("titulo") as string
    const descripcion = formData.get("descripcion") as string
    const origen = formData.get("origen") as string
    const prefijoOrigen = formData.get("prefijoOrigen") as string
    const tipo = formData.get("tipo") as string
    const archivo = formData.get("archivo") as File | null

    if (!numeroExpediente || !fechaEntrada || !titulo || !origen || !prefijoOrigen || !tipo) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    let fileUrl = null
    if (archivo && archivo.size > 0) {
      fileUrl = await uploadFile(archivo, "sesiones")
    }

    const result = await db.insert(sessionFiles).values({
      sessionId: sessionId,
      numeroExpediente: numeroExpediente,
      fechaEntrada: new Date(fechaEntrada),
      titulo: titulo,
      descripcion: descripcion || null,
      origen: origen,
      prefijoOrigen: prefijoOrigen,
      tipo: tipo,
      fileUrl: fileUrl
    }).returning()

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al agregar proyecto a sesión:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const sessionId = Number(params.id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "ID de sesión inválido" }, { status: 400 })
    }

    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const fileId = Number(formData.get("fileId"))
    const numeroExpediente = formData.get("numeroExpediente") as string
    const fechaEntrada = formData.get("fechaEntrada") as string
    const titulo = formData.get("titulo") as string
    const descripcion = formData.get("descripcion") as string
    const origen = formData.get("origen") as string
    const prefijoOrigen = formData.get("prefijoOrigen") as string
    const tipo = formData.get("tipo") as string

    if (!fileId || isNaN(fileId)) {
      return NextResponse.json({ error: "ID de archivo inválido" }, { status: 400 })
    }

    if (!numeroExpediente || !fechaEntrada || !titulo || !origen || !prefijoOrigen || !tipo) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    const result = await db.update(sessionFiles)
      .set({
        numeroExpediente: numeroExpediente,
        fechaEntrada: new Date(fechaEntrada),
        titulo: titulo,
        descripcion: descripcion || null,
        origen: origen,
        prefijoOrigen: prefijoOrigen,
        tipo: tipo
      })
      .where(eq(sessionFiles.id, fileId))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al actualizar proyecto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const sessionId = Number(params.id)

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "ID de sesión inválido" }, { status: 400 })
    }

    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const url = new URL(request.url)
    const fileId = url.pathname.split('/').pop()

    if (!fileId || isNaN(Number(fileId))) {
      return NextResponse.json({ error: "ID de archivo inválido" }, { status: 400 })
    }

    const result = await db.delete(sessionFiles)
      .where(eq(sessionFiles.id, Number(fileId)))
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