import { db } from "@/lib/db-singleton"
import { councilMembers, politicalBlocks } from "@/lib/db/schema"
import { isAdmin } from "@/lib/utils/server-utils"
import { inArray } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verificar permisos
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const formData = await request.formData()
    const name = formData.get("name") as string
    const color = formData.get("color") as string
    const presidentIdStr = formData.get("presidentId") as string
    const presidentId = presidentIdStr === "-1" ? null : Number(presidentIdStr)
    const miembrosStr = formData.get("miembros") as string
    const miembros = miembrosStr ? JSON.parse(miembrosStr) as number[] : []

    if (!name) {
      return NextResponse.json({ error: "El nombre es requerido" }, { status: 400 })
    }

    // Crear el bloque
    const [nuevoBloque] = await db
      .insert(politicalBlocks)
      .values({
        name,
        presidentId,
        color,
      })
      .returning()

    // Asignar miembros al bloque
    if (miembros.length > 0) {
      await db
        .update(councilMembers)
        .set({ blockId: nuevoBloque.id })
        .where(inArray(councilMembers.id, miembros))
    }

    return NextResponse.json({ success: true, block: nuevoBloque })
  } catch (error) {
    console.error("Error creando bloque político:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}