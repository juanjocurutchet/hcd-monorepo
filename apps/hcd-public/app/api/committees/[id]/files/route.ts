import { db } from "@/lib/db-singleton"
import { commissionFiles } from "@/lib/db/schema"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  console.log("GET /api/committees/[id]/files - Iniciando")
  try {
    const params = await context.params
    console.log("Params recibidos:", params)
    const committeeId = Number(params.id)
    console.log("Committee ID:", committeeId)
    if (isNaN(committeeId)) {
      console.log("ID inválido")
      return NextResponse.json({ error: "ID de comisión inválido" }, { status: 400 })
    }

    console.log("Probando conexión a la base de datos...")

    // Prueba simple de conexión
    try {
      const testQuery = await db.select().from(commissionFiles).limit(1)
      console.log("Conexión exitosa, prueba query:", testQuery)

      // Verificar si hay datos en la tabla
      const allFiles = await db.select().from(commissionFiles)
      console.log("Todos los archivos en la tabla:", allFiles)

    } catch (dbError) {
      console.error("Error en prueba de conexión:", dbError)
      return NextResponse.json({ error: "Error de conexión a la base de datos" }, { status: 500 })
    }

    console.log("Ejecutando consulta SQL para committee_id:", committeeId)

    // Consulta real
    const files = await db.select().from(commissionFiles).where(eq(commissionFiles.committeeId, committeeId))

    console.log("Archivos encontrados:", files)
    return NextResponse.json(files)

  } catch (error) {
    console.error("Error al obtener archivos de comisión:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack trace")
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const committeeId = Number(params.id)
    if (isNaN(committeeId)) {
      return NextResponse.json({ error: "ID de comisión inválido" }, { status: 400 })
    }
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const expedienteNumber = formData.get("expedienteNumber") as string
    const fechaEntrada = formData.get("fechaEntrada") as string
    const descripcion = formData.get("descripcion") as string
    const despacho = formData.get("despacho") === "true"
    const fechaDespacho = formData.get("fechaDespacho") as string
    const archivo = formData.get("archivo") as File | null

    if (!expedienteNumber || !fechaEntrada || !descripcion) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    let fileUrl = null
    if (archivo && archivo.size > 0) {
      fileUrl = await uploadFile(archivo, "comisiones")
    }

    const result = await db.insert(commissionFiles).values({
      committeeId: committeeId,
      expedienteNumber: expedienteNumber,
      fechaEntrada: new Date(fechaEntrada),
      descripcion: descripcion,
      despacho: despacho,
      fechaDespacho: fechaDespacho ? new Date(fechaDespacho) : null,
      fileUrl: fileUrl
    }).returning()

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error al agregar proyecto a comisión:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const committeeId = Number(params.id)
    if (isNaN(committeeId)) {
      return NextResponse.json({ error: "ID de comisión inválido" }, { status: 400 })
    }
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const fileId = Number(formData.get("fileId"))
    const expedienteNumber = formData.get("expedienteNumber") as string
    const fechaEntrada = formData.get("fechaEntrada") as string
    const descripcion = formData.get("descripcion") as string
    const despacho = formData.get("despacho") === "true"
    const fechaDespacho = formData.get("fechaDespacho") as string

    if (!fileId || isNaN(fileId)) {
      return NextResponse.json({ error: "ID de archivo inválido" }, { status: 400 })
    }

    if (!expedienteNumber || !fechaEntrada || !descripcion) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    const result = await db.update(commissionFiles)
      .set({
        expedienteNumber: expedienteNumber,
        fechaEntrada: new Date(fechaEntrada),
        descripcion: descripcion,
        despacho: despacho,
        fechaDespacho: fechaDespacho ? new Date(fechaDespacho) : null
      })
      .where(eq(commissionFiles.id, fileId))
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
    const committeeId = Number(params.id)
    if (isNaN(committeeId)) {
      return NextResponse.json({ error: "ID de comisión inválido" }, { status: 400 })
    }
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const fileId = Number(formData.get("fileId"))

    if (!fileId || isNaN(fileId)) {
      return NextResponse.json({ error: "ID de archivo inválido" }, { status: 400 })
    }

    const result = await db.delete(commissionFiles)
      .where(eq(commissionFiles.id, fileId))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ message: "Proyecto eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar proyecto:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}