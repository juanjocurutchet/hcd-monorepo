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

    // Convertir la fecha string a objeto Date
    const activityData = {
      ...body,
      date: new Date(body.date),
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const [newActivity] = await db.insert(activities).values(activityData).returning()
    return NextResponse.json(newActivity)
  } catch (error) {
    console.error("Error creating activity:", error)
    return NextResponse.json({ error: "Error al crear la actividad" }, { status: 500 })
  }
}