import { db } from "@/lib/db-singleton"
import { sessionFiles } from "@/lib/db/schema"
import { uploadFile, uploadProjectFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { and, desc, eq, like, sql } from "drizzle-orm"
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
    let numeroExpediente = formData.get("numeroExpediente") as string | null
    const fechaEntrada = formData.get("fechaEntrada") as string
    const titulo = formData.get("titulo") as string
    const descripcion = formData.get("descripcion") as string
    const origen = formData.get("origen") as string
    const prefijoOrigen = formData.get("prefijoOrigen") as string
    const autor = formData.get("autor") as string
    const tipo = formData.get("tipo") as string
    const archivo = formData.get("archivo") as File | null

    if (!fechaEntrada || !titulo || !origen || !prefijoOrigen || !autor || !tipo) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    // Numeración automática solo si no se recibe numeroExpediente
    if (!numeroExpediente || numeroExpediente.trim() === "") {
      // Obtener año de la fecha de entrada
      const year = new Date(fechaEntrada).getFullYear();
      // Buscar el mayor número para ese año y prefijo
      // El formato es: [prefijoOrigen]-[número]/[año]
      const prefixPattern = `${prefijoOrigen}-%/${year}`;
      const files = await db
        .select()
        .from(sessionFiles)
        .where(and(
          like(sessionFiles.numeroExpediente, prefixPattern),
          sql`EXTRACT(YEAR FROM ${sessionFiles.fechaEntrada}) = ${year}`,
          eq(sessionFiles.prefijoOrigen, prefijoOrigen)
        ))
        .orderBy(desc(sessionFiles.id));
      // Extraer el mayor número
      let maxNum = 0;
      for (const f of files) {
        const match = f.numeroExpediente.match(/^[^-]+-(\d+)\/(\d{4})$/);
        if (match && match[1] && match[2] === String(year)) {
          const num = parseInt(match[1], 10);
          if (num > maxNum) maxNum = num;
        }
      }
      const nextNum = maxNum + 1;
      numeroExpediente = `${prefijoOrigen}-${nextNum}/${year}`;
    } else {
      // Validar que no exista duplicado para ese año y prefijo
      const year = new Date(fechaEntrada).getFullYear();
      const exists = await db
        .select()
        .from(sessionFiles)
        .where(and(
          eq(sessionFiles.numeroExpediente, numeroExpediente),
          sql`EXTRACT(YEAR FROM ${sessionFiles.fechaEntrada}) = ${year}`,
          eq(sessionFiles.prefijoOrigen, prefijoOrigen)
        ));
      if (exists.length > 0) {
        return NextResponse.json({ error: "Ya existe un expediente con ese número para este año y prefijo." }, { status: 400 });
      }
    }

    let fileUrl = null
    if (archivo && archivo.size > 0) {
      fileUrl = await uploadProjectFile(archivo, {
        origen: origen,
        fechaEntrada: fechaEntrada,
        autor: autor
      })
    }

    const result = await db.insert(sessionFiles).values({
      sessionId: sessionId,
      numeroExpediente: numeroExpediente,
      fechaEntrada: new Date(fechaEntrada),
      titulo: titulo,
      descripcion: descripcion || null,
      origen: origen,
      prefijoOrigen: prefijoOrigen,
      autor: autor,
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
    const autor = formData.get("autor") as string
    const tipo = formData.get("tipo") as string

    if (!fileId || isNaN(fileId)) {
      return NextResponse.json({ error: "ID de archivo inválido" }, { status: 400 })
    }

    if (!numeroExpediente || !fechaEntrada || !titulo || !origen || !prefijoOrigen || !autor || !tipo) {
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
        autor: autor,
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