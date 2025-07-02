import { db } from "@/lib/db-singleton"
import { activities } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function getAllActivities() {
  try {
    return await db.select().from(activities)
  } catch (error) {
    console.error("Error al obtener actividades:", error)
    return []
  }
}

export async function getActivityById(id: number) {
  try {
    const result = await db.select().from(activities).where(eq(activities.id, id))
    return result[0] || null
  } catch (error) {
    console.error("Error al obtener actividad:", error)
    return null
  }
}
