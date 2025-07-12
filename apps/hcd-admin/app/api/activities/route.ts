import { db } from "@/lib/db-singleton"
import { activities } from "@/lib/db/schema"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await db
      .select()
      .from(activities)
      .orderBy(activities.date)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ error: "Error al obtener las actividades" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Filtrar solo los campos válidos para la tabla
    const activityData = {
      title: body.title,
      description: body.description,
      location: body.location || null,
      date: new Date(body.date),
      imageUrl: body.imageUrl || null,
      isPublished: body.isPublished ?? true,
      enableNotifications: body.enableNotifications ?? true,
      notificationAdvance: body.notificationAdvance ?? "24",
      notificationEmails: body.notificationEmails || null,
      lastNotificationSent: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    // Validar campos obligatorios
    if (!activityData.title || !activityData.description || !activityData.date) {
      return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 })
    }

    const [newActivity] = await db.insert(activities).values(activityData).returning()
    return NextResponse.json(newActivity)
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json({ error: "Error al crear la actividad" }, { status: 500 })
  }
}