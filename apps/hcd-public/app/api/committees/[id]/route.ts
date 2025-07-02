import { db } from "@/lib/db-singleton"
import { commissionFiles, committeeMembers, committees, councilMembers } from "@/lib/db/schema"
import { uploadFile } from "@/lib/storage"
import { isAdmin } from "@/lib/utils/server-utils"
import { eq } from "drizzle-orm"
import { type NextRequest, NextResponse } from "next/server"

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

export async function PUT(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error

    const formData = await request.formData()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const presidentId = formData.get("presidentId") || null
    const secretaryId = formData.get("secretaryId") || null
    const isActive = formData.get("isActive") === "true"
    const memberIds = JSON.parse(formData.get("memberIds") as string || "[]")
    const proyectosRaw = formData.get("proyectos") as string || "[]"
    const proyectos = JSON.parse(proyectosRaw)

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Actualizar comisión
    const result = await db.update(committees)
      .set({
        name: name,
        description: description,
        presidentId: presidentId || null,
        secretaryId: secretaryId || null,
        isActive: isActive ?? true
      })
      .where(eq(committees.id, numericId))
      .returning()

    if (result.length === 0) {
      return NextResponse.json({ error: "Comisión no encontrada" }, { status: 404 })
    }

    // Actualizar miembros - eliminar existentes y agregar nuevos
    await db.delete(committeeMembers).where(eq(committeeMembers.committeeId, numericId))
    if (memberIds && memberIds.length > 0) {
      for (const memberId of memberIds) {
        await db.insert(committeeMembers)
          .values({
            committeeId: numericId,
            councilMemberId: memberId
          })
      }
    }

    // Solo manejar proyectos si estamos CREANDO una nueva comisión
    // Si estamos editando, los proyectos se manejan individualmente a través del endpoint /files
    if (proyectos.length > 0) {
      // Eliminar proyectos existentes y volver a insertar los nuevos (solo para creación)
      await db.delete(commissionFiles).where(eq(commissionFiles.committeeId, numericId))
      for (let i = 0; i < proyectos.length; i++) {
        const p = proyectos[i]
        let fileUrl = null
        const file = formData.get(`archivo_${i}`) as File | null
        if (file && file.size > 0) {
          fileUrl = await uploadFile(file, "comisiones")
        }
        await db.insert(commissionFiles)
          .values({
            committeeId: numericId,
            expedienteNumber: p.expedienteNumber,
            fechaEntrada: new Date(p.fechaEntrada),
            descripcion: p.descripcion,
            despacho: p.despacho,
            fechaDespacho: p.fechaDespacho ? new Date(p.fechaDespacho) : null,
            fileUrl: fileUrl
          })
      }
    }
    // Si proyectos.length === 0, no hacer nada con los proyectos (mantener los existentes)

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error en PUT:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    const { id: numericId, error } = await validateAdminAndId(request, idParam)
    if (error) return error

    // Eliminar primero los miembros de la comisión
    await db.delete(committeeMembers).where(eq(committeeMembers.committeeId, numericId))

    // Eliminar la comisión
    const result = await db.delete(committees).where(eq(committees.id, numericId)).returning()

    return result.length
      ? NextResponse.json({ message: "Comisión eliminada correctamente" })
      : NextResponse.json({ error: "Comisión no encontrada" }, { status: 404 })
  } catch (error) {
    console.error("Error al eliminar:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, context: { params: { id: string } }) {
  try {
    const params = await context.params
    const idParam = params.id
    const id = Number.parseInt(idParam)

    if (isNaN(id)) {
      return NextResponse.json({ error: "ID inválido" }, { status: 400 })
    }

    // Obtener la comisión
    const comisionResult = await db
      .select()
      .from(committees)
      .where(eq(committees.id, id))
      .limit(1)

    if (comisionResult.length === 0) {
      return NextResponse.json({ error: "Comisión no encontrada" }, { status: 404 })
    }

    const comision = comisionResult[0]

    // Obtener los miembros de la comisión
    const miembros = await db
      .select({
        id: councilMembers.id,
        name: councilMembers.name
      })
      .from(committeeMembers)
      .leftJoin(councilMembers, eq(committeeMembers.councilMemberId, councilMembers.id))
      .where(eq(committeeMembers.committeeId, id))

    return NextResponse.json({
      ...comision,
      members: miembros
    })
  } catch (error) {
    console.error("Error en GET:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}