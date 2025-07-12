import { db } from "@/lib/db-singleton"
import { councilMembers, politicalBlocks } from "@/lib/db/schema"
import { isAdmin } from "@/lib/utils/server-utils"
import { eq, inArray } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

// Función de validación compartida
async function validateAdminAndId(request: NextRequest, idParam: string) {
  console.log("validateAdminAndId - Iniciando validación")

  const isAdminResult = await isAdmin(request)
  console.log("Resultado de isAdmin:", isAdminResult)

  if (!isAdminResult) {
    console.log("Usuario no es admin")
    return { error: NextResponse.json({ error: "No autorizado" }, { status: 403 }) }
  }

  const id = Number.parseInt(idParam)
  console.log("ID parseado:", id)

  if (isNaN(id)) {
    console.log("ID inválido")
    return { error: NextResponse.json({ error: "ID inválido" }, { status: 400 }) }
  }

  console.log("Validación exitosa, ID:", id)
  return { id }
}

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    console.log("GET /api/political-blocks/[id] - Iniciando")
    const { id } = await context.params
    console.log("ID recibido:", id)

    const { id: numericId, error } = await validateAdminAndId(request, id)
    if (error) {
      console.log("Error de validación:", error)
      return error
    }

    console.log("ID numérico:", numericId)

    // Obtener el bloque
    const blockResult = await db
      .select({
        id: politicalBlocks.id,
        name: politicalBlocks.name,
        color: politicalBlocks.color,
        presidentId: politicalBlocks.presidentId,
      })
      .from(politicalBlocks)
      .where(eq(politicalBlocks.id, numericId))
      .limit(1)

    console.log("Resultado del bloque:", blockResult)

    if (!blockResult[0]) {
      console.log("Bloque no encontrado")
      return NextResponse.json({ error: "Bloque no encontrado" }, { status: 404 })
    }

    const block = blockResult[0]
    console.log("Bloque encontrado:", block)

    // Obtener el presidente si existe
    let president = null
    if (block.presidentId) {
      console.log("Buscando presidente con ID:", block.presidentId)
      const presidentResult = await db
        .select({
          id: councilMembers.id,
          name: councilMembers.name,
          position: councilMembers.position,
          seniorPosition: councilMembers.seniorPosition,
          imageUrl: councilMembers.imageUrl,
          createdAt: councilMembers.createdAt,
          updatedAt: councilMembers.updatedAt,
          blockId: councilMembers.blockId,
          mandate: councilMembers.mandate,
          bio: councilMembers.bio,
          isActive: councilMembers.isActive,
        })
        .from(councilMembers)
        .where(eq(councilMembers.id, block.presidentId))
        .limit(1)

      president = presidentResult[0] || null
      console.log("Presidente encontrado:", president)
    }

    // Obtener los miembros del bloque
    console.log("Buscando miembros del bloque")
    const members = await db
      .select({
        id: councilMembers.id,
        name: councilMembers.name,
        position: councilMembers.position,
        seniorPosition: councilMembers.seniorPosition,
        imageUrl: councilMembers.imageUrl,
        createdAt: councilMembers.createdAt,
        updatedAt: councilMembers.updatedAt,
        blockId: councilMembers.blockId,
        mandate: councilMembers.mandate,
        bio: councilMembers.bio,
        isActive: councilMembers.isActive,
      })
      .from(councilMembers)
      .where(eq(councilMembers.blockId, numericId))

    console.log("Miembros encontrados:", members.length)

    const response = {
      id: block.id,
      name: block.name,
      color: block.color,
      president,
      members,
    }

    console.log("Respuesta final:", response)

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error al obtener bloque:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { id: numericId, error } = await validateAdminAndId(request, id)
    if (error) return error

    // Desvincular a todos los concejales de este bloque
    await db
      .update(councilMembers)
      .set({ blockId: null })
      .where(eq(councilMembers.blockId, numericId))

    // Ahora sí, eliminar el bloque
    await db.delete(politicalBlocks).where(eq(politicalBlocks.id, numericId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar bloque:", error)
    return NextResponse.json({ error: "Error al eliminar bloque" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const { id: numericId, error } = await validateAdminAndId(request, id)
    if (error) return error

    const formData = await request.formData()
    const name = formData.get("name") as string
    const color = formData.get("color") as string
    const presidentIdStr = formData.get("presidentId") as string
    const presidentId = presidentIdStr === "-1" ? null : Number.parseInt(presidentIdStr)
    const miembrosStr = formData.get("miembros") as string
    const miembros = miembrosStr ? JSON.parse(miembrosStr) as number[] : []

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Actualizar el bloque
    await db
      .update(politicalBlocks)
      .set({
        name,
        color,
        presidentId,
      })
      .where(eq(politicalBlocks.id, numericId))

    // Primero, quitar todos los concejales de este bloque
    await db
      .update(councilMembers)
      .set({ blockId: null })
      .where(eq(councilMembers.blockId, numericId))

    // Luego, asignar los nuevos miembros
    if (miembros.length > 0) {
      await db
        .update(councilMembers)
        .set({ blockId: numericId })
        .where(inArray(councilMembers.id, miembros))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error actualizando bloque político:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}