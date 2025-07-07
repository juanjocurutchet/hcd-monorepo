import { db } from "@/lib/db-singleton"
import { activities, activityParticipants } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const result = await db.select().from(activities).where(eq(activities.id, id)).limit(1)

    if (result.length === 0) {
      return NextResponse.json({ error: "Actividad no encontrada" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json({ error: "Error al obtener la actividad" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)
    const body = await request.json()

    // Convertir la fecha string a objeto Date si existe
    const updateData = {
      ...body,
      updatedAt: new Date()
    }

    if (body.date) {
      updateData.date = new Date(body.date)
    }

    const [updatedActivity] = await db
      .update(activities)
      .set(updateData)
      .where(eq(activities.id, id))
      .returning()

    return NextResponse.json(updatedActivity)
  } catch (error) {
    console.error("Error updating activity:", error)
    return NextResponse.json({ error: "Error al actualizar la actividad" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id)

    // Primero eliminar los participantes asociados
    await db.delete(activityParticipants).where(eq(activityParticipants.activityId, id))

    // Luego eliminar la actividad
    await db.delete(activities).where(eq(activities.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting activity:", error)
    return NextResponse.json({ error: "Error al eliminar la actividad" }, { status: 500 })
  }
}