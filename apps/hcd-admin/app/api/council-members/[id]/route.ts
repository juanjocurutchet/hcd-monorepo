import { db } from "@/lib/db-singleton"
import { councilMembers } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const result = await db.select().from(councilMembers).where(eq(councilMembers.id, id)).limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: "Concejal no encontrado" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching council member:", error)
    return NextResponse.json({ error: "Error al obtener el concejal" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    const [updatedMember] = await db
      .update(councilMembers)
      .set(body)
      .where(eq(councilMembers.id, id))
      .returning()

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Error updating council member:", error)
    return NextResponse.json({ error: "Error al actualizar el concejal" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    await db.delete(councilMembers).where(eq(councilMembers.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting council member:", error)
    return NextResponse.json({ error: "Error al eliminar el concejal" }, { status: 500 })
  }
}