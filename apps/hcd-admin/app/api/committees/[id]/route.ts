import { db } from "@/lib/db-singleton"
import { committeeMembers, committees, councilMembers } from "@/lib/db/schema"
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
      return NextResponse.json({ error: "Comisión no encontrada" }, { status: 404 })
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

    return NextResponse.json({ ...comision, miembros })
  } catch (error) {
    console.error("Error fetching committee:", error)
    return NextResponse.json({ error: "Error al obtener la comisión" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const [updatedCommittee] = await db
      .update(committees)
      .set(body)
      .where(eq(committees.id, id))
      .returning()

    return NextResponse.json(updatedCommittee)
  } catch (error) {
    console.error("Error updating committee:", error)
    return NextResponse.json({ error: "Error al actualizar la comisión" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Primero eliminar los miembros de la comisión
    await db.delete(committeeMembers).where(eq(committeeMembers.committeeId, id))

    // Luego eliminar la comisión
    await db.delete(committees).where(eq(committees.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting committee:", error)
    return NextResponse.json({ error: "Error al eliminar la comisión" }, { status: 500 })
  }
}