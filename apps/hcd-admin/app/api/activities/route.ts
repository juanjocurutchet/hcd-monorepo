import { db } from "@/lib/db-singleton"
import { activities } from "@/lib/db/schema"
import { and, eq, gte } from "drizzle-orm"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const showAll = url.searchParams.get('showAll') === 'true'
    const onlyPublished = url.searchParams.get('onlyPublished') !== 'false' // por defecto true
    
    // Obtener fecha actual en zona horaria de Argentina
    const nowUTC = new Date()
    const now = new Date(nowUTC.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }))
    
    let whereConditions = []
    
    // Filtrar solo actividades publicadas (por defecto)
    if (onlyPublished) {
      whereConditions.push(eq(activities.isPublished, true))
    }
    
    // Filtrar solo actividades futuras (por defecto, a menos que se especifique showAll)
    if (!showAll) {
      whereConditions.push(gte(activities.date, now))
    }
    
    const result = await db
      .select()
      .from(activities)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
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