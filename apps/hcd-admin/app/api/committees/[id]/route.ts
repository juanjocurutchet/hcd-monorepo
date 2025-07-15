import { db } from "@/lib/db-singleton"
import { committeeMembers, committees, councilMembers, staff } from "@/lib/db/schema"
import { isAdmin } from "@/lib/utils/server-utils"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const result = await db.select().from(committees).where(eq(committees.id, id)).limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: "Comisión no encontrada" }, { status: 404, headers: { "Cache-Control": "no-store" } })
    }

    const comision = result[0]

    // Traer los miembros asociados
    const miembros = await db
      .select({
        id: committeeMembers.id,
        councilMemberId: committeeMembers.councilMemberId,
        name: councilMembers.name,
        position: councilMembers.position
      })
      .from(committeeMembers)
      .innerJoin(councilMembers, eq(committeeMembers.councilMemberId, councilMembers.id))
      .where(eq(committeeMembers.committeeId, id))

    // Mapear a formato seguro para el frontend
    const members = miembros.map(m => ({
      id: m.councilMemberId,
      name: m.name ?? ""
    }))

    // Traer el secretario/a del HCD si está presente
    let secretaryHcd = null
    if (comision && comision.secretaryHcdId) {
      const staffResult = await db.select().from(staff).where(eq(staff.id, comision.secretaryHcdId)).limit(1)
      if (staffResult.length > 0) {
        secretaryHcd = staffResult[0]
      }
    }

    return NextResponse.json({ ...comision, members, secretaryHcd }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error fetching committee:", error)
    return NextResponse.json({ error: "Error al obtener la comisión" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Cache-Control": "no-store" } })
    }
    const id = parseInt(params.id)
    const body = await request.json()
    // Solo incluir los campos válidos
    const updateData: any = {
      name: body.name,
      description: body.description,
      presidentId: body.presidentId,
      secretaryId: body.secretaryId,
      secretaryHcdId: body.secretaryHcdId,
      isActive: body.isActive,
    }
    const memberIds = Array.isArray(body.memberIds) ? body.memberIds : []
    const [updatedCommittee] = await db
      .update(committees)
      .set(updateData)
      .where(eq(committees.id, id))
      .returning()
    // Actualizar miembros: eliminar los actuales y agregar los nuevos
    await db.delete(committeeMembers).where(eq(committeeMembers.committeeId, id))
    if (memberIds.length > 0) {
      await db.insert(committeeMembers).values(
        memberIds.map((councilMemberId: number) => ({
          committeeId: id,
          councilMemberId: Number(councilMemberId),
        }))
      )
    }
    return NextResponse.json(updatedCommittee, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error updating committee:", error)
    return NextResponse.json({ error: "Error al actualizar la comisión" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403, headers: { "Cache-Control": "no-store" } })
    }
    const id = parseInt(params.id)

    // Primero eliminar los miembros de la comisión
    await db.delete(committeeMembers).where(eq(committeeMembers.committeeId, id))

    // Luego eliminar la comisión
    await db.delete(committees).where(eq(committees.id, id))

    return NextResponse.json({ success: true }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    console.error("Error deleting committee:", error)
    return NextResponse.json({ error: "Error al eliminar la comisión" }, { status: 500, headers: { "Cache-Control": "no-store" } })
  }
}